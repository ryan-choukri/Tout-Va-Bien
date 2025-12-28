'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Level } from '@/components/types';
import { Sidebar } from '@/components/Sidebar';

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
import level9 from '@/data/levels/level9.json';
import level10 from '@/data/levels/level10.json';
import level11 from '@/data/levels/level11.json';
const levels = [
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
  level9,
  level10,
  level11,
];

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const levelIndex = useMemo(() => {
    const levelParam = searchParams.get('level');
    const parsed = levelParam ? parseInt(levelParam, 10) - 1 : 0;
    return Number.isFinite(parsed) && parsed >= 0 && parsed < levels.length ? parsed : 0;
  }, [searchParams]);

  const currentLevel = levels[levelIndex];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDebug, setShowDebug] = useState<boolean>(
    process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true' ? true : false
  );
  const [showRotateHint, setShowRotateHint] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;

      setShowRotateHint(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

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

  const handleSelectLevel = (_level: Level, index: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('level', String(index + 1));
    const query = params.toString();
    router.replace(query ? `/?${query}` : '/', { scroll: false });
  };

  return (
    <div className="flex h-screen min-h-screen gap-4 bg-gray-950">
      <button
        className={`absolute right-2 bottom-2 rounded px-2 py-1 text-xs text-white shadow ${showDebug ? 'bg-green-800' : 'bg-gray-600'}`}
        onClick={() => setShowDebug(!showDebug)}>
        🔧
      </button>

      <Sidebar
        levels={levels as Level[]}
        currentLevel={currentLevel as Level}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectLevel={handleSelectLevel}
      />

      {/* Container du jeu */}
      <div className={showRotateHint ? 'pointer-events-none blur-sm' : ''}>
        <main className="mx-auto flex max-w-[650px] flex-1 flex-col items-center">
          <GameGrid
            showDebug={showDebug}
            levels={levels as Level[]}
            key={currentLevel.id}
            levelData={currentLevel as Level}
          />
        </main>
      </div>

      {showRotateHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          {/* Bouton croix */}
          <button
            onClick={() => setShowRotateHint(false)}
            className="center absolute mx-2 my-2 mb-60 ml-10! flex h-8 w-8 items-center justify-center rounded-lg border border-gray-600/60 bg-gradient-to-b from-gray-700 to-gray-800 text-xl"
            aria-label="Close">
            ✕
          </button>

          <div className="px-6 pl-20! text-center text-white">
            <div className="mb-4 text-4xl">📱↻</div>
            <p className="text-lg font-semibold">Tourne ton téléphone</p>
            <p className="text-sm opacity-80">Le jeu est prévu en mode horizontal</p>
          </div>
        </div>
      )}
    </div>
  );
}
