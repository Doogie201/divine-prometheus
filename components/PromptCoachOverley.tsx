// == components/PromptCoachOverlay.tsx ==
import React from "react";
import { usePromptEnhancer } from "../hooks/usePromptEnhancer";
import { analyzePromptCognitively } from "../features/promptCoach";

export const PromptCoachOverlay: React.FC = () => {
  const { input } = usePromptEnhancer();
  const feedback = analyzePromptCognitively(input);

  if (!input.trim()) return null;

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow-lg mt-6">
      <h2 className="text-xl font-semibold mb-2">🧠 Divine Prompt Coaching</h2>
      <div className="text-sm text-zinc-300 space-y-2">
        {feedback.map((tip, idx) => (
          <p key={idx}>👉 {tip}</p>
        ))}
      </div>
    </div>
  );
};

// == features/promptCoach.ts ==

export function analyzePromptCognitively(prompt: string): string[] {
  if (!prompt.trim()) return [];

  const tips: string[] = [];

  if (!/why|how|purpose|goal|intended/i.test(prompt)) {
    tips.push(
      "Consider explaining the purpose behind your question—what are you trying to create, solve, or transform?",
    );
  }

  if (!/assume|pretend|role|perspective/i.test(prompt)) {
    tips.push(
      "Try asking the AI to take on a specific persona or perspective to widen the depth of insight.",
    );
  }

  if (prompt.length < 40) {
    tips.push(
      "Your prompt is short. What assumptions are being left unsaid that the AI may miss?",
    );
  }

  if (!/emotional|empathetic|tone|voice/i.test(prompt)) {
    tips.push(
      "You haven’t specified tone—consider if you want confidence, warmth, humility, or authority in the response.",
    );
  }

  tips.push(
    "What outcome would surprise you? Ask the AI to help you think beyond your current framing.",
  );
  tips.push(
    "If this question could be automated forever, what would that system need to know or handle?",
  );

  return tips;
}
