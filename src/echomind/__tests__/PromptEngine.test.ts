import { analyzePrompt } from '../PromptEngine';

describe('analyzePrompt', () => {
  it('detects translation intent and missing pieces', () => {
    const result = analyzePrompt('Translate this text to French.');
    expect(result.intent).toBe('translation');
    expect(result.detectedLanguage).toBe('en');
    expect(result.missingPieces).toContain('Specify tone/style/format.');
    expect(result.missingPieces).toContain('Define target audience.');
    expect(result.wordCount).toBe(5);
    expect(result.hasActionableVerbs).toBe(true);
    expect(result.isSpecific).toBe(true);
  });
});
