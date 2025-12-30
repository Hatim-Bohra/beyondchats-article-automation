import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LLMProvider } from '../llm.interface';

@Injectable()
export class OpenAIProvider implements LLMProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('llm.openai.apiKey');

    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured');
    }

    this.openai = new OpenAI({ apiKey });
    this.model = this.configService.get<string>(
      'llm.openai.model',
      'gpt-4-turbo-preview',
    );
    this.temperature = this.configService.get<number>(
      'llm.openai.temperature',
      0.7,
    );
    this.maxTokens = this.configService.get<number>(
      'llm.openai.maxTokens',
      4000,
    );
  }

  async enhance(prompt: string): Promise<string> {
    this.logger.log(`Calling OpenAI ${this.model} for article enhancement`);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert content editor and SEO specialist. You enhance articles to match the quality of top-ranking content while preserving original meaning.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      const enhancedContent = response.choices[0]?.message?.content;

      if (!enhancedContent) {
        throw new Error('No content returned from OpenAI');
      }

      this.logger.log(
        `OpenAI response received: ${enhancedContent.length} characters, ${response.usage?.total_tokens} tokens`,
      );

      return enhancedContent.trim();
    } catch (error) {
      this.logger.error(
        `OpenAI API call failed: ${error.message}`,
        error.stack,
      );
      throw new Error(`OpenAI enhancement failed: ${error.message}`);
    }
  }

  getName(): string {
    return 'OpenAI';
  }
}
