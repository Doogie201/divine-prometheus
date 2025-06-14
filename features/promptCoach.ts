// == features/promptCoach.ts ==

export type CognitionLevel =
  | "Reactive"
  | "Curious"
  | "Strategic"
  | "Meta-Cognitive"
  | "Divine";

export function analyzePromptCognitively(prompt: string): string[] {
  if (!prompt.trim()) return [];

  const tips: string[] = [];

  if (!/why|how|purpose|goal|intended/i.test(prompt)) {
    tips.push("Consider explaining the purpose behind your question—what are you trying to create, solve, or transform?");
  }

  if (!/assume|pretend|role|perspective/i.test(prompt)) {
    tips.push("Try asking the AI to take on a specific persona or perspective to widen the depth of insight.");
  }

  if (prompt.length < 40) {
    tips.push("Your prompt is short. What assumptions are being left unsaid that the AI may miss?");
  }

  if (!/emotional|empathetic|tone|voice/i.test(prompt)) {
    tips.push("You haven’t specified tone—consider if you want confidence, warmth, humility, or authority in the response.");
  }

  tips.push("What outcome would surprise you? Ask the AI to help you think beyond your current framing.");
  tips.push("If this question could be automated forever, what would that system need to know or handle?");

  return tips;
}

export function analyzeCognitionLevel(prompt: string): CognitionLevel {
  const trimmed = prompt.trim().toLowerCase();
  const isReflective = /reflect|awareness|bias|assumption|meta|how am i/i.test(trimmed);
  const isStrategic = /goal|optimize|process|framework|structure/i.test(trimmed);
  const isEmpathic = /emotion|ethic|integrity|impact|human/i.test(trimmed);
  const isCreative = /system|transcend|transformation|legacy|divine/i.test(trimmed);
  const isCurious = /why|how|what|can/i.test(trimmed);

  if (isReflective && isStrategic && isEmpathic && isCreative) return "Divine";
  if (isReflective || (isStrategic && isEmpathic)) return "Meta-Cognitive";
  if (isStrategic) return "Strategic";
  if (isCurious) return "Curious";
  return "Reactive";
}


// == Updated components/PromptCoachOverlay.tsx ==
import React from "react";
import { usePromptEnhancer } from "../hooks/usePromptEnhancer";
import { analyzePromptCognitively, analyzeCognitionLevel } from "../features/promptCoach";

export const PromptCoachOverlay: React.FC = () => {
  const { input } = usePromptEnhancer();
  const feedback = analyzePromptCognitively(input);
  const cognition = analyzeCognitionLevel(input);

  if (!input.trim()) return null;

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow-lg mt-6">
      <h2 className="text-xl font-semibold mb-2">🧠 Divine Prompt Coaching</h2>

      <div className="text-sm text-zinc-300 mb-4">
        <span className="font-semibold text-purple-400">Cognition Level Detected:</span>{" "}
        <span className="uppercase tracking-wide font-bold text-lg text-green-400">
          {cognition}
        </span>
      </div>

      <div className="text-sm text-zinc-300 space-y-2">
        {feedback.map((tip, idx) => (
          <p key={idx}>👉 {tip}</p>
        ))}
      </div>
    </div>
  );
};