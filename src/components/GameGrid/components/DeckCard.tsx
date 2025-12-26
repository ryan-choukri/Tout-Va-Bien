import { useDraggable } from "@dnd-kit/core";
import Image from "next/image";
import avatar from '@/assets/filion.png';
import { DisplayCardImg } from "./DisplayCardImg";  
export function DeckCard({ 
  style = {},
  instanceId, 
  cardId,
  children, 
  type
}: { 
  style? :React.CSSProperties;
  instanceId: string;
  cardId: string;
  children?: React.ReactNode; 
  type: "location" | "character";
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: instanceId, 
    data: { cardId, cellId: undefined } 
  });
  
  const customStyle = {
    ...style,
    // transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0 : 1, // Completely invisible when dragging
  };
  
  const bgColor = type === "location" ? "card-location-deck" : "card-character-deck";

  return (
    <div
      ref={setNodeRef}
      style={customStyle}
      {...listeners}
      {...attributes}
      className={`${bgColor} p-4 text-white w-20 h-14 text-xs flex items-center justify-center rounded cursor-grab active:cursor-grabbing select-none transition-opacity touch-none`}
    >
      {DisplayCardImg({ id: cardId, type, label: children as string },   { zIndex: "-14",
    left: "-1px",
    bottom: "5px",
    scale: type === "location" ? "1.2" : "1"})}
      {}
{/*       
      {type === "character" ? (
        <>
          <div>
            <Image
              src={avatar || "/placeholder.png"}
              alt={"Character Image"}
              width={400}
              height={400}
            />
          </div>
          <p className="absolute bottom-0"> {children}</p>
        </>
      )  : (
        <>{children}</>
      )} */}
    </div>
  );
};