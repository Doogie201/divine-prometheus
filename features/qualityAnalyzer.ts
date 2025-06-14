// == features/qualityAnalyzer.ts ==

export interface PromptQualityBreakdown {
  clarity: number;
  depth: number;
  empathy: number;
  creativity: number;
  structure: number;
}

export function analyzePromptQuality(prompt: string): PromptQualityBreakdown {
  const length = prompt.length;
  const lc = prompt.toLowerCase();

  return {
    clarity: /
      who|what|when|where|why|how|define|explain|step-by-step|clearly/
      .test(lc)
      ? Math.min(100, 50 + length * 0.1)
      : 40,

    depth: /(system|principle|philosophy|impact|consequence|unseen)/.test(lc)
      ? Math.min(100, 60 + length * 0.1)
      : 30,

    empathy: /(emotion|empathy|tone|inclusive|compassion|human)/.test(lc)
      ? Math.min(100, 70 + length * 0.1)
      : 25,

    creativity: /(metaphor|story|imagine|vision|invent|transform|alchemy)/.test(lc)
      ? Math.min(100, 65 + length * 0.1)
      : 35,

    structure: /(format|sections|bullets|numbered|framework)/.test(lc)
      ? Math.min(100, 60 + length * 0.1)
      : 30,
  };
}

// == components/PromptQualityMeter.tsx ==
import React from "react";
import { usePromptEnhancer } from "../hooks/usePromptEnhancer";
import { analyzePromptQuality } from "../features/qualityAnalyzer";

const TraitBar = ({ label, score }: { label: string; score: number }) => (
  <div className="mb-2">
    <div className="flex justify-between text-sm text-zinc-400">
      <span>{label}</span>
      <span>{score}</span>
    </div>
    <div className="w-full h-2 bg-zinc-800 rounded-full">
      <div
        className="h-full bg-purple-500 rounded-full"
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

export const PromptQualityMeter: React.FC = () => {
  const { input } = usePromptEnhancer();
  if (!input.trim()) return null;

  const quality = analyzePromptQuality(input);

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow-lg mt-6">
      <h2 className="text-xl font-semibold mb-2">📊 Prompt Quality Breakdown</h2>
      <div className="space-y-1">
        <TraitBar label="Clarity" score={quality.clarity} />
        <TraitBar label="Depth" score={quality.depth} />
        <TraitBar label="Empathy" score={quality.empathy} />
        <TraitBar label="Creativity" score={quality.creativity} />
        <TraitBar label="Structure" score={quality.structure} />
      </div>
    </div>
  );
};