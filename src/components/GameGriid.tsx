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
import levelData from "@/data/levels/level2.json";

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

type Level = {
  id: string;
  title: string;
  cells: number;
  cardsCaracter: Card[];
  cardsPlace: Card[];
  victoryStates: BoardState[];
};

type DebugJSONProps = {
  data: BoardState;
};

type VictoryStatus= {
  achieved: boolean;          // true si une condition de victoire est atteinte
  index?: number;             // index du tableau victoryStates correspondant
  matchedState?: BoardState;  // l'état du board qui a déclenché la victoire
};

type VictoryStateDisplayProps = {
  victoryState: {
    achieved: boolean;
    index?: number;
    matchedState?: BoardState;
  };
};

const level: Level = levelData as Level;


const VictoryStateDisplay = ({ victoryState }: VictoryStateDisplayProps) => {
  if (!victoryState.achieved) return null;

  return (
    <div className="p-2 bg-green-900 text-white rounded text-xs font-mono mt-2">
      Victory! Condition #{victoryState.index !== undefined ? victoryState.index + 1 : ''} matched.
      <pre className="overflow-auto max-h-[20vh]">{JSON.stringify(victoryState.matchedState, null, 2)}</pre>
    </div>
  );
}

const VictoriesSetToDebug = ({ levelVictories, setBoardState }: { levelVictories: BoardState[], setBoardState: React.Dispatch<React.SetStateAction<BoardState>> }) => {
    return (
        <div className="mt-4 mx-4">
            <h3 className="text-white text-sm mb-2">Defined Victory Conditions:</h3>
            {levelVictories.map((victory, index) => {
            return (
                <div key={index}>
                           <button
                        className="mt-2 px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition"
                        onClick={() => setBoardState(JSON.parse(JSON.stringify(victory)))}
                    >
                        Set as Board State
                    </button>
                <div  className="mb-4 p-2 bg-gray-900 text-green-400 rounded font-mono text-xs overflow-auto max-h-[30vh]">
                    <div className="mb-2 font-semibold">Victory Condition #{index + 1}:</div>
                    <pre>
                        {JSON.stringify(victory, null, 2)}
                    </pre>
                    </div>
             
                </div>)})}
        </div>
    );
}

const DebugJSON = ({ data }: DebugJSONProps) => {
  const [showJSON, setShowJSON] = useState(false);
  return (
    <div className="mt-4 mx-4">
      {/* Affichage compact */}
      <pre className="p-2 rounded bg-black text-green-400 text-[10px] overflow-auto font-mono">
        {Object.entries(data)
          .map(([cellId, cellData]) => {
            const chars = cellData?.characters
              .map((c: BoardState[string]["characters"][number]) => `${c.id}${c.position ? `:${c.position}` : ""}`)
              .join(", ");
            return `${cellId} → ${cellData?.location || "empty"} [${chars}]`;
          })
          .join("\n")}
      </pre>

      {/* Bouton toggle JSON complet */}
      <div className="mt-2">
        <button
          className="mb-2 px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition"
          onClick={() => setShowJSON(!showJSON)}
        >
          {showJSON ? "Hide BoardState JSON" : "Display BoardState JSON"}
        </button>

        {showJSON && (
          <div
            className="p-2 bg-gray-900 text-green-400 rounded font-mono text-xs overflow-auto max-h-[30vh] select-all"
          >
            {JSON.stringify(data, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}

function areCharactersEqual(
  a: { id: string; position?: "left" | "right" }[], 
  b: { id: string; position?: "left" | "right" }[]
) {
  // Vérifie si les tableaux ont la même longueur
  // Si le nombre de personnages est différent, ils ne peuvent pas être identiques
  if (a.length !== b.length) return false;

  // On clone et on trie les tableaux pour s'assurer que l'ordre des personnages
  // n'affecte pas la comparaison. On concatène id + position pour créer une "clé" unique
  const sortedA = [...a].sort((x, y) => (x.id + x.position) > (y.id + y.position) ? 1 : -1);
  const sortedB = [...b].sort((x, y) => (x.id + x.position) > (y.id + y.position) ? 1 : -1);

  // Chaque personnage dans le tableau trié A doit correspondre exactement
  // au personnage à la même position dans le tableau trié B
  // On compare à la fois l'id et la position pour être précis
  return sortedA.every((char, index) => 
    char.id === sortedB[index].id && char.position === sortedB[index].position
  );
}


// Fonction de check de victoire
function checkVictory(boardState: BoardState): number {
  // Parcours toutes les conditions de victoire
  for (const victoryState of level.victoryStates) {
    let matched = true;
    let currentVictoryIndex = -1;

    for (const cellId in victoryState) {
        const target = victoryState[cellId];
        const current = boardState[cellId];

        // Si la cellule n’existe pas ou n’a pas la même location → pas ok
        if (!current || current.location !== target.location) {
            matched = false;
            currentVictoryIndex = level.victoryStates.indexOf(victoryState);
            break;
        }

        // Vérifie que les personnages sont identiques
        if (!areCharactersEqual(target.characters, current.characters || [])) {
            matched = false;
            currentVictoryIndex = level.victoryStates.indexOf(victoryState);
            break;
        }
        currentVictoryIndex = level.victoryStates.indexOf(victoryState);
        }

    if (matched) {
      return currentVictoryIndex; // une condition de victoire est atteinte
    }
  }

  return -1; // aucune condition de victoire atteinte
}



export default function GameGrid() {
  const [boardState, setBoardState] = useState<BoardState>({});
  const [victoryState, setVictoryState] = useState<VictoryStatus>({
  achieved: false,
  index: undefined,
  matchedState: undefined,
});
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
    
    // Get card ID from data instead of parsing the instance ID
    const cardId = active.data.current?.cardId;
    const sourceCellId = active.data.current?.cellId;
    const draggedPosition = active.data.current?.position;

    if (!cardId) {
      console.log("⛔ No cardId found in drag data");
      return;
    }

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

      // If dropping on a cell with no location, remove the character
      //only if the card being dragged is a character
    if (
        active.data.current?.cardId &&
        active.data.current?.cellId &&
        (!boardState[targetCellId] || !boardState[targetCellId].location) &&
        getCardType(cardId) === "character" 
    ) {
        removeCardFromBoard(sourceCellId, cardId);
        return;
    }


    const newBoard = placeCardOnBoard(cardId, targetCellId, sourceCellId, targetPosition);
    // Après chaque action, tu peux faire
    const currentVictoryIndex = checkVictory(newBoard); // ta fonction retourne l'index ou -1
    console.log(currentVictoryIndex);
    if (currentVictoryIndex !== -1) {
    setVictoryState({ achieved: true, index: currentVictoryIndex });
    } else {
    setVictoryState({ achieved: false, index: undefined });
    }
  }

  function placeCardOnBoard(
  cardId: string, 
  targetCellId: string, 
  sourceCellId?: string,
  targetPosition?: "left" | "right"
) {
  const cardType = getCardType(cardId);
  let returnedBoard: BoardState = {};

  setBoardState((prevBoard) => {
    const updatedBoard: BoardState = JSON.parse(JSON.stringify(prevBoard));

    // ─────────────────────────────────────────────
    // MOVE LOCATION BETWEEN CELLS
    // ─────────────────────────────────────────────
    if (cardType === "location" && sourceCellId && sourceCellId !== targetCellId) {
        console.log('PASSAGE DANS LE SWAP !');

      const sourceCell = updatedBoard[sourceCellId];
      const sourceCharacters = sourceCell?.characters || [];
       
      delete updatedBoard[sourceCellId];

      const locationCard = getCardDetails(cardId) as Card;
      const maxCharacters = locationCard?.slots?.maxCharacters || 99;

      // Take characters from source cell up to maxCharacters
      const allCharacters = [...sourceCharacters].slice(0, maxCharacters);
      const targetCell = updatedBoard[targetCellId];

      if(targetCell) {
          updatedBoard[sourceCellId] = targetCell;
      }

      updatedBoard[targetCellId] = {
        location: cardId,
        characters: allCharacters
      };

      returnedBoard = updatedBoard;
      return returnedBoard;
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

      returnedBoard = updatedBoard;
      return returnedBoard;
    }

    // ─────────────────────────────────────────────
    // CHARACTER LOGIC
    // ─────────────────────────────────────────────
    if (cardType === "character") {
      // No location in target cell: do nothing
      if (!updatedBoard[targetCellId]?.location) return updatedBoard;

      const locationCard = getCardDetails(updatedBoard[targetCellId].location) as Card;
      const maxCharacters = locationCard?.slots?.maxCharacters || 99;
      const hasPositions = !!locationCard?.slots?.positions?.length;

      // Remove from source cell if needed
      if (sourceCellId && updatedBoard[sourceCellId]) {
        updatedBoard[sourceCellId].characters = updatedBoard[sourceCellId].characters.filter(
          char => char.id !== cardId
        );
        if (
          !updatedBoard[sourceCellId].location &&
          updatedBoard[sourceCellId].characters.length === 0
        ) {
          delete updatedBoard[sourceCellId];
        }
      }

      if (hasPositions) {
        // 🔑 POUR LES LOCATIONS AVEC POSITIONS: ON DOIT AVOIR UNE POSITION SPÉCIFIQUE
        if (!targetPosition) {
          // Si pas de position spécifique (drop sur la location générale), ne rien faire
          console.log("❌ Location has positions, but no specific position targeted");
            returnedBoard = updatedBoard;
            return returnedBoard;
        }

        // Remove any character in the target position AND the dragged character
        const newCharacters = updatedBoard[targetCellId].characters.filter(
          char => char.position !== targetPosition && char.id !== cardId
        );

        // Add the character at the specified position ONLY
        newCharacters.push({ id: cardId, position: targetPosition });
        updatedBoard[targetCellId].characters = newCharacters;
        if (!updatedBoard[targetCellId].location && (!updatedBoard[targetCellId].characters || updatedBoard[targetCellId].characters.length === 0)) {
            delete updatedBoard[targetCellId];
        }
      } else {
        // No positions: allow free placement up to maxCharacters
        let newCharacters = updatedBoard[targetCellId].characters.filter(
          char => char.id !== cardId
        );
        if (newCharacters.length < maxCharacters) {
          newCharacters.push({ id: cardId, position: undefined });
        } else {
          newCharacters = [{ id: cardId, position: undefined }];
        }
        updatedBoard[targetCellId].characters = newCharacters;
        if (!updatedBoard[targetCellId].location && (!updatedBoard[targetCellId].characters || updatedBoard[targetCellId].characters.length === 0)) {
            delete updatedBoard[targetCellId];
        }
      }

      returnedBoard = updatedBoard;
      return returnedBoard;
    }

      returnedBoard = updatedBoard;
      return returnedBoard;
  });
  return returnedBoard;
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

  console.log(boardState);
  
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
                    <div className="text-xs font-semibold mb-2 text-center border-b border-gray-500 ">
                      {location.label}
                      <span className="text-xs ml-2 opacity-75">
                        ({characters.length}/{location.slots?.maxCharacters || "∞"})
                      </span>
                    </div>
                    
                    {/* Characters Section */}
                    {hasPositions ? (
                      <div className="flex justify-between gap-2 min-h-[3rem]">
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
                      <div className="flex gap-1 flex-wrap justify-center min-h-[2rem]">
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
      <div className="flex gap-4 mt-2 justify-center flex-wrap m-4 p-3 deck rounded">
        {/* <h3 className="w-full text-center text-white text-sm mb-2">Available Cards</h3> */}
        
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
      <div className="m-4 p-3 bg-gray-800 rounded space-y-2">

        <VictoryStateDisplay victoryState={victoryState} />

         <DebugJSON data={boardState} />

        <VictoriesSetToDebug setBoardState={setBoardState}
        levelVictories={level.victoryStates} />
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
    const allCards = [...level.cardsCaracter, ...level.cardsPlace];
    return allCards.find(c => c.id === cardId);
  };

  const card = character ? getCardDetails(character.id) : null;
  
  return (
    <div
      ref={setNodeRef}
      className={`flex-1  rounded p-1 min-h-[3.5rem] flex items-center justify-center transition-all`}
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
      className={`min-h-[7rem] cells rounded flex flex-col p-1 ${
        isOver ? " hover-bord-cells" : "bord-cells"
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
      className="min-h-[6rem] card-location-board text-white w-full p-3 rounded cursor-grab active:cursor-grabbing select-none transition-opacity touch-none"
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
      className="card-character-board text-white w-16 h-12 text-xs flex items-center justify-center rounded cursor-grab active:cursor-grabbing select-none transition-opacity  touch-none"
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

  const bgColor = type === "location" ? "card-location-deck" : "card-character-deck";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${bgColor} text-white w-20 h-14 text-xs flex items-center justify-center rounded cursor-grab active:cursor-grabbing select-none transition-opacity  touch-none`}
    >
      {children}
    </div>
  );
};