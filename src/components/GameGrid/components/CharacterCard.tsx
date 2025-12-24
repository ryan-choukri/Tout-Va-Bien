import { useDraggable } from '@dnd-kit/core';

export function CharacterCard({ 
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
    opacity: isDragging ? 0 : 1, // Completely invisible when dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-4 card-character-board text-white w-16 h-12 text-xs flex items-center justify-center rounded cursor-grab active:cursor-grabbing select-none transition-opacity touch-none"
    >
      {children}
    </div>
  );
}