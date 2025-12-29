'use client';

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { CharacterSlot } from './components/CharacterSlot';
import { CharacterCard } from './components/CharacterCard';
import { LocationCard } from './components/LocationCard';
import { DisplayCardImg } from './components/DisplayCardImg';
import { BoardCell } from './components/BoardCell';
import { DeckCard } from './components/DeckCard';
import { DebugJSON } from './components/DebugJSON';
import { useState, useEffect } from 'react';
// import levelData from "@/data/levels/level2.json";

import {
  BoardState,
  Card,
  Level,
  VictoryStatus,
  VictoryStateDisplayProps,
} from '@/components/types';

type VictoryCheckResult = {
  location: boolean;
  characters: boolean;
};

// const level: Level = levelData as Level;

const VictoryStateDisplay = ({ victoryState }: VictoryStateDisplayProps) => {
  if (!victoryState.achieved) return null;

  return (
    <div className="mt-2 rounded bg-green-900 p-2 font-mono text-xs text-white">
      Victory! Condition #{victoryState.index !== undefined ? victoryState.index + 1 : ''} matched.
      <pre className="max-h-[5vh] overflow-auto">
        {JSON.stringify(victoryState.matchedState, null, 2)}
      </pre>
    </div>
  );
};

const VictoriesSetToDebug = ({
  levelVictories,
  setBoardState,
}: {
  levelVictories: BoardState[];
  setBoardState: React.Dispatch<React.SetStateAction<BoardState>>;
}) => {
  return (
    <div className="mx-2 mt-4">
      <h3 className="mb-2 text-sm text-white">Defined Victory Conditions:</h3>
      {levelVictories.map((victory, index) => {
        return (
          <div key={index}>
            <button
              className="mt-2 rounded bg-gray-700 px-3 py-1 text-xs text-white transition hover:bg-gray-600"
              onClick={() => setBoardState(JSON.parse(JSON.stringify(victory)))}>
              Set this as Board State
            </button>
            <div className="mb-4 max-h-[15vh] overflow-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400">
              <div className="mb-2 font-semibold">Victory Condition #{index + 1}:</div>
              <pre>{JSON.stringify(victory, null, 2)}</pre>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LocationCardContent = ({
  location,
  characters,
  hasPositions,
  level,
  cellId,
  getCardDetails,
}: {
  location: Card;
  characters: { id: string; position?: 'left' | 'right' }[];
  hasPositions: boolean;
  level?: Level;
  cellId?: string;
  getCardDetails: (id: string) => Card | undefined;
}) => {
  return (
    <div className="w-full">
      {/* Location Label */}
      <div className="mx-4 mb-2 border-b border-gray-500 text-center text-xs font-semibold text-nowrap">
        {DisplayCardImg({ card: location })}
        <span className="ml-2 text-xs opacity-75">
          ({characters.length}/{location.slots?.maxCharacters || '∞'})
        </span>
      </div>

      {/* Characters Section */}
      {hasPositions ? (
        <div className="mt-5 flex min-h-[2rem] justify-between gap-2">
          {/* Left Position */}
          {level && cellId ? (
            <CharacterSlot
              type={characters.length > 0 ? 'character' : 'location'}
              level={level}
              cellId={cellId}
              position="left"
              character={characters.find((c) => c.position === 'left')}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              {characters.find((c) => c.position === 'left') ? (
                <div className="card-character-board flex h-10 w-14 items-center justify-center rounded text-xs text-white">
                  {DisplayCardImg({
                    styleForImage: { height: 54, width: 54 },
                    card: getCardDetails(characters.find((c) => c.position === 'left')!.id),
                  })}
                </div>
              ) : (
                <span className="text-xs text-gray-500">L</span>
              )}
            </div>
          )}

          {/* Right Position */}
          {level && cellId ? (
            <CharacterSlot
              type={characters.length > 0 ? 'character' : 'location'}
              level={level}
              cellId={cellId}
              position="right"
              character={characters.find((c) => c.position === 'right')}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              {characters.find((c) => c.position === 'right') ? (
                <div className="card-character-board flex h-10 w-14 items-center justify-center rounded text-xs text-white">
                  {DisplayCardImg({
                    styleForImage: { height: 54, width: 54 },
                    card: getCardDetails(characters.find((c) => c.position === 'right')!.id),
                  })}
                </div>
              ) : (
                <span className="text-xs text-gray-500">R</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 flex min-h-[2rem] flex-wrap justify-center gap-1">
          {characters.map((char) => {
            const card = getCardDetails(char.id);
            return level && cellId ? (
              <CharacterCard
                key={`${cellId}-${char.id}`}
                instanceId={`${cellId}-${char.id}`}
                cardId={char.id}
                cellId={cellId}>
                {DisplayCardImg({ styleForImage: { height: 54, width: 54 }, card: card })}
              </CharacterCard>
            ) : (
              <div
                key={char.id}
                className="card-character-board flex h-10 w-14 items-center justify-center rounded text-xs text-white">
                {DisplayCardImg({ styleForImage: { height: 54, width: 54 }, card: card })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function areCharactersEqual(
  a: { id: string; position?: 'left' | 'right' }[],
  b: { id: string; position?: 'left' | 'right' }[]
) {
  // Vérifie si les tableaux ont la même longueur
  // Si le nombre de personnages est différent, ils ne peuvent pas être identiques
  if (a.length !== b.length) return false;

  // On clone et on trie les tableaux pour s'assurer que l'ordre des personnages
  // n'affecte pas la comparaison. On concatène id + position pour créer une "clé" unique
  const sortedA = [...a].sort((x, y) => (x.id + x.position > y.id + y.position ? 1 : -1));
  const sortedB = [...b].sort((x, y) => (x.id + x.position > y.id + y.position ? 1 : -1));

  // Chaque personnage dans le tableau trié A doit correspondre exactement
  // au personnage à la même position dans le tableau trié B
  // On compare à la fois l'id et la position pour être précis
  return sortedA.every(
    (char, index) => char.id === sortedB[index].id && char.position === sortedB[index].position
  );
}

// Fonction de check de victoire
function checkVictory({ boardState, level }: { boardState: BoardState; level: Level }): {
  victoryIndex: number;
  arrayOfVictoryPos: VictoryCheckResult[][];
} {
  // Parcours toutes les conditions de victoire
  let currentVictoryIndex = -1;
  const arrayOfVictoryPos: VictoryCheckResult[][] = [];
  for (const victoryState of level.victoryStates) {
    let matched = true;
    // closeVictoryIndex is an array set with index as number of index
    console.log('-----------PASSAGE POUR EACHH---------');

    const countPlacementErrors =
      () =>
      ([vicKey, val]: [
        string,
        {
          location: string;
          characters: { id: string; position?: string }[];
        },
      ]) => {
        const isLocationMatch = boardState[vicKey] && boardState[vicKey].location === val.location;
        const isCharacterMatch = val.characters.some(
          (vicChar) =>
            (boardState[vicKey]?.characters &&
              boardState[vicKey].characters.some(
                (boardChar) =>
                  boardChar.id === vicChar.id && boardChar.position === vicChar.position
              )) ||
            false
        );
        return { location: isLocationMatch || false, characters: isCharacterMatch };
      };

    arrayOfVictoryPos.push(Object.entries(victoryState).map(countPlacementErrors()));
    // .reduce((a, b) => (b ? a + 1 : a), 0);

    for (const cellId in victoryState) {
      const target = victoryState[cellId];
      const current = boardState[cellId];

      // Si la cellule n’existe pas ou n’a pas la même location → pas ok
      if (!current || current.location !== target.location) {
        matched = false;
        currentVictoryIndex = level.victoryStates.indexOf(victoryState);
        break;
        // ++closeVictoryIndex[level.victoryStates.indexOf(victoryState)];
      }
      // Vérifie que les personnages sont identiques
      if (!areCharactersEqual(target.characters, current.characters || [])) {
        matched = false;
        // ++closeVictoryIndex[level.victoryStates.indexOf(victoryState)];
        currentVictoryIndex = level.victoryStates.indexOf(victoryState);
        break;
      }
      currentVictoryIndex = level.victoryStates.indexOf(victoryState);
    }

    if (matched) {
      break; // une condition de victoire est atteinte
    }
    currentVictoryIndex = -1;
  }

  return { victoryIndex: currentVictoryIndex, arrayOfVictoryPos }; // aucune condition de victoire atteinte
}

export default function GameGrid({
  showDebug,
  levels,
  levelData,
  isCreate,
  onProposerClick,
  onBoardStateChange,
  hasChanges,
}: {
  showDebug?: boolean;
  levels: Level[];
  levelData: Level;
  isCreate?: boolean;
  onProposerClick?: (title: string, boardState: Level) => void;
  onBoardStateChange?: (hasChanges: boolean) => void;
  hasChanges?: boolean;
}) {
  const level: Level = levelData;
  const [boardState, setBoardState] = useState<BoardState>({});
  const [initialBoardState] = useState<BoardState>({});
  const [, setActiveId] = useState<string | null>(null);
  //SET showDebug defaut value link to the envoironnement variable
  //process.env if its in prod or dev

  const [activeCard, setActiveCard] = useState<{
    id: string;
    type: 'location' | 'character';
    label: string;
    cellData?: BoardState[string]; // Add this
  } | null>(null);

  const [customTitle, setCustomTitle] = useState<string>(level.title);
  useEffect(() => {
    if (level.isUserCreated) {
      setBoardState(level.victoryStates[0] || {});
    }
  }, [level.isUserCreated, level.victoryStates]);

  // Detect board state changes
  useEffect(() => {
    const hasChanges = JSON.stringify(boardState) !== JSON.stringify(initialBoardState);
    onBoardStateChange?.(hasChanges);
  }, [boardState, initialBoardState, onBoardStateChange]);

  const [victoryState, setVictoryState] = useState<VictoryStatus>({
    achieved: false,
    index: undefined,
    matchedState: undefined,
    nbOferrors: 0,
  });
  const boardCells = Array.from({ length: level.cells }, (_, i) => `cell-${i + 1}`);
  const deckCharacterCards = level.cardsCaracter;
  const deckLocationCards = level.cardsPlace;

  // Configure sensors to fix drag velocity
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
        delay: 50,
      },
    })
  );

  // Update the drag start handler to capture more information
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const cardId = active.data.current?.cardId;
    const sourceCellId = active.data.current?.cellId;

    if (cardId) {
      setActiveId(String(active.id));
      const cardDetails = getCardDetails(cardId);
      const cardType = getCardType(cardId);

      if (cardDetails) {
        // For locations, capture the complete cell data
        if (cardType === 'location' && sourceCellId && boardState[sourceCellId]) {
          setActiveCard({
            id: cardId,
            type: cardType,
            label: cardDetails.label,
            cellData: boardState[sourceCellId], // Include the complete cell data
          });
        } else {
          setActiveCard({
            id: cardId,
            type: cardType,
            label: cardDetails.label,
          });
        }
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Get card ID from data instead of parsing the instance ID
    const cardId = active.data.current?.cardId;
    const sourceCellId = active.data.current?.cellId;
    // const draggedPosition = active.data.current?.position;

    if (!cardId) {
      console.log('⛔ No cardId found in drag data');
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
      getCardType(cardId) === 'character'
    ) {
      removeCardFromBoard(sourceCellId, cardId);
      return;
    }

    const newBoard = placeCardOnBoard(cardId, targetCellId, sourceCellId, targetPosition);
    // Après chaque action, tu peux faire
    const { victoryIndex, arrayOfVictoryPos } = checkVictory({ boardState: newBoard, level }); // ta fonction retourne l'index ou -1
    if (victoryIndex !== -1) {
      setVictoryState({ achieved: true, index: victoryIndex, nbOferrors: 0 });
    } else {
      console.log(arrayOfVictoryPos);
      const totalOfGoodPos = arrayOfVictoryPos.map((cellsPos) => {
        return cellsPos
          .map((cellPos) => {
            let nbOftruePos = 0;
            if (cellPos.location) ++nbOftruePos;
            if (cellPos.characters) ++nbOftruePos;
            return nbOftruePos;
          })
          .reduce((a, b) => a + b, 0);
      });
      //get the full deck of cards to know the maximum of positions possible
      const nbOfCharForVictory = Object.entries(level.victoryStates[0])
        .map(() => 1)
        .reduce((a, b) => a + b, 0);

      const nbOfLocationForVictory = Object.entries(level.victoryStates[0]).length;
      const maxOfPos = nbOfCharForVictory + nbOfLocationForVictory;
      const nbOferrors = maxOfPos - totalOfGoodPos[0];
      setVictoryState({ achieved: false, index: undefined, nbOferrors });
    }

    // Reset active states at the end
    setActiveId(null);
    setActiveCard(null);
  }

  function placeCardOnBoard(
    cardId: string,
    targetCellId: string,
    sourceCellId?: string,
    targetPosition?: 'left' | 'right'
  ) {
    const cardType = getCardType(cardId);
    let returnedBoard: BoardState = {};

    setBoardState((prevBoard) => {
      const updatedBoard: BoardState = JSON.parse(JSON.stringify(prevBoard));

      // ─────────────────────────────────────────────
      // MOVE LOCATION BETWEEN CELLS
      // ─────────────────────────────────────────────
      if (cardType === 'location' && sourceCellId && sourceCellId !== targetCellId) {
        const sourceCell = updatedBoard[sourceCellId];
        const sourceCharacters = sourceCell?.characters || [];

        delete updatedBoard[sourceCellId];

        const locationCard = getCardDetails(cardId) as Card;
        const maxCharacters = locationCard?.slots?.maxCharacters || 99;

        // Take characters from source cell up to maxCharacters
        const allCharacters = [...sourceCharacters].slice(0, maxCharacters);
        const targetCell = updatedBoard[targetCellId];

        if (targetCell) {
          updatedBoard[sourceCellId] = targetCell;
        }

        updatedBoard[targetCellId] = {
          location: cardId,
          characters: allCharacters,
        };

        returnedBoard = updatedBoard;
        return returnedBoard;
      }

      // ─────────────────────────────────────────────
      // PLACE NEW LOCATION FROM DECK
      // ─────────────────────────────────────────────
      if (cardType === 'location' && !sourceCellId) {
        const locationCard = getCardDetails(cardId) as Card;
        const maxCharacters = locationCard?.slots?.maxCharacters || 99;

        const existingCharacters = updatedBoard[targetCellId]?.characters || [];

        updatedBoard[targetCellId] = {
          location: cardId,
          characters: existingCharacters.slice(0, maxCharacters),
        };

        returnedBoard = updatedBoard;
        return returnedBoard;
      }

      // ─────────────────────────────────────────────
      // CHARACTER LOGIC
      // ─────────────────────────────────────────────
      if (cardType === 'character') {
        // No location in target cell: do nothing
        if (!updatedBoard[targetCellId]?.location) return updatedBoard;

        const locationCard = getCardDetails(updatedBoard[targetCellId].location) as Card;
        const maxCharacters = locationCard?.slots?.maxCharacters || 99;
        const hasPositions = !!locationCard?.slots?.positions?.length;

        // Remove from source cell if needed
        if (sourceCellId && updatedBoard[sourceCellId]) {
          updatedBoard[sourceCellId].characters = updatedBoard[sourceCellId].characters.filter(
            (char) => char.id !== cardId
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
            returnedBoard = updatedBoard;
            return returnedBoard;
          }

          // Remove any character in the target position AND the dragged character
          const newCharacters = updatedBoard[targetCellId].characters.filter(
            (char) => char.position !== targetPosition && char.id !== cardId
          );

          // Add the character at the specified position ONLY
          newCharacters.push({ id: cardId, position: targetPosition });
          updatedBoard[targetCellId].characters = newCharacters;
          if (
            !updatedBoard[targetCellId].location &&
            (!updatedBoard[targetCellId].characters ||
              updatedBoard[targetCellId].characters.length === 0)
          ) {
            delete updatedBoard[targetCellId];
          }
        } else {
          // No positions: allow free placement up to maxCharacters
          let newCharacters = updatedBoard[targetCellId].characters.filter(
            (char) => char.id !== cardId
          );
          if (newCharacters.length < maxCharacters) {
            newCharacters.push({ id: cardId, position: undefined });
          } else {
            newCharacters = [{ id: cardId, position: undefined }];
          }
          updatedBoard[targetCellId].characters = newCharacters;
          if (
            !updatedBoard[targetCellId].location &&
            (!updatedBoard[targetCellId].characters ||
              updatedBoard[targetCellId].characters.length === 0)
          ) {
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
        if (cardType === 'location') {
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
    return [...deckCharacterCards, ...deckLocationCards].find((c) => c.id === cardId);
  }

  function getCardType(cardId: string): 'location' | 'character' {
    return deckLocationCards.some((c) => c.id === cardId) ? 'location' : 'character';
  }

  return (
    <>
      <div className={`${victoryState.achieved ? 'victory-game' : ''}`}>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
          {isCreate ? (
            <div className="mx-4 mt-3 flex items-center gap-2">
              <textarea
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="flex-1 resize-none rounded border border-gray-600 bg-gray-700/50 p-1 text-xs text-white"
                placeholder="Titre de votre niveau..."
                rows={1}
              />
              <button
                onClick={() =>
                  onProposerClick?.(customTitle, {
                    ...level,
                    title: customTitle,
                    victoryStates: [boardState],
                  })
                }
                disabled={!hasChanges}
                className={`cursor-pointer rounded px-3 py-1 text-xs font-medium text-white transition-all duration-200 ${
                  hasChanges
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'cursor-not-allowed bg-gray-600 opacity-50'
                }`}>
                PROPOSER
              </button>
            </div>
          ) : (
            <h2 className="mx-4 mt-3 text-center text-sm text-white">{level.title}</h2>
          )}
          {/* DISPLAY HERE IN ABOSULTE THE nbOferrors */}
          <div className="absolute top-1">
            {victoryState.achieved ? (
              <div className="mx-4 mb-2 text-center text-[8px] text-green-400">
                🎉 Victoire atteinte !
              </div>
            ) : (
              <div className="mx-4 mb-2 text-center text-[8px] text-red-400">
                ❌ Positions incorrectes : {victoryState.nbOferrors}
              </div>
            )}
          </div>

          {/* Board Grid */}
          <div className="grid min-h-[218px] grid-cols-3 content-center gap-2 px-4 py-2">
            {boardCells.map((cellId, index) => {
              const cellData = boardState[cellId];
              const location = cellData?.location ? getCardDetails(cellData.location) : null;
              const characters = cellData?.characters || [];
              const hasPositions = !!(
                location?.slots?.positions && location.slots.positions.length > 0
              );

              return (
                <BoardCell key={cellId} id={cellId}>
                  {location ? (
                    <LocationCard
                      instanceId={`${cellId}-${location.id}`}
                      cardId={location.id}
                      cellId={cellId}>
                      <LocationCardContent
                        location={location}
                        characters={characters}
                        hasPositions={hasPositions}
                        level={level}
                        cellId={cellId}
                        getCardDetails={getCardDetails}
                      />
                    </LocationCard>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-center text-xs text-gray-400">
                      <span>
                        Place une scène ici
                        <br />
                        {index === boardCells.length - 1 && (
                          <span className="text-[10px]!">
                            (Glisse les cartes pour resoudre l&apos;histoire !)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </BoardCell>
              );
            })}
          </div>

          {/* Deck - Always visible */}
          <div className="deck mt-0 flex flex-wrap justify-center gap-1 rounded p-2">
            {/* <h3 className="w-full text-center text-white text-sm mb-2">Available Cards</h3> */}
            {deckLocationCards.map((card: Card) => (
              <DeckCard
                key={`deck-${card.id}`}
                instanceId={`deck-${card.id}`}
                cardId={card.id}
                type="location">
                {card.label}
              </DeckCard>
            ))}

            {deckCharacterCards.map((card: Card) => (
              <DeckCard
                key={`deck-${card.id}`}
                instanceId={`deck-${card.id}`}
                cardId={card.id}
                type="character">
                {card.label}
              </DeckCard>
            ))}
          </div>

          {/* Add DragOverlay - This ensures the dragged item is always on top */}
          <DragOverlay>
            {activeCard ? (
              activeCard.type === 'location' && activeCard.cellData ? (
                // Show complete location card with characters - Using actual LocationCard component
                <div
                  className="rotate-4 transform cursor-grabbing opacity-90 shadow-2xl"
                  style={{ width: '200px' }}>
                  <LocationCard
                    instanceId={`drag-${activeCard.id}`}
                    cardId={activeCard.id}
                    cellId="drag-overlay">
                    <LocationCardContent
                      location={getCardDetails(activeCard.id)!}
                      characters={activeCard.cellData.characters}
                      hasPositions={
                        !!(
                          getCardDetails(activeCard.id)?.slots?.positions &&
                          getCardDetails(activeCard.id)!.slots!.positions!.length > 0
                        )
                      }
                      getCardDetails={getCardDetails}
                    />
                  </LocationCard>
                </div>
              ) : (
                // Simple card for characters and deck locations
                <div
                  className={` ${activeCard.type === 'location' ? 'card-location-deck' : 'card-character-deck'} flex rotate-7 transform cursor-grabbing items-center justify-center rounded text-xs text-white opacity-90 shadow-2xl transition-all duration-75 select-none ${activeCard.type === 'location' ? 'h-14 w-20' : 'h-14 w-20'} `}>
                  {activeCard.type === 'character' ? (
                    DisplayCardImg({ card: getCardDetails(activeCard.id) })
                  ) : (
                    <>
                      {DisplayCardImg({
                        card: getCardDetails(activeCard.id),
                        style: {
                          zIndex: '-14',
                          left: '-1px',
                          bottom: '5px',
                          scale: '1.2',
                        },
                      })}
                    </>
                  )}
                </div>
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      {showDebug && (
        <div className="mt-4 max-w-[500px] flex-1 space-y-2 rounded bg-gray-800">
          <VictoryStateDisplay victoryState={victoryState} />
          <DebugJSON data={boardState} />
          <VictoriesSetToDebug setBoardState={setBoardState} levelVictories={level.victoryStates} />
          <h4 className="mx-4 mt-4 text-sm text-white">Every Levels of the game</h4>
          <div className="m-2 h-48 overflow-auto rounded bg-gray-900 p-4 font-mono text-xs text-white select-all">
            <pre>{JSON.stringify(levels, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  );
}
