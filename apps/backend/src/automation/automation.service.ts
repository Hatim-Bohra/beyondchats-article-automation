import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ArticlesService } from '../articles/articles.service';
import { EnhanceArticleJobData } from './jobs/job-types';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectQueue('article-enhancement') private enhancementQueue: Queue,
    private readonly articlesService: ArticlesService,
  ) {}

  /**
   * Enhance all articles with status ORIGINAL
   */
  async enhanceAllOriginalArticles(): Promise<{
    message: string;
    queued: number;
    jobIds: string[];
  }> {
    this.logger.log('Queuing enhancement jobs for all ORIGINAL articles');

    try {
      // Fetch all articles with status ORIGINAL
      const articles = await this.articlesService.findAll({
        status: 'ORIGINAL',
      });

      if (articles.length === 0) {
        return {
          message: 'No articles found with status ORIGINAL',
          queued: 0,
          jobIds: [],
        };
      }

      // Queue enhancement job for each article
      const jobIds: string[] = [];
      for (const article of articles) {
        const job = await this.enhancementQueue.add(
          'enhance',
          { articleId: article.id } as EnhanceArticleJobData,
          {
            attempts: 3, // Retry up to 3 times
            backoff: {
              type: 'exponential',
              delay: 2000, // Start with 2 second delay
            },
            removeOnComplete: 100, // Keep last 100 completed jobs
            removeOnFail: 100, // Keep last 100 failed jobs
          },
        );

        jobIds.push(job.id!);
        this.logger.log(
          `Queued enhancement job ${job.id} for article ${article.id}`,
        );
      }

      return {
        message: `Successfully queued ${jobIds.length} enhancement jobs`,
        queued: jobIds.length,
        jobIds,
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue enhancement jobs: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Enhance a specific article
   */
  async enhanceArticle(articleId: string): Promise<{
    message: string;
    jobId: string;
  }> {
    this.logger.log(`Queuing enhancement job for article ${articleId}`);

    try {
      // Verify article exists
      const article = await this.articlesService.findOne(articleId);
      if (!article) {
        throw new Error(`Article ${articleId} not found`);
      }

      // Queue enhancement job
      const job = await this.enhancementQueue.add(
        'enhance',
        { articleId } as EnhanceArticleJobData,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      this.logger.log(
        `Queued enhancement job ${job.id} for article ${articleId}`,
      );

      return {
        message: 'Enhancement job queued successfully',
        jobId: job.id!,
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue enhancement job: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    try {
      const job = await this.enhancementQueue.getJob(jobId);

      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      const state = await job.getState();
      const progress = job.progress;

      return {
        jobId: job.id!,
        articleId: job.data.articleId,
        state,
        progress,
        attemptsMade: job.attemptsMade,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
      };
    } catch (error) {
      this.logger.error(`Failed to get job status: ${error.message}`);
      throw error;
    }
  }
}
