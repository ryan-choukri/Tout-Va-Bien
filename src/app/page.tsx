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
import level4 from "@/data/levels/level4.json";
import level5 from "@/data/levels/level5.json";
import level6 from "@/data/levels/level6.json";
import level7 from "@/data/levels/level7.json";

const levels = [level1, level2, level3, level4, level5, level6, level7];

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(levels[0]);

  return (
    <div className="flex min-h-screen p-4 gap-4">
      {/* Sidebar des niveaux */}
      <div className="flex flex-col w-40 gap-2">
        <h2 className="text-white text-lg text-center mb-2">Les Levels</h2>
        {levels.map((level, index) => (
          <button
            key={index}
            onClick={() => setCurrentLevel(level)}
            className={`cursor-pointer px-3 py-2 rounded text-white text-sm hover:bg-gray-600 transition
              ${currentLevel.id === level.id ? "bg-gray-700" : "bg-gray-800"}`}
          >
            {level.shortTitle}
          </button>
        ))}


        {/* display all existing level in a little json i can scroll inside  */}
        <div className="font-mono text-xs select-all mt-4 p-2 bg-gray-800 text-white text-xs rounded h-48 overflow-auto">
          <pre>{JSON.stringify(levels, null, 2)}</pre>
        </div>
      </div>

      {/* Container du jeu */}
        <div className="flex-1 flex" style={{ flexDirection: "column" }}>
        <GameGrid key={currentLevel.id} levelData={currentLevel as Level}  />
        </div>
    </div>
  );
}
