export interface EnhanceArticleJobData {
    articleId: string;
}

export interface EnhanceArticleJobResult {
    success: boolean;
    articleId: string;
    error?: string;
}
