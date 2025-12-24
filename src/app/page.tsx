"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Level } from "@/components/types";



// Charge ton GameGrid dynamiquement
const GameGrid = dynamic(() => import("@/components/GameGrid"), { ssr: false });

// Exemple de niveaux
import level1 from "@/data/levels/level1.json";
import level2 from "@/data/levels/level2.json";
import level3 from "@/data/levels/level3.json";

const levels = [level1, level2, level3];

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(levels[0]);

  return (
    <div className="flex min-h-screen p-4 gap-4">
      {/* Sidebar des niveaux */}
      <div className="flex flex-col w-40 gap-2">
        <h2 className="text-white text-lg mb-2">Levels</h2>
        {levels.map((level, index) => (
          <button
            key={index}
            onClick={() => setCurrentLevel(level)}
            className={`px-3 py-2 rounded text-white text-sm hover:bg-gray-600 transition
              ${currentLevel.id === level.id ? "bg-gray-700" : "bg-gray-800"}`}
          >
            {level.title}
          </button>
        ))}
      </div>

      {/* Container du jeu */}
      <div className="game-container flex-1 max-w-[600px] aspect-[9/16] shadow-lg">
        <GameGrid key={currentLevel.id} levelData={currentLevel as Level}  />
      </div>
    </div>
  );
}
