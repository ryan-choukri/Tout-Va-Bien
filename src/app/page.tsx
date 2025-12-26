'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

import { Level } from '@/components/types';

// Charge ton GameGrid dynamiquement
const GameGrid = dynamic(() => import('@/components/GameGrid'), { ssr: false });

// Exemple de niveaux
import level1 from '@/data/levels/level1.json';
import level2 from '@/data/levels/level2.json';
import level3 from '@/data/levels/level3.json';
import level4 from '@/data/levels/level4.json';
import level5 from '@/data/levels/level5.json';
import level6 from '@/data/levels/level6.json';
import level7 from '@/data/levels/level7.json';
import level8 from '@/data/levels/level8.json';

const levels = [level1, level2, level3, level4, level5, level6, level7, level8];

// Chevron icon component for the toggle button
const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className={`h-4 w-4 transition-transform duration-300 ease-out ${collapsed ? 'rotate-180' : ''}`}
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
  const [showDebug, setShowDebug] = useState<boolean>(
    process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true' ? true : false
  );

  // Collapse sidebar on mobile/small screens
  useEffect(() => {
    const handleResize = () => {
      // CHECK if my app is running on mobile but not by the size
      const isMobileLike = typeof window !== 'undefined' && navigator.maxTouchPoints > 0;

      if (isMobileLike) {
        setSidebarCollapsed(true);
        return;
      }
      if (window.innerWidth < 640) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen min-h-screen gap-4 bg-gray-950">
      <button
        className={`absolute right-2 bottom-2 rounded px-2 py-1 text-xs text-white shadow ${showDebug ? 'bg-green-800' : 'bg-gray-600'}`}
        onClick={() => setShowDebug(!showDebug)}
      >
        🔧
      </button>

      {/* Sidebar des niveaux */}
      {/* Make the sidebar scrollable and size fixed for all devices */}
      <aside
        className={`relative flex max-h-screen min-w-[3.5rem] flex-col overflow-y-auto !rounded-none rounded-xl border-r-4 border-gray-700/50 bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarCollapsed ? 'w-14' : 'w-48'} `}
      >
        {/* Header with toggle button */}
        <div
          className={`flex items-center border-b border-gray-700/50 p-3 ${sidebarCollapsed ? 'justify-center' : 'justify-between'} `}
        >
          {/* Title - hidden when collapsed */}
          <h2
            className={`text-sm font-semibold tracking-wider text-white uppercase transition-all duration-200 ${sidebarCollapsed ? 'w-0 overflow-hidden opacity-0' : 'opacity-100'} `}
          >
            Tout va bien !
          </h2>
          {/* Toggle button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700/50 text-gray-300 transition-all duration-200 ease-out hover:scale-105 hover:bg-gray-600 hover:text-white hover:shadow-lg active:scale-95 active:bg-gray-500`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronIcon collapsed={sidebarCollapsed} />
          </button>
        </div>

        <div className={`${sidebarCollapsed ? 'hidden' : ''}`}>
          {/* decrire le jeu et les regle ici en resurmé  */}
          {/* "Place les personnages aux bons endroits pour réussir les objectifs de chaque niveau.
            Utilise les lieux et met les personnage dedans pour influencer le résultat et débloquer le suivant." 
             */}
          <p className="m-2 max-h-[15vh] overflow-auto text-xs text-gray-300">
            Place les personnages aux bons endroits pour réussir les objectifs de chaque niveau.
            Utilise les lieux et met les personnages dedans pour influencer le résultat et gagner !.
          </p>
          <hr className="m-2 border-gray-700/50" />
        </div>

        {/* Level buttons container */}
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-2">
          {levels.map((level, index) => {
            const isActive = currentLevel.id === level.id;
            const levelNumber = index + 1;

            return (
              <button
                key={index}
                onClick={() => setCurrentLevel(level)}
                title={sidebarCollapsed ? level.shortTitle : undefined}
                className={`relative flex cursor-pointer items-center ${sidebarCollapsed ? 'justify-center gap-0 px-3' : 'justify-start gap-3 pr-2 pl-3'} min-h-[3rem] rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                } `}
              >
                {/* Level number badge */}
                <span
                  className={`flex items-center justify-center ${sidebarCollapsed ? 'mx-auto' : 'mr-2'} h-6 min-w-[1.5rem] rounded-md text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-600/50 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-200'
                  } `}
                >
                  {levelNumber}
                </span>

                {/* Level name - hidden when collapsed */}
                <span
                  className={` ${sidebarCollapsed ? 'whitespace-nowrap' : 'whitespace-pre-wrap'} flex justify-start overflow-hidden text-left leading-6 leading-[1.1rem] transition-all duration-200 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} `}
                >
                  {level.shortTitle}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Container du jeu */}
      <main className="mx-auto flex max-w-[650px] flex-1 flex-col items-center">
        <GameGrid
          showDebug={showDebug}
          levels={levels as Level[]}
          key={currentLevel.id}
          levelData={currentLevel as Level}
        />
      </main>
    </div>
  );
}
