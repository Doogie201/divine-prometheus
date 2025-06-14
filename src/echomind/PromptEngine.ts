// == src/echomind/PromptEngine.ts ==
// EchoMind Phase 1 – Prompt Intelligence Core
// This file contains the foundational logic for transforming raw, messy user prompts
// into rich, optimized, context-aware meta prompts.

export interface PromptAnalysis {
    original: string;
    cleaned: string;
    detectedLanguage: string;
    intent: string;
    missingPieces: string[];
    clarityScore: number; // 0-100
    vagueWords: string[];
    wordCount: number;
    hasVagueTerms: boolean;
    hasActionableVerbs: boolean;
    isSpecific: boolean;
    isConcise: number;
    recommendations: string[];
  }
  
  export interface EnhancedPrompt {
    metaPrompt: string;
    reasoning: string[]; // human-readable explanation of each enhancement step
  }
  
  // --- Simple language detection (very naive, for demo) ---
  const guessLanguage = (text: string): string => {
    if (/[\u0400-\u04FF]/.test(text)) return 'ru';
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
    return 'en';
  };
  
  // --- Intent classification (rule-based stub for now) ---
  const classifyIntent = (text: string): string => {
    const lowered = text.toLowerCase();
    if (/create|generate|write/.test(lowered)) return 'content_generation';
    if (/summarize|explain|simplify/.test(lowered)) return 'explanation';
    if (/translate/.test(lowered)) return 'translation';
    return 'general_query';
  };
  
  // --- Clarity scoring (length + presence of WH questions + verbs etc.) ---
  const scoreClarity = (text: string): number => {
    let score = Math.min(text.length, 60); // length adds up to 60
    if (/\b(why|how|what|who|when|where)\b/i.test(text)) score += 15;
    if (/\b(should|could|would|can)\b/i.test(text)) score += 10;
    if (/\bplease\b/i.test(text)) score += 5;
    return Math.min(100, score);
  };
  
  // --- Missing pieces detector ---
  const detectMissing = (text: string): string[] => {
    const missing: string[] = [];
    if (!/[\.!?]$/.test(text.trim())) missing.push('Add ending punctuation.');
    if (!/\b(tone|style|format)\b/i.test(text)) missing.push('Specify tone/style/format.');
    if (!/\b(target audience|reader|user)\b/i.test(text)) missing.push('Define target audience.');
    return missing;
  };
  
  export const analyzePrompt = (raw: string): PromptAnalysis => {
    const cleaned = raw.trim();
    const detectedLanguage = guessLanguage(cleaned);
    const intent = classifyIntent(cleaned);
    const missingPieces = detectMissing(cleaned);
    const wordCount = cleaned.split(/\s+/).filter(word => word.length > 0).length;
    const clarityScore = scoreClarity(cleaned) - missingPieces.length * 5;
    const hasActionableVerbs = /\b(create|generate|write|summarize|explain|translate)\b/i.test(cleaned);
    const hasVagueTerms = /\b(vague|general|unspecific)\b/i.test(cleaned);
    const isSpecific = !hasVagueTerms;
    const isConcise = wordCount <= 20; // Example condition for conciseness
  
    const recommendations: string[] = [];
    if (clarityScore < 60) recommendations.push('Add more detail to raise clarity.');
    missingPieces.forEach(p => recommendations.push(p));
  
    return {
      original: raw,
      cleaned,
      detectedLanguage,
      intent,
      isSpecific: isSpecific,
      hasVagueTerms: hasVagueTerms,
      hasActionableVerbs: hasActionableVerbs,
      isConcise: isConcise ? 1 : 0,
      wordCount,
      vagueWords: hasVagueTerms ? cleaned.match(/\b(vague|general|unspecific)\b/g) || [] : [],
      missingPieces,
      // Clarity score is adjusted based on missing pieces
      // ensuring it doesn't go below 0
      // and is capped at 100
      clarityScore: Math.max(0, clarityScore),
      recommendations,
    };
  };
  
  // --- Enhancement engine ---
  export const enhancePrompt = (analysis: PromptAnalysis): EnhancedPrompt => {
    const lines: string[] = [];
    lines.push(`# Task`);
    lines.push(`${analysis.intent.replace('_', ' ').toUpperCase()}`);
    lines.push('');
    lines.push(`# Original Prompt`);
    lines.push(analysis.cleaned);
    lines.push('');
    if (analysis.missingPieces.length) {
      lines.push(`# Clarifications Added`);
      analysis.missingPieces.forEach(m => lines.push(`- ${m}`));
      lines.push('');
    }
    lines.push(`# Output Format`);
    lines.push('- Clear, structured answer');
    lines.push('- Use markdown where appropriate');
    lines.push('');
    lines.push(`# Tone`);
    lines.push('- Professional but approachable');
  
    const reasoning = [
      `Detected language: ${analysis.detectedLanguage}`,
      `Intent classified as: ${analysis.intent}`,
      `Clarity score: ${analysis.clarityScore}`,
      ...analysis.recommendations.map(r => `Recommendation: ${r}`),
    ];
  
    return {
      metaPrompt: lines.join('\n'),
      reasoning,
    };
  };