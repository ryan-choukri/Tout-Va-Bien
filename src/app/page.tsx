"use client"
import dynamic from "next/dynamic";

const GameGrid = dynamic(() => import("@/components/GameGriid"), { ssr: false });

export default function Home() {
  return (
    <div className="flex justify-center items-start min-h-screen p-4">
      <div className="game-container w-full max-w-[600px] aspect-[9/16] shadow-lg">
        <GameGrid />
      </div>
    </div>
  );
}
