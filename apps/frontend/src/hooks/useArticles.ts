import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '../api/articles.api';
import { PaginationParams } from '../types/article.types';

export function useArticles(params?: PaginationParams) {
    return useQuery({
        queryKey: ['articles', params],
        queryFn: () => articlesApi.getAll(params),
        staleTime: 30000, // Consider data fresh for 30 seconds
        refetchOnWindowFocus: true,
    });
}
