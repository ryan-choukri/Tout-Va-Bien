'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Level } from '../types';
import { DisplayCardImg } from '@/components/GameGrid/components/DisplayCardImg';
import { useState, useEffect } from 'react';
// Charge ton GameGrid dynamiquement
const GameGrid = dynamic(() => import('@/components/GameGrid'), { ssr: false });

const HomeScreen = ({ onSarkoClick }: { onSarkoClick?: () => void }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePlay = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('level', '1');
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const handleCreateLevel = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('level', 'create');
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex !h-[322px] !w-[650px] w-full flex-col items-center justify-center rounded-2xl px-6 py-4 shadow-2xl">
      {/* Header Row: Title + Image */}
      <div className="mb-3 flex w-full items-center justify-center gap-4">
        <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden">
          <DisplayCardImg
            haveLabel={false}
            style={{ paddingTop: '51px', paddingRight: '180px', scale: 1 }}
            card={{ id: 'lepen', label: 'lepen', type: 'character' }}
          />

          <DisplayCardImg
            haveLabel={false}
            style={{ scale: 1.3 }}
            card={{ id: 'macron', label: 'macron', type: 'character' }}
          />
        </div>
        {/* Left: Title & Subtitle */}

        <div className="flex flex-col tracking-tighter">
          <h1 className="bg-gradient-to-tr from-rose-400 to-pink-800 bg-clip-text text-3xl font-extrabold text-transparent">
            Tout va bien !
          </h1>
          <p className="mt-2 text-center text-xs text-gray-400">Le jeu de puzzle politique</p>
        </div>

        {/* Right: Image Container */}
        <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden">
          <DisplayCardImg
            haveLabel={false}
            style={{ scale: 1.3 }}
            card={{ id: 'melenchon', label: 'melenchon', type: 'character' }}
          />
          <DisplayCardImg
            haveLabel={false}
            style={{ paddingTop: '51px', paddingLeft: '180px', scale: 1, cursor: 'pointer' }}
            card={{ id: 'sarko', label: 'sarkozy', type: 'character' }}
            onClick={onSarkoClick}
          />
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 mb-4 max-w-[400px] text-center text-xs leading-relaxed text-gray-300">
        Place les personnages aux bons endroits pour résoudre les puzzles politiques et découvrir
        comment tout va bien... ou pas !
      </p>

      {/* Buttons Row */}
      <div className="flex w-full flex-col items-center gap-2">
        {/* Play Button */}
        <button
          onClick={handlePlay}
          className="w-full max-w-[180px] transform cursor-pointer rounded-lg bg-gradient-to-tr from-rose-400 to-pink-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-700/30 transition-all duration-200 hover:scale-105 hover:from-rose-400 hover:to-pink-900 hover:shadow-sm hover:shadow-pink-700/40 active:scale-95">
          ▶ Jouer
        </button>

        {/* Create Level Button */}
        <button
          onClick={handleCreateLevel}
          className="cursor-pointer rounded-md border border-gray-600 bg-gray-700/50 px-3 py-1.5 text-[10px] text-gray-300 transition-all duration-200 hover:border-gray-500 hover:bg-gray-600 hover:text-white">
          ✏️ Crée ton niveau
        </button>
      </div>
    </div>
  );
};

export default function GameContainer({
  showDebug,
  levels,
  levelData,
  isHome,
  isCreate,
  onDevModeChange,
}: {
  showDebug: boolean;
  levels: Level[];
  levelData: Level | null;
  isHome: boolean;
  isCreate?: boolean;
  onDevModeChange?: (devMode: boolean, communityLevels: Level[], allLevels: Level[]) => void;
}) {
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [levelContainerData, setLevelContainerData] = useState<Level | null>(levelData);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  const [, setDevMode] = useState<boolean>(false);
  const [, setCommunityLevels] = useState<Level[]>([]);
  const [allLevels, setAllLevels] = useState<Level[]>(levels);
  const [sarkoClickCount, setSarkoClickCount] = useState<number>(0);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // Sync levelContainerData with levelData when it changes
  useEffect(() => {
    setLevelContainerData(levelData);
  }, [levelData]);

  const handleProposerClick = (title: string, data: Level | null) => {
    setLevelContainerData(data);
    setShowConfirmPopup(true);
  };

  const handleBoardStateChange = (changes: boolean) => {
    setHasChanges(changes);
  };

  const handleSarkoClick = () => {
    // Clear existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }

    const newCount = sarkoClickCount + 1;
    setSarkoClickCount(newCount);

    // Reset click count after 2 seconds
    const timeout = setTimeout(() => {
      setSarkoClickCount(0);
    }, 2000);
    setClickTimeout(timeout);

    // Check if we reached 3 clicks
    if (newCount === 3) {
      setSarkoClickCount(0);
      setDevMode(true);
      fetchCommunityLevels();
      clearTimeout(timeout);
    }
  };

  const fetchCommunityLevels = async () => {
    console.log('Fetching community levels from:', `${process.env.NEXT_PUBLIC_API_URL}/levels`);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/levels`);
      console.log('Response received:', response.status, response.statusText);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success && result.levels) {
        setCommunityLevels(result.levels);
        const newAllLevels = [...levels, ...result.levels];
        console.log('level', levels);
        console.log('result', result.levels);

        setAllLevels(newAllLevels);
        onDevModeChange?.(true, result.levels, newAllLevels);
        console.log('Community levels loaded:', result.levels.length);
      }
    } catch (error) {
      console.error('Error fetching community levels:', error);
    }
  };

  const handleSendLevel = async () => {
    if (!levelContainerData) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/createlevel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(levelContainerData),
      });

      if (response.ok) {
        console.log('Level sent successfully!');
        setShowConfirmPopup(false);
        setNotification({
          show: true,
          message: 'Niveau envoyé avec succès !',
          type: 'success',
        });
        // Auto hide after 3 seconds
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }));
        }, 3000);
      } else {
        console.error('Failed to send level');
        setNotification({
          show: true,
          message: "Échec de l'envoi du niveau",
          type: 'error',
        });
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }));
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending level:', error);
      setNotification({
        show: true,
        message: "Erreur lors de l'envoi du niveau",
        type: 'error',
      });
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(levelContainerData);

  return (
    <div
      className={`from-gray-850 game-container relative flex flex-col rounded-xl shadow-lg ${
        isCreate ? 'bg-gradient-to-b from-red-900 to-pink-900' : 'bg-gradient-to-b to-gray-900'
      }`}>
      {isHome || !levelContainerData ? (
        <HomeScreen onSarkoClick={handleSarkoClick} />
      ) : (
        <GameGrid
          key={levelContainerData.id}
          showDebug={showDebug}
          levels={allLevels}
          levelData={levelContainerData}
          isCreate={isCreate}
          onProposerClick={handleProposerClick}
          onBoardStateChange={handleBoardStateChange}
          hasChanges={hasChanges}
        />
      )}

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 max-w-md rounded-lg bg-gradient-to-br from-blue-900 to-gray-900 p-6 shadow-sm">
            <h3 className="mb-4 text-center text-lg font-semibold text-white">Confirmation</h3>
            <p className="mb-6 text-center text-sm text-gray-300">
              Êtes-vous sûr de vouloir envoyer ce niveau ? S&apos;il est sélectionné, il sera en
              ligne bientôt.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleSendLevel}
                disabled={isSubmitting}
                className={`rounded px-4 py-2 text-sm font-medium text-white transition-all duration-200 ${
                  isSubmitting
                    ? 'cursor-not-allowed bg-gray-600'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                }`}>
                {isSubmitting ? 'ENVOI...' : 'ENVOYER'}
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                disabled={isSubmitting}
                className="rounded bg-gradient-to-r from-gray-600 to-gray-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-gray-700 hover:to-gray-800 disabled:opacity-50">
                ANNULER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Alert */}
      {notification.show && (
        <div
          className={`absolute top-4 left-1/2 z-50 -translate-x-1/2 transform rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600'
              : 'bg-gradient-to-r from-red-600 to-pink-600'
          }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? '✅' : '❌'}
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}
