import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from '../llm.interface';

@Injectable()
export class AnthropicProvider implements LLMProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly anthropic: Anthropic;
  private readonly model: string = 'claude-3-sonnet-20240229';
  private readonly maxTokens: number = 4000;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('llm.anthropic.apiKey');

    if (!apiKey) {
      this.logger.warn('Anthropic API key not configured');
    }

    this.anthropic = new Anthropic({ apiKey });
  }

  async enhance(prompt: string): Promise<string> {
    this.logger.log(`Calling Anthropic ${this.model} for article enhancement`);

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const contentBlock = response.content[0];
      if (!contentBlock || contentBlock.type !== 'text') {
        throw new Error('No text content returned from Anthropic');
      }

      const enhancedContent = contentBlock.text;

      if (!enhancedContent) {
        throw new Error('No content returned from Anthropic');
      }

      this.logger.log(
        `Anthropic response received: ${enhancedContent.length} characters`,
      );

      return enhancedContent.trim();
    } catch (error) {
      this.logger.error(
        `Anthropic API call failed: ${error.message}`,
        error.stack,
      );
      throw new Error(`Anthropic enhancement failed: ${error.message}`);
    }
  }

  getName(): string {
    return 'Anthropic';
  }
}
