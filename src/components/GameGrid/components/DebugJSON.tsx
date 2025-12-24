import React, { useState } from "react";
import { BoardState } from "../../types";

interface DebugJSONProps {
  data: BoardState;
}

export function DebugJSON({ data }: DebugJSONProps) {
  const [showJSON, setShowJSON] = useState(false);
  return (
    <div className=" mt-4 mx-4 !pt-4">
      {/* Affichage compact */}
      <pre className=" p-2 rounded bg-black text-green-400 text-[10px] overflow-auto font-mono">
        {Object.entries(data)
          .map(([cellId, cellData]) => {
            const chars = cellData?.characters
              .map((c: BoardState[string]["characters"][number]) => `${c.id}${c.position ? `:${c.position}` : ""}`)
              .join(", ");
            return `${cellId} → ${cellData?.location || "empty"} [${chars}]`;
          })
          .join("\n")}
      </pre>

      {/* Bouton toggle JSON complet */}
      <div className="mt-2">
        <button
          className="mb-2 px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition"
          onClick={() => setShowJSON(!showJSON)}
        >
          {showJSON ? "Hide BoardState JSON" : "Display BoardState JSON"}
        </button>

        {showJSON && (
          <div
            className="p-2 bg-gray-900 text-green-400 rounded font-mono text-xs overflow-auto max-h-[8vh] select-all"
          >
            {JSON.stringify(data, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}
