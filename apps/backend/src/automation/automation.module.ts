import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { GoogleSearchService } from './google-search/google-search.service';
import { ContentScraperService } from './content-scraper/content-scraper.service';
import { LLMService } from './llm/llm.service';
import { OpenAIProvider } from './llm/providers/openai.provider';
import { AnthropicProvider } from './llm/providers/anthropic.provider';
import { EnhanceArticleProcessor } from './jobs/enhance-article.processor';
import { ArticlesModule } from '../articles/articles.module';

@Module({
  imports: [
    ArticlesModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.url')?.includes('://')
            ? new URL(configService.get<string>('redis.url')).hostname
            : 'localhost',
          port: configService.get<string>('redis.url')?.includes('://')
            ? parseInt(
                new URL(configService.get<string>('redis.url')).port || '6379',
              )
            : 6379,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'article-enhancement',
    }),
  ],
  controllers: [AutomationController],
  providers: [
    AutomationService,
    GoogleSearchService,
    ContentScraperService,
    LLMService,
    OpenAIProvider,
    AnthropicProvider,
    EnhanceArticleProcessor,
  ],
  exports: [AutomationService],
})
export class AutomationModule {}
