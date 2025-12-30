import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, EnhanceArticleParams } from './llm.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { buildEnhanceArticlePrompt } from './prompts/enhance-article.prompt';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly provider: LLMProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly openaiProvider: OpenAIProvider,
    private readonly anthropicProvider: AnthropicProvider,
  ) {
    // Select provider based on configuration
    const providerName = this.configService.get<string>(
      'llm.provider',
      'openai',
    );

    if (providerName === 'anthropic') {
      this.provider = this.anthropicProvider;
    } else {
      this.provider = this.openaiProvider;
    }

    this.logger.log(`Using LLM provider: ${this.provider.getName()}`);
  }

  /**
   * Enhance article using LLM
   */
  async enhanceArticle(params: EnhanceArticleParams): Promise<string> {
    this.logger.log(`Enhancing article: "${params.originalTitle}"`);

    try {
      // Build comprehensive prompt
      const prompt = buildEnhanceArticlePrompt(params);

      // Call LLM
      const enhancedContent = await this.provider.enhance(prompt);

      // Validate response
      if (!enhancedContent || enhancedContent.length < 100) {
        throw new Error('Enhanced content is too short or empty');
      }

      this.logger.log(
        `Article enhanced successfully: ${enhancedContent.length} characters`,
      );

      return enhancedContent;
    } catch (error) {
      this.logger.error(
        `Article enhancement failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Add references section to enhanced content
   */
  addReferences(
    enhancedContent: string,
    references: Array<{ title: string; url: string }>,
  ): string {
    const referencesSection = `

---

## References

This article was enhanced using insights from the following top-ranking articles:

${references.map((ref, index) => `${index + 1}. [${ref.title}](${ref.url})`).join('\n')}
`;

    return enhancedContent + referencesSection;
  }
}
