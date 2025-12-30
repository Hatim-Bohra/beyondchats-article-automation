import { apiClient } from './client';
import { Article, PaginationParams } from '../types/article.types';

export const articlesApi = {
    /**
     * Get all articles with optional pagination and filtering
     */
    getAll: async (params?: PaginationParams): Promise<Article[]> => {
        const response = await apiClient.get<Article[]>('/api/v1/articles', { params });
        return response.data;
    },

    /**
     * Get single article by ID
     */
    getById: async (id: string): Promise<Article> => {
        const response = await apiClient.get<Article>(`/api/v1/articles/${id}`);
        return response.data;
    },

    /**
     * Get article count
     */
    getCount: async (status?: string): Promise<number> => {
        const response = await apiClient.get<number>('/api/v1/articles/count', {
            params: { status },
        });
        return response.data;
    },
};
