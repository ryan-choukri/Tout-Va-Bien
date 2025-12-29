'use client';

import { Level } from '@/components/types';
import { useRouter } from 'next/navigation';

// Chevron icon component for the toggle button
const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className={`h-4 w-4 transition-transform duration-300 ease-out ${collapsed ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

// Home icon component for collapsed sidebar
const HomeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

export type SidebarProps = {
  levels: Level[];
  currentLevel: Level | null;
  sidebarCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectLevel: (level: Level, index: number) => void;
  isHome?: boolean;
  devMode?: boolean;
  communityLevelsCount?: number;
};

export const Sidebar = ({
  levels,
  currentLevel,
  sidebarCollapsed,
  onToggleCollapse,
  onSelectLevel,
  devMode,
  communityLevelsCount,
}: SidebarProps) => {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push('/');
  };
  return (
    <aside
      className={`relative flex max-h-screen min-w-[3.5rem] flex-col overflow-y-auto !rounded-none rounded-xl border-r-4 border-gray-700/50 bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarCollapsed ? 'w-14' : 'w-48'} `}>
      {/* Header with toggle button */}
      <div
        className={`flex items-center border-b border-gray-700/50 p-3 ${sidebarCollapsed ? 'flex-col justify-center gap-2' : 'justify-between'} `}>
        {/* Home button/title */}
        {sidebarCollapsed ? (
          <button
            onClick={handleHomeClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700/50 text-gray-300 transition-all duration-200 ease-out hover:scale-105 hover:bg-gray-600 hover:text-white hover:shadow-lg active:scale-95 active:bg-gray-500"
            title="Retour à l'accueil">
            <HomeIcon />
          </button>
        ) : (
          <button
            onClick={handleHomeClick}
            className="cursor-pointer rounded-lg px-2 py-2 text-sm font-semibold tracking-wider text-white uppercase transition-all duration-200 ease-out hover:bg-gray-700/50 hover:text-gray-200 hover:shadow-md active:scale-95"
            title="Retour à l'accueil">
            Tout va bien !
          </button>
        )}

        {/* Toggle button */}
        <button
          onClick={onToggleCollapse}
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700/50 text-gray-300 transition-all duration-200 ease-out hover:scale-105 hover:bg-gray-600 hover:text-white hover:shadow-lg active:scale-95 active:bg-gray-500`}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <ChevronIcon collapsed={sidebarCollapsed} />
        </button>
      </div>

      <div className={`${sidebarCollapsed ? 'hidden' : ''}`}>
        <p className="m-2 max-h-[15vh] overflow-auto text-xs text-gray-300">
          Place les personnages aux bons endroits pour réussir les objectifs de chaque niveau.
          Utilise les lieux et met les personnages dedans pour influencer le résultat et gagner !.
        </p>
        <hr className="m-2 border-gray-700/50" />
      </div>

      {/* Level buttons container */}
      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-2">
        {levels.map((level, index) => {
          const isActive = currentLevel?.id === level.id;
          const levelNumber = index + 1;
          const isCommunityLevel = devMode && index >= levels.length - (communityLevelsCount || 0);
          const isCreateLevel = level.id === 'level_storyteller_0create';

          return (
            <div key={index}>
              <button
                onClick={() => onSelectLevel(level, index)}
                title={sidebarCollapsed ? level.shortTitle : undefined}
                className={`relative flex cursor-pointer items-center ${sidebarCollapsed ? 'justify-center gap-0 px-3' : 'justify-start gap-3 pr-2 pl-3'} min-h-[3rem] rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : isCreateLevel
                      ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/25 hover:from-orange-600 hover:via-pink-600 hover:to-red-600'
                      : isCommunityLevel
                        ? 'text-orange-300 hover:bg-orange-700/70 hover:text-white'
                        : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                } `}>
                {/* Level number badge */}
                <span
                  className={`flex items-center justify-center ${sidebarCollapsed ? 'mx-auto' : 'mr-2'} h-6 min-w-[1.5rem] rounded-md text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isCreateLevel
                        ? 'bg-white/30 text-white'
                        : isCommunityLevel
                          ? 'bg-orange-600/50 text-orange-200'
                          : 'bg-gray-600/50 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-200'
                  } `}>
                  {isCreateLevel ? '+' : isCommunityLevel ? 'C' : levelNumber}
                </span>

                {/* Level name - hidden when collapsed */}
                <span
                  className={` ${sidebarCollapsed ? 'whitespace-nowrap' : 'whitespace-pre-wrap'} flex justify-start overflow-hidden text-left leading-6 leading-[1.1rem] transition-all duration-200 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} `}>
                  {level.shortTitle}
                </span>
              </button>
              {/* Community levels subtitle */}
              {devMode &&
                isCreateLevel &&
                levels
                  .slice(0, index)
                  .filter((l) => l.id.includes('create') && l.id !== 'level_storyteller_0create')
                  .length === 0 && (
                  <div
                    className={`mt-4 mb-2 text-center text-xs font-semibold text-orange-400 ${sidebarCollapsed ? 'hidden' : ''}`}>
                    Levels de la commu
                  </div>
                )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
