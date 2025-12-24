"use client";

import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import level1 from "@/data/levels/level2.json";

console.log(level1);

export default function GameGrid() {
  const [placedCards, setPlacedCards] = useState<{ [cellId: string]: string[] }>({});

  const level = level1;

  const cells = Array.from({ length: level.cells }, (_, i) => `cell-${i + 1}`);
  const characterCards = level.cardsCaracter;
  const locationCards = level.cardsPlace;

  function handleDragEnd(event: any) {
  const { active, over } = event;
  if (!over) return;
  const fromCell = event.active.data.current?.cellId; // <-- null si du deck
  const fromCard = event.active.data.current?.cardId; // <-- null si du deck
  // Si la carte vient d'une cellule différente
  if(fromCell && fromCard) {
        const parts = fromCard.split("-");
        const second = parts.length > 1 ? parts[1] : null;
        // Si la carte vient d'une cellule, on la retire de cette cellule actuelle
        //avant de l'ajouter à la nouvelle cellule
        setPlacedCards((prev) => {
          const updated = { ...prev };
          const cellCards = updated[fromCell] || [];
          updated[fromCell] = cellCards.filter((id) => id !== second);
            const cellCardsOver = updated[over.id] || [];
            return { ...updated, [over.id]: [...cellCardsOver, second] };
        }); 
        return;
  }
  // Récupérer l'attribut data-card-id
  if (placedCards[over.id]?.includes(active.id)) {
    return; // La carte est déjà dans cette cellule, ne rien faire
  } else {
    //verifier si la carte est déjà placée ailleurs et la retirer sinon ajouter directement
    setPlacedCards((prev) => {
      // Retirer la carte de toute cellule où elle pourrait se trouver
      const updated = Object.fromEntries(
        Object.entries(prev).map(([cellId, cards]) => [
          cellId,
          cards.filter((id) => id !== active.id),
        ])
      );
      // Ajouter la carte à la nouvelle cellule
      const cellCards = updated[over.id] || [];
      updated[over.id] = [...cellCards, active.id];
      return updated;
    });
  }
}   



  console.log('----placedCards',placedCards);
console.log('---cells', cells);


  return (
    <DndContext onDragEnd={handleDragEnd}>
      <h2 className="text-white text-lg mb-2 text-center">{level.title}</h2>
      <div className="grid grid-cols-3 gap-2 p-4">
        {cells.map((id) => (
        <DroppableCell key={id} id={id}>
                {(placedCards[id] && placedCards[id].length > 0) && 
                    placedCards[id].map((cardId: string) => (
                        <DraggableCard cardId={cardId} cellId={id} key={`played-${cardId}-${id}`} id={`played-${cardId}-${id}`}>
                            {cardId}
                        </DraggableCard>
                    ))
                }
          </DroppableCell>
        ))}
      </div>

      {/* Personnages */}
      <div className="flex gap-4 mt-6 justify-center flex-wrap">
          {locationCards.map((card: any) => (
            <DraggableCard key={card.id} id={card.id} type={"location"}>
              {card.label}
            </DraggableCard>
          ))}
        {characterCards.map((card: any) => (
          <DraggableCard key={card.id} id={card.id} type={"character"}>
            {card.label}
          </DraggableCard>
        ))}
      </div>

      {/* Lieux */}
      <div className="flex gap-2 mt-2 justify-center flex-wrap">
      </div>
    </DndContext>
  );
}

function DroppableCell({ id, children }: { id: string; children?: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`h-24 border border-gray-600 rounded flex items-center justify-center ${
        isOver ? "bg-green-700" : "bg-gray-700"
      } text-white`}
    >
      {children}
    </div>
  );
}

function DraggableCard({ id, children, type, cardId, cellId }: { id: string; children: React.ReactNode; type?: string; cardId?: string; cellId?: string }) {    
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, data: { cardId: id, cellId: cellId } });
  const style = { transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined };

  const bgColor = type === "location" ? "bg-green-600" : "bg-blue-600";

  return (
    <div
      data-card-id={cardId || null}
      data-cell-id={cellId|| null}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${bgColor} text-white w-24 h-16 flex items-center justify-center rounded cursor-grab select-none`}
    >
      {children}
    </div>
  );
}
