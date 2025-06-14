// == hooks/usePromptEnhancer.ts ==
// Connects user input to the divine enhancer engine in real time

import { useState } from "react";
import { enhancePrompt } from "../features/promptEnhancer";

export function usePromptEnhancer() {
  const [input, setInput] = useState("");
  const [enhanced, setEnhanced] = useState("");

  const updateInput = (value: string) => {
    setInput(value);
    const result = enhancePrompt(value);
    setEnhanced(result);
  };

  return {
    input,
    enhanced,
    updateInput
  };
}
