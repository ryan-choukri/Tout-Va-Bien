import { useDraggable } from '@dnd-kit/core';
export function LocationCard({
  instanceId,
  cardId,
  children,
  cellId,
}: {
  instanceId: string;
  cardId: string;
  children: React.ReactNode;
  cellId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: instanceId,
    data: { cellId, cardId },
  });

  const style = {
    // transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0 : 1, // Completely invisible when dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="card-location-board min-h-[5.5rem] w-full cursor-grab touch-none rounded p-2 py-0! text-white transition-opacity select-none active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
