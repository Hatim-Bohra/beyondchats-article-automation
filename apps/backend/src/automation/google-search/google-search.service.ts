import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

@Injectable()
export class GoogleSearchService {
    private readonly logger = new Logger(GoogleSearchService.name);
    private readonly serpApiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.serpApiKey = this.configService.get<string>('search.serpApiKey');
    }

    /**
     * Search Google for a query and return top blog/article results
     * @param query - Search query (article title)
     * @param excludeDomain - Domain to exclude from results
     * @param maxResults - Maximum number of results to return
     */
    async search(
        query: string,
        excludeDomain?: string,
        maxResults: number = 2,
    ): Promise<SearchResult[]> {
        this.logger.log(`Searching Google for: "${query}"`);

        try {
            // Use SerpAPI for reliable Google search results
            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    api_key: this.serpApiKey,
                    q: query,
                    num: 10, // Get more results to filter
                    engine: 'google',
                },
                timeout: 10000,
            });

            const organicResults = response.data.organic_results || [];
            this.logger.log(`Found ${organicResults.length} organic results`);

            // Filter and select top results
            const filteredResults = organicResults
                .filter((result: any) => {
                    const url = result.link;

                    // Exclude specified domain
                    if (excludeDomain && url.includes(excludeDomain)) {
                        this.logger.debug(`Excluded (domain): ${url}`);
                        return false;
                    }

                    // Exclude non-article URLs
                    if (this.isNonArticleUrl(url)) {
                        this.logger.debug(`Excluded (non-article): ${url}`);
                        return false;
                    }

                    return true;
                })
                .slice(0, maxResults)
                .map((result: any) => ({
                    title: result.title,
                    url: result.link,
                    snippet: result.snippet || '',
                }));

            this.logger.log(`Selected ${filteredResults.length} article results`);
            return filteredResults;
        } catch (error) {
            this.logger.error(`Google search failed: ${error.message}`, error.stack);
            throw new Error(`Failed to search Google: ${error.message}`);
        }
    }

    /**
     * Check if URL is likely not a blog/article
     */
    private isNonArticleUrl(url: string): boolean {
        const lowerUrl = url.toLowerCase();

        // Exclude PDFs
        if (lowerUrl.endsWith('.pdf')) {
            return true;
        }

        // Exclude forums and Q&A sites
        const forumPatterns = [
            'reddit.com',
            'stackoverflow.com',
            'quora.com',
            'stackexchange.com',
            'forum',
            '/forums/',
            '/discussion/',
        ];

        if (forumPatterns.some((pattern) => lowerUrl.includes(pattern))) {
            return true;
        }

        // Exclude video sites
        const videoPatterns = ['youtube.com', 'vimeo.com', 'dailymotion.com'];
        if (videoPatterns.some((pattern) => lowerUrl.includes(pattern))) {
            return true;
        }

        // Exclude social media
        const socialPatterns = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com'];
        if (socialPatterns.some((pattern) => lowerUrl.includes(pattern))) {
            return true;
        }

        return false;
    }
}
