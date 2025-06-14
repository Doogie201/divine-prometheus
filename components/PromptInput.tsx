// == components/PromptInput.tsx ==
import React from "react";
import { usePromptEnhancer } from "../hooks/usePromptEnhancer";

export const PromptInput: React.FC = () => {
  const { input, updateInput } = usePromptEnhancer();

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Raw Prompt Input</h2>
      <textarea
        value={input}
        onChange={(e) => updateInput(e.target.value)}
        className="w-full h-48 p-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        placeholder="Type your raw prompt here..."
      />
    </div>
  );
};


// == components/EnhancedPreview.tsx ==
import React from "react";
import { usePromptEnhancer } from "../hooks/usePromptEnhancer";

export const EnhancedPreview: React.FC = () => {
  const { enhanced } = usePromptEnhancer();

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Enhanced Divine Prompt</h2>
      <div className="whitespace-pre-wrap text-sm bg-zinc-800 p-3 rounded-xl border border-zinc-700 text-green-300 overflow-y-auto h-48">
        {enhanced || "Your enhanced prompt will appear here..."}
      </div>
    </div>
  );
};