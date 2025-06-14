// == features/refiner.ts ==

export type RefinementFocus = "clarity" | "depth" | "empathy" | "creativity" | "structure";

export function refinePrompt(original: string, focus: RefinementFocus): string {
  const base = original.trim();

  const injections: Record<RefinementFocus, string> = {
    clarity: " Clarify the goal and reduce ambiguity. Define terms clearly.",
    depth: " Go deeper into principles, unseen layers, and long-term implications.",
    empathy: " Adjust tone for compassion, respect, and human emotional context.",
    creativity: " Add imaginative elements like metaphor, story, or analogy.",
    structure: " Organize the response into headings, bullets, or frameworks."
  };

  return `${base}${injections[focus]}`;
}


// == components/PromptRefiner.tsx ==
import React, { useState } from "react";
import { usePromptEnhancer } from "../hooks/usePromptEnhancer";
import { refinePrompt, RefinementFocus } from "../features/refiner";

const traits: RefinementFocus[] = ["clarity", "depth", "empathy", "creativity", "structure"];

export const PromptRefiner: React.FC = () => {
  const { input, updateInput } = usePromptEnhancer();
  const [selected, setSelected] = useState<RefinementFocus>("clarity");

  if (!input.trim()) return null;

  const handleRefine = () => {
    const refined = refinePrompt(input, selected);
    updateInput(refined);
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow-lg mt-6">
      <h2 className="text-xl font-semibold mb-2">🛠️ Focused Refinement</h2>
      <div className="flex items-center gap-4 mb-3">
        <label className="text-sm text-zinc-400">Improve:</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as RefinementFocus)}
          className="bg-zinc-800 text-white px-3 py-1 rounded-lg border border-zinc-700"
        >
          {traits.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={handleRefine}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-sm"
        >
          Refine
        </button>
      </div>
      <p className="text-xs text-zinc-500">Refines your prompt with emphasis on the selected quality.</p>
    </div>
  );
};