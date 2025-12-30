export interface LLMProvider {
    /**
     * Enhance article content using LLM
     */
    enhance(prompt: string): Promise<string>;

    /**
     * Get provider name
     */
    getName(): string;
}

export interface EnhanceArticleParams {
    originalTitle: string;
    originalContent: string;
    reference1Title: string;
    reference1Content: string;
    reference2Title: string;
    reference2Content: string;
}
