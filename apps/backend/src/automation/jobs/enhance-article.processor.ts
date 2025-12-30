import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ArticlesService } from '../../articles/articles.service';
import { GoogleSearchService } from '../google-search/google-search.service';
import { ContentScraperService } from '../content-scraper/content-scraper.service';
import { LLMService } from '../llm/llm.service';
import { EnhanceArticleJobData, EnhanceArticleJobResult } from './job-types';

@Processor('article-enhancement', {
    concurrency: 2, // Process 2 jobs in parallel
})
export class EnhanceArticleProcessor extends WorkerHost {
    private readonly logger = new Logger(EnhanceArticleProcessor.name);

    constructor(
        private readonly articlesService: ArticlesService,
        private readonly googleSearchService: GoogleSearchService,
        private readonly contentScraperService: ContentScraperService,
        private readonly llmService: LLMService,
    ) {
        super();
    }

    async process(job: Job<EnhanceArticleJobData>): Promise<EnhanceArticleJobResult> {
        const { articleId } = job.data;
        this.logger.log(`Processing enhancement job for article ${articleId}`);

        try {
            // Step 1: Fetch article from database
            await job.updateProgress(10);
            const article = await this.articlesService.findOne(articleId);

            if (!article) {
                throw new Error(`Article ${articleId} not found`);
            }

            this.logger.log(`Fetched article: "${article.title}"`);

            // Step 2: Update status to PROCESSING
            await this.articlesService.update(articleId, { status: 'PROCESSING' });

            // Step 3: Search Google for article title
            await job.updateProgress(20);
            this.logger.log(`Searching Google for: "${article.title}"`);

            const searchResults = await this.googleSearchService.search(
                article.title,
                'beyondchats.com', // Exclude BeyondChats domain
                2, // Get top 2 results
            );

            if (searchResults.length < 2) {
                this.logger.warn(`Only found ${searchResults.length} search results, proceeding anyway`);
            }

            // Step 4: Scrape content from top 2 results
            await job.updateProgress(40);
            this.logger.log(`Scraping content from ${searchResults.length} URLs`);

            const scrapedContents = await Promise.all(
                searchResults.map((result) => this.contentScraperService.scrapeArticle(result.url)),
            );

            // Ensure we have at least 2 references (use placeholder if needed)
            while (scrapedContents.length < 2) {
                scrapedContents.push({
                    title: 'Reference Article',
                    content: 'No additional reference available.',
                    url: '',
                });
            }

            // Step 5: Enhance article using LLM
            await job.updateProgress(60);
            this.logger.log('Calling LLM for article enhancement');

            const enhancedContent = await this.llmService.enhanceArticle({
                originalTitle: article.title,
                originalContent: article.content,
                reference1Title: scrapedContents[0].title,
                reference1Content: scrapedContents[0].content,
                reference2Title: scrapedContents[1].title,
                reference2Content: scrapedContents[1].content,
            });

            // Step 6: Add references section
            await job.updateProgress(80);
            const references = searchResults.map((result) => ({
                title: result.title,
                url: result.url,
            }));

            const finalContent = this.llmService.addReferences(enhancedContent, references);

            // Step 7: Update article in database
            await job.updateProgress(90);
            await this.articlesService.update(articleId, {
                updatedContent: finalContent,
                references,
                status: 'ENHANCED',
            });

            await job.updateProgress(100);
            this.logger.log(`Successfully enhanced article ${articleId}`);

            return {
                success: true,
                articleId,
            };
        } catch (error) {
            this.logger.error(`Enhancement failed for article ${articleId}: ${error.message}`, error.stack);

            // Update article status to FAILED
            try {
                await this.articlesService.update(articleId, { status: 'FAILED' });
            } catch (updateError) {
                this.logger.error(`Failed to update article status: ${updateError.message}`);
            }

            return {
                success: false,
                articleId,
                error: error.message,
            };
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job<EnhanceArticleJobData>) {
        this.logger.log(`Job ${job.id} completed for article ${job.data.articleId}`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job<EnhanceArticleJobData>, error: Error) {
        this.logger.error(`Job ${job.id} failed for article ${job.data.articleId}: ${error.message}`);
    }
}
