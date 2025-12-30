export enum ArticleStatus {
    ORIGINAL = 'ORIGINAL',
    PROCESSING = 'PROCESSING',
    ENHANCED = 'ENHANCED',
    FAILED = 'FAILED',
}

export interface Article {
    id: string;
    title: string;
    content: string;
    sourceUrl: string;
    status: ArticleStatus;
    updatedContent: string | null;
    references: Reference[] | null;
    scrapedAt: string;
    updatedAt: string;
}

export interface Reference {
    title: string;
    url: string;
}

export interface PaginationParams {
    skip?: number;
    take?: number;
    status?: ArticleStatus;
}
