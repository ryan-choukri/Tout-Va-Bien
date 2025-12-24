import { useDroppable } from "@dnd-kit/core";


export function BoardCell({ id, children }: { id: string; children?: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[6rem] max-h-[112px] max-w-[198px] cells rounded flex flex-col p-1 ${
        isOver ? " hover-bord-cells" : "bord-cells"
      } text-white transition-all`}
    >
      {children}
    </div>
  );
}
