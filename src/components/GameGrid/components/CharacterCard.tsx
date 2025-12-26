import { useDraggable } from '@dnd-kit/core';

export function CharacterCard({
  instanceId,
  cardId,
  children,
  cellId,
  position,
}: {
  instanceId: string;
  cardId: string;
  children: React.ReactNode;
  cellId: string;
  position?: 'left' | 'right';
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: instanceId,
    data: { cellId, cardId, position },
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
      className="card-character-board flex h-12 w-16 cursor-grab touch-none items-center justify-center rounded p-4 text-xs text-white transition-opacity select-none active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
