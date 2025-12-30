import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { BeyondChatsStrategy } from './strategies/beyondchats.strategy';
import { GenericArticleStrategy } from './strategies/generic-article.strategy';
import { ArticlesModule } from '../articles/articles.module';

@Module({
    imports: [ArticlesModule],
    controllers: [ScraperController],
    providers: [ScraperService, BeyondChatsStrategy, GenericArticleStrategy],
    exports: [ScraperService],
})
export class ScraperModule { }
