// == components/VaultPanel.tsx ==
import React, { useEffect, useState } from "react";
import { usePromptEnhancer } from "../hooks/usePromptEnhancer";

interface VaultEntry {
  original: string;
  enhanced: string;
  timestamp: string;
}

const STORAGE_KEY = "divine_prompt_vault";

export const VaultPanel: React.FC = () => {
  const { input, enhanced } = usePromptEnhancer();
  const [vault, setVault] = useState<VaultEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setVault(JSON.parse(stored));
  }, []);

  const savePrompt = () => {
    if (!input.trim()) return;
    const newEntry: VaultEntry = {
      original: input,
      enhanced,
      timestamp: new Date().toISOString(),
    };
    const updatedVault = [newEntry, ...vault];
    setVault(updatedVault);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVault));
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">🧠 Saved Prompt Vault</h2>
        <button
          onClick={savePrompt}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-xl text-sm"
        >
          Save Current Prompt
        </button>
      </div>
      <div className="space-y-4 max-h-80 overflow-y-auto text-sm">
        {vault.length === 0 ? (
          <p className="text-zinc-500">No prompts saved yet.</p>
        ) : (
          vault.map((entry, idx) => (
            <div
              key={idx}
              className="bg-zinc-800 p-3 rounded-xl border border-zinc-700"
            >
              <p className="text-xs text-zinc-400 mb-1">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
              <p className="text-white font-semibold">Original:</p>
              <p className="mb-2 text-zinc-300">{entry.original}</p>
              <p className="text-white font-semibold">Enhanced:</p>
              <p className="text-green-300 whitespace-pre-wrap">
                {entry.enhanced}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
