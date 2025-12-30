import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '../api/articles.api';

export function useArticleById(id: string) {
    return useQuery({
        queryKey: ['article', id],
        queryFn: () => articlesApi.getById(id),
        enabled: !!id, // Only fetch if ID is provided
        staleTime: 60000, // Consider data fresh for 1 minute
    });
}
