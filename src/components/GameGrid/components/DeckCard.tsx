import { useDraggable } from "@dnd-kit/core";

export function DeckCard({ 
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
    // transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0 : 1, // Completely invisible when dragging
  };
  
  const bgColor = type === "location" ? "card-location-deck" : "card-character-deck";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${bgColor} p-4 text-white w-20 h-14 text-xs flex items-center justify-center rounded cursor-grab active:cursor-grabbing select-none transition-opacity touch-none`}
    >
      {children}
    </div>
  );
};