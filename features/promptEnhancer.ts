// == features/promptEnhancer.ts ==
// Purpose: Divine meta prompt enhancer logic
// Converts any user input into a transcendent, AI-maximized meta prompt

export type EnhancerRule = (input: string) => string;

export const enhancerPipeline: EnhancerRule[] = [
  injectContext,
  clarifyPurpose,
  addStructure,
  embedTone,
  includeEdgeCases,
  explainThoughtProcess,
  futureProof,
  teachBack,
];

export function enhancePrompt(raw: string): string {
  return enhancerPipeline.reduce(
    (prompt, ruleFn) => ruleFn(prompt),
    raw.trim()
  );
}

// === Individual Rules ===

function injectContext(prompt: string): string {
  if (!/assume the role/i.test(prompt)) {
    return `Assume the role of a divine, emotionally intelligent, and omniscient AI assistant. ${prompt}`;
  }
  return prompt;
}

function clarifyPurpose(prompt: string): string {
  if (!/purpose|intent|goal/i.test(prompt)) {
    return `${prompt} Make sure to clarify the user's intent and expand it into a clear mission.`;
  }
  return prompt;
}

function addStructure(prompt: string): string {
  return `${prompt} Present your response using structured formatting: titles, bullet points, numbered steps, and summaries.`;
}

function embedTone(prompt: string): string {
  return `${prompt} Tailor the tone to be confident, encouraging, and human-centered with emotional intelligence.`;
}

function includeEdgeCases(prompt: string): string {
  return `${prompt} Identify and explain how to handle potential edge cases, risks, or breakdown scenarios.`;
}

function explainThoughtProcess(prompt: string): string {
  return `${prompt} Briefly explain your reasoning process so the user can learn how decisions were made.`;
}

function futureProof(prompt: string): string {
  return `${prompt} Anticipate future needs or extensions the user may not realize and suggest them proactively.`;
}

function teachBack(prompt: string): string {
  return `${prompt} Reinforce user understanding by summarizing what they should learn and how they can apply it independently.`;
}
