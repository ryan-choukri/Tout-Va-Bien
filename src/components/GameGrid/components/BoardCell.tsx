import { useDroppable } from '@dnd-kit/core';

export function BoardCell({ id, children }: { id: string; children?: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`cells flex max-h-[112px] min-h-[6rem] max-w-[198px] flex-col rounded p-1 ${isOver ? 'hover-bord-cells' : 'bord-cells'} text-white transition-all`}
    >
      {children}
    </div>
  );
}
