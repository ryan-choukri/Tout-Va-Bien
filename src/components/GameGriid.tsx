"use client";

import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { useState } from "react";
import level1 from "@/data/levels/level1.json";

type BoardState = {
  [cellId: string]: {
    location: string;
    characters: {
      id: string;
      position?: "left" | "right";
    }[];
  };
};

type Card = {
  id: string;
  label: string;
  type: string;
  slots?: {
    maxCharacters: number;
    positions?: string[];
  };
};

export default function GameGrid() {
  const [boardState, setBoardState] = useState<BoardState>({});
  const level = level1;

  const boardCells = Array.from({ length: level.cells }, (_, i) => `cell-${i + 1}`);
  const deckCharacterCards = level.cardsCaracter;
  const deckLocationCards = level.cardsPlace;

  // Configure sensors to fix drag velocity
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    const draggedInstanceId = String(active.id);
    const cardId = draggedInstanceId.split('-').slice(-1)[0];
    const sourceCellId = active.data.current?.cellId;
    const draggedPosition = active.data.current?.position;

    // If dropped outside any droppable area, remove from board
    if (!over) {
      if (sourceCellId) {
        removeCardFromBoard(sourceCellId, cardId);
      }
      return;
    }

    // Get target cell ID and position from over data
    let targetCellId = String(over.id);
    const targetPosition = over.data?.current?.position;
    
    // If dropped on a CharacterSlot, extract the cell ID
    if (targetPosition) {
      // The droppable ID is like "cell-1-left", extract "cell-1"
      const parts = targetCellId.split('-');
      if (parts.length >= 3) {
        targetCellId = parts.slice(0, 2).join('-'); // "cell-1"
      }
    }

    placeCardOnBoard(cardId, targetCellId, sourceCellId, targetPosition, draggedPosition);
  }

  
  function placeCardOnBoard(
  cardId: string, 
  targetCellId: string, 
  sourceCellId?: string,
  targetPosition?: "left" | "right",
  draggedPosition?: "left" | "right"
) {
  const cardType = getCardType(cardId);

  setBoardState((prevBoard) => {
    // Deep clone to avoid mutation issues
    const updatedBoard: BoardState = JSON.parse(JSON.stringify(prevBoard));

    // ─────────────────────────────────────────────
    // MOVE LOCATION BETWEEN CELLS
    // ─────────────────────────────────────────────
    if (cardType === "location" && sourceCellId && sourceCellId !== targetCellId) {
      const sourceCell = updatedBoard[sourceCellId];
      const sourceCharacters = sourceCell?.characters || [];

      // Remove source cell entirely
      delete updatedBoard[sourceCellId];

      const locationCard = getCardDetails(cardId) as Card;
      const maxCharacters = locationCard?.slots?.maxCharacters || 99;

      const existingCharacters = updatedBoard[targetCellId]?.characters || [];
      const allCharacters = [...sourceCharacters, ...existingCharacters].slice(0, maxCharacters);

      updatedBoard[targetCellId] = {
        location: cardId,
        characters: allCharacters
      };

      return updatedBoard;
    }

    // ─────────────────────────────────────────────
    // PLACE NEW LOCATION FROM DECK
    // ─────────────────────────────────────────────
    if (cardType === "location" && !sourceCellId) {
      const locationCard = getCardDetails(cardId) as Card;
      const maxCharacters = locationCard?.slots?.maxCharacters || 99;

      const existingCharacters = updatedBoard[targetCellId]?.characters || [];

      updatedBoard[targetCellId] = {
        location: cardId,
        characters: existingCharacters.slice(0, maxCharacters)
      };

      return updatedBoard;
    }

    // ─────────────────────────────────────────────
    // CHARACTER LOGIC
    // ─────────────────────────────────────────────
    if (cardType === "character") {
      // Check if target cell has a location
      if (!updatedBoard[targetCellId]?.location) {
        console.log("⛔ No location in target cell");
        return updatedBoard;
      }

      const locationCard = getCardDetails(updatedBoard[targetCellId].location) as Card;
      const maxCharacters = locationCard?.slots?.maxCharacters || 99;
      const hasPositions = !!locationCard?.slots?.positions?.length;

      // ─────────────────────────────────────────────
      // CASE 1: Moving within SAME CELL (changing position)
      // ─────────────────────────────────────────────
      if (sourceCellId === targetCellId && hasPositions && targetPosition) {
        // Remove character being moved
        let newCharacters = updatedBoard[targetCellId].characters.filter(
          char => char.id !== cardId
        );

        // Remove any character already in target position
        newCharacters = newCharacters.filter(
          char => char.position !== targetPosition
        );

        // Add character at new position
        newCharacters.push({ id: cardId, position: targetPosition });

        updatedBoard[targetCellId].characters = newCharacters;

        return updatedBoard;
      }

      // ─────────────────────────────────────────────
      // CASE 2: Moving from DIFFERENT CELL or DECK
      // ─────────────────────────────────────────────
      
      // Step 1: Remove from source cell if exists
      if (sourceCellId && updatedBoard[sourceCellId]) {
        updatedBoard[sourceCellId].characters = updatedBoard[sourceCellId].characters.filter(
          char => char.id !== cardId
        );

        // Clean up empty source cell
        if (!updatedBoard[sourceCellId].location && updatedBoard[sourceCellId].characters.length === 0) {
          delete updatedBoard[sourceCellId];
        }
      }

      // Step 2: Add to target cell
      if (hasPositions) {
        // With positions (left/right)
        let newCharacters = [...updatedBoard[targetCellId].characters];

        // Determine final position
        let finalPosition: "left" | "right";

        if (targetPosition) {
          // Dropped on specific position - remove existing character there
          newCharacters = newCharacters.filter(char => char.position !== targetPosition);
          finalPosition = targetPosition;
        } else {
          // Auto-assign position
          const occupiedPositions = newCharacters.map(c => c.position);
          if (!occupiedPositions.includes("left")) {
            finalPosition = "left";
          } else if (!occupiedPositions.includes("right")) {
            finalPosition = "right";
          } else {
            // No free position
            return updatedBoard;
          }
        }

        newCharacters.push({ id: cardId, position: finalPosition });
        updatedBoard[targetCellId].characters = newCharacters;

      } else {
        // Without positions (single slot)
        const currentCount = updatedBoard[targetCellId].characters.length;

        if (currentCount < maxCharacters) {
          updatedBoard[targetCellId].characters.push({ id: cardId, position: undefined });
        } else {
          // Replace existing
          updatedBoard[targetCellId].characters = [{ id: cardId, position: undefined }];
        }
      }

      return updatedBoard;
    }

    return updatedBoard;
  });
}


  function removeCardFromBoard(cellId: string, cardId: string) {
    const cardType = getCardType(cardId);
    
    setBoardState((prevBoard) => {
      const updatedBoard = { ...prevBoard };
      
      if (updatedBoard[cellId]) {
        if (cardType === "location") {
          // Remove entire cell
          delete updatedBoard[cellId];
        } else {
          // Remove character
          updatedBoard[cellId].characters = updatedBoard[cellId].characters.filter(
            (char) => char.id !== cardId
          );
          
          // Clean up if no location and no characters
          if (!updatedBoard[cellId].location && updatedBoard[cellId].characters.length === 0) {
            delete updatedBoard[cellId];
          }
        }
      }

      return updatedBoard;
    });
  }

  function getCardDetails(cardId: string): Card | undefined {
    return [...deckCharacterCards, ...deckLocationCards].find(c => c.id === cardId);
  }

  function getCardType(cardId: string): "location" | "character" {
    return deckLocationCards.some(c => c.id === cardId) ? "location" : "character";
  }

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <h2 className="text-white text-lg mb-2 text-center">{level.title}</h2>
      
      {/* Board Grid */}
      <div className="grid grid-cols-3 gap-2 p-4">
        {boardCells.map((cellId) => {
          const cellData = boardState[cellId];
          const location = cellData?.location ? getCardDetails(cellData.location) : null;
          const characters = cellData?.characters || [];
          const hasPositions = location?.slots?.positions && location.slots.positions.length > 0;
          
          return (
            <BoardCell key={cellId} id={cellId}>
              {location ? (
                <LocationCard
                  instanceId={`${cellId}-${location.id}`}
                  cardId={location.id}
                  cellId={cellId}
                >
                  <div className="w-full">
                    {/* Location Label */}
                    <div className="text-sm font-semibold mb-2 text-center border-b border-green-500 pb-1">
                      {location.label}
                      <span className="text-xs ml-2 opacity-75">
                        ({characters.length}/{location.slots?.maxCharacters || "∞"})
                      </span>
                    </div>
                    
                    {/* Characters Section */}
                    {hasPositions ? (
                      <div className="flex justify-between gap-2 min-h-[4rem]">
                        {/* Left Position */}
                        <CharacterSlot 
                          cellId={cellId} 
                          position="left"
                          character={characters.find(c => c.position === "left")}
                        />
                        
                        {/* Right Position */}
                        <CharacterSlot 
                          cellId={cellId} 
                          position="right"
                          character={characters.find(c => c.position === "right")}
                        />
                      </div>
                    ) : (
                      <div className="flex gap-1 flex-wrap justify-center min-h-[3rem]">
                        {characters.map((char) => {
                          const card = getCardDetails(char.id);
                          
                          return (
                            <CharacterCard 
                              key={`${cellId}-${char.id}`}
                              instanceId={`${cellId}-${char.id}`}
                              cardId={char.id}
                              cellId={cellId}
                            >
                              {card?.label || char.id}
                            </CharacterCard>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </LocationCard>
              ) : (
                <div className="w-full text-center text-gray-400 text-xs h-full flex items-center justify-center">
                  Drop a location here
                </div>
              )}
            </BoardCell>
          );
        })}
      </div>

      {/* Deck - Always visible */}
      <div className="flex gap-4 mt-6 justify-center flex-wrap p-4 bg-gray-800 rounded">
        <h3 className="w-full text-center text-white text-sm mb-2">Available Cards</h3>
        
        {deckLocationCards.map((card: Card) => (
          <DeckCard 
            key={`deck-${card.id}`} 
            instanceId={`deck-${card.id}`}
            cardId={card.id}
            type="location"
          >
            {card.label}
          </DeckCard>
        ))}
        
        {deckCharacterCards.map((card: Card) => (
          <DeckCard 
            key={`deck-${card.id}`} 
            instanceId={`deck-${card.id}`}
            cardId={card.id}
            type="character"
          >
            {card.label}
          </DeckCard>
        ))}
      </div>
    </DndContext>
  );
}

function CharacterSlot({ 
  cellId, 
  position, 
  character 
}: { 
  cellId: string; 
  position: "left" | "right";
  character?: { id: string; position?: "left" | "right" };
}) {
  const { isOver, setNodeRef } = useDroppable({ 
    id: `${cellId}-${position}`,
    data: { position, cellId }
  });

  const getCardDetails = (cardId: string) => {
    const allCards = [...level1.cardsCaracter, ...level1.cardsPlace];
    return allCards.find(c => c.id === cardId);
  };

  const card = character ? getCardDetails(character.id) : null;
  
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 border-2 border-dashed rounded p-1 min-h-[3.5rem] flex items-center justify-center ${
        isOver ? "border-blue-400 bg-blue-900/30" : "border-gray-500"
      } transition-all`}
    >
      {character ? (
        <CharacterCard 
          instanceId={`${cellId}-${character.id}-${position}`}
          cardId={character.id}
          cellId={cellId}
          position={position}
        >
          {card?.label || character.id}
        </CharacterCard>
      ) : (
        <span className="text-xs text-gray-500 capitalize">{position}</span>
      )}
    </div>
  );
}

function BoardCell({ id, children }: { id: string; children?: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div
      ref={setNodeRef}
      className={`min-h-40 border-2 border-gray-600 rounded flex flex-col p-1 ${
        isOver ? "border-green-500 bg-gray-600" : "bg-gray-700"
      } text-white transition-all`}
    >
      {children}
    </div>
  );
}

function LocationCard({ 
  instanceId, 
  cardId,
  children, 
  cellId 
}: { 
  instanceId: string;
  cardId: string;
  children: React.ReactNode; 
  cellId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: instanceId, 
    data: { cellId, cardId } 
  });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-green-600 text-white w-full p-3 rounded cursor-grab active:cursor-grabbing select-none transition-opacity touch-none"
    >
      {children}
    </div>
  );
}

function CharacterCard({ 
  instanceId, 
  cardId,
  children, 
  cellId,
  position
}: { 
  instanceId: string;
  cardId: string;
  children: React.ReactNode; 
  cellId: string;
  position?: "left" | "right";
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: instanceId, 
    data: { cellId, cardId, position } 
  });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-blue-600 text-white w-16 h-12 text-xs flex items-center justify-center rounded cursor-grab active:cursor-grabbing select-none transition-opacity border-2 border-blue-400 touch-none"
    >
      {children}
    </div>
  );
}

function DeckCard({ 
  instanceId, 
  cardId,
  children, 
  type
}: { 
  instanceId: string;
  cardId: string;
  children: React.ReactNode; 
  type: "location" | "character";
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: instanceId, 
    data: { cardId, cellId: undefined } 
  });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const bgColor = type === "location" ? "bg-green-600" : "bg-blue-600";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${bgColor} text-white w-20 h-14 text-xs flex items-center justify-center rounded cursor-grab active:cursor-grabbing select-none transition-opacity border-2 touch-none ${
        type === "location" ? "border-green-400" : "border-blue-400"
      }`}
    >
      {children}
    </div>
  );
}