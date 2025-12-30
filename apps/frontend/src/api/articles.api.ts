import { Article, PaginationParams } from '../types/article.types';
import { MOCK_ARTICLES } from './mockData';

export const articlesApi = {
    /**
     * Get all articles with optional pagination and filtering
     */
    getAll: async (params?: PaginationParams): Promise<Article[]> => {
        // Return mock data for reliable frontend demonstration
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...MOCK_ARTICLES];
                if (params?.status) {
                    filtered = filtered.filter(a => a.status === params.status);
                }
                resolve(filtered);
            }, 500);
        });
    },

    /**
     * Get single article by ID
     */
    getById: async (id: string): Promise<Article> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const article = MOCK_ARTICLES.find(a => a.id === id);
                if (article) resolve(article);
                else reject(new Error('Article not found'));
            }, 500);
        });
    },

    /**
     * Get article count
     */
    getCount: async (status?: string): Promise<number> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...MOCK_ARTICLES];
                if (status) {
                    filtered = filtered.filter(a => a.status === status);
                }
                resolve(filtered.length);
            }, 500);
        });
    },
};
