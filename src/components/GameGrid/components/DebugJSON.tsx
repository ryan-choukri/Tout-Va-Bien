import React, { useState } from 'react';
import { BoardState } from '../../types';

interface DebugJSONProps {
  data: BoardState;
}

export function DebugJSON({ data }: DebugJSONProps) {
  const [showJSON, setShowJSON] = useState(false);
  return (
    <div className="mx-4 mt-4 !pt-4">
      {/* Affichage compact */}
      <pre className="overflow-auto rounded bg-black p-2 font-mono text-[10px] text-green-400">
        {Object.entries(data)
          .map(([cellId, cellData]) => {
            const chars = cellData?.characters
              .map(
                (c: BoardState[string]['characters'][number]) =>
                  `${c.id}${c.position ? `:${c.position}` : ''}`
              )
              .join(', ');
            return `${cellId} → ${cellData?.location || 'empty'} [${chars}]`;
          })
          .join('\n')}
      </pre>

      {/* Bouton toggle JSON complet */}
      <div className="mt-2">
        <button
          className="mb-2 rounded bg-gray-700 px-3 py-1 text-xs text-white transition hover:bg-gray-600"
          onClick={() => setShowJSON(!showJSON)}
        >
          {showJSON ? 'Hide BoardState JSON' : 'Display BoardState JSON'}
        </button>

        {showJSON && (
          <div className="max-h-[8vh] overflow-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 select-all">
            {JSON.stringify(data, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}
