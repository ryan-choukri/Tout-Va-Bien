import { Level } from "../../types";
import { useDroppable } from "@dnd-kit/core";
import { CharacterCard } from "./CharacterCard";


export function CharacterSlot({ 
    level,
  cellId, 
  position, 
  character 
}: { 
    level: Level;
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
      className={`flex-1 rounded min-h-[3rem] flex items-center justify-center transition-all`}
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