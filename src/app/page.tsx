"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

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

// Chevron icon component for the toggle button
const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-300 ease-out ${collapsed ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(levels[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDebug, setShowDebug] = useState<boolean>(process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true' ? true : false);

  // Collapse sidebar on mobile/small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen gap-4  bg-gray-950">
            {/* Bouton toggle debug */}
      <button
        className="absolute bottom-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded shadow"
        onClick={() => setShowDebug(!showDebug)}
      >
        🔧
      </button>

      {/* Sidebar des niveaux */}
      {/* Make the sidebar scrollable and size fixed for all devices */}
      <aside
        className={`
          max-h-[100vh] overflow-y-auto
          relative flex flex-col
          bg-gradient-to-b from-gray-800 to-gray-900
          rounded-xl shadow-xl 
          !rounded-none border-r-4 border-gray-700/50
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarCollapsed ? "w-14" : "w-48"}
        `}
      >
        {/* Header with toggle button */}
        <div className={`
          flex items-center border-b border-gray-700/50 p-3
          ${sidebarCollapsed ? "justify-center" : "justify-between"}
        `}>
          {/* Title - hidden when collapsed */}
          <h2
            className={`
              text-white  font-semibold text-sm uppercase tracking-wider
              transition-all duration-200
              ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
            `}
          >
            Tout va bien !
          </h2>
          {/* Toggle button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`
              flex items-center justify-center
              w-8 h-8 rounded-lg
              bg-gray-700/50 hover:bg-gray-600 active:bg-gray-500
              text-gray-300 hover:text-white
              transition-all duration-200 ease-out
              hover:shadow-lg hover:scale-105 active:scale-95
            `}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronIcon collapsed={sidebarCollapsed} />
          </button>
        </div>

        <div className={`${sidebarCollapsed ? " hidden" : ""}`} > 
            {/* decrire le jeu et les regle ici en resurmé  */}
            {/* "Place les personnages aux bons endroits pour réussir les objectifs de chaque niveau.
            Utilise les lieux et met les personnage dedans pour influencer le résultat et débloquer le suivant." 
             */}
            <p className="max-h-[15vh] overflow-auto m-2 text-gray-300 text-xs ">
              Place les personnages aux bons endroits pour réussir les objectifs de chaque niveau.
              Utilise les lieux et met les personnages dedans pour influencer le résultat et gagner !.
            </p>  
          <hr  className="border-gray-700/50 m-2"/>

          </div>


        {/* Level buttons container */}
        <nav className="flex flex-col gap-1.5 p-2 overflow-y-auto flex-1">
          {levels.map((level, index) => {
            const isActive = currentLevel.id === level.id;
            const levelNumber = index + 1;
            
            return (
              <button
                key={index}
                onClick={() => setCurrentLevel(level)}
                title={sidebarCollapsed ? level.shortTitle : undefined}
                className={`
                  cursor-pointer relative flex items-center${sidebarCollapsed ? " justify-center gap-0 px-3 " : " pr-2 pl-3 gap-3 justify-start"}
                    py-2.5 rounded-lg
                  text-sm font-medium
                  min-h-[3rem]
                  transition-all duration-200 ease-out
                  ${isActive
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-gray-300 hover:bg-gray-700/70 hover:text-white"
                  }
                `}
              >
                {/* Level number badge */}
                <span
                  className={`
                    flex items-center justify-center${sidebarCollapsed ? " mx-auto" : " mr-2"}
                    min-w-[1.5rem] h-6 rounded-md text-xs font-bold
                    transition-all duration-200
                    ${isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-600/50 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-200"
                    }
                  `}
                >
                  {levelNumber}
                </span>
                
                {/* Level name - hidden when collapsed */}
                <span
                  className={`
                    ${sidebarCollapsed ? "whitespace-nowrap" : "whitespace-pre-wrap"}
                    flex leading-6 leading-[1.1rem] justify-start text-left overflow-hidden
                    transition-all duration-200
                    ${sidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
                  `}
                >
                  {level.shortTitle}
                </span>
              </button>
            );
          })}
        </nav>

      </aside>

      {/* Container du jeu */}
      <main className="flex-1">
        <GameGrid showDebug={showDebug} levels={levels as Level[]} key={currentLevel.id} levelData={currentLevel as Level} />
      </main>
    </div>
  );
}
