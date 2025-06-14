// == components/ThoughtProcess.tsx ==
import React from "react";
import { usePromptEnhancer } from "../hooks/usePromptEnhancer";

const reflections = [
  "✔️ Context injected to ensure divine perspective is activated.",
  "✔️ User's intent clarified to guide AI alignment.",
  "✔️ Structural formatting requested to organize complex output.",
  "✔️ Tone calibrated for human-centered emotional intelligence.",
  "✔️ Edge cases and ethical risks embedded for foresight.",
  "✔️ Decision logic explained to increase user learning.",
  "✔️ Future-proofing added to anticipate deeper needs.",
  "✔️ Teach-back layer added to reinforce knowledge acquisition."
];

export const ThoughtProcess: React.FC = () => {
  const { input } = usePromptEnhancer();

  if (!input.trim()) return null;

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Why This Prompt Was Enhanced</h2>
      <ul className="list-disc list-inside text-zinc-400 space-y-1 text-sm">
        {reflections.map((reason, idx) => (
          <li key={idx}>{reason}</li>
        ))}
      </ul>
    </div>
  );
};