import { Article, ArticleStatus } from '../types/article.types';

export const MOCK_ARTICLES: Article[] = [
    {
        id: '1',
        title: 'The Future of AI in Automation',
        content: 'Artificial Intelligence is revolutionizing the way we approach automation tasks...',
        sourceUrl: 'https://example.com/ai-automation',
        status: ArticleStatus.ENHANCED,
        scrapedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedContent: 'Enhanced content details...',
        references: []
    },
    {
        id: '2',
        title: 'Sustainable Energy Solutions',
        content: 'Renewable energy sources such as solar and wind are becoming more accessible...',
        sourceUrl: 'https://example.com/sustainable-energy',
        status: ArticleStatus.PROCESSING,
        scrapedAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        updatedContent: null,
        references: null
    },
    {
        id: '3',
        title: 'Understanding Quantum Computing',
        content: 'Quantum bits (qubits) allow for processing power previously unimagined...',
        sourceUrl: 'https://example.com/quantum-computing',
        status: ArticleStatus.FAILED,
        scrapedAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        updatedContent: null,
        references: null
    },
    {
        id: '4',
        title: 'Remote Work Trends 2025',
        content: 'The shift to hybrid work models is permanent...',
        sourceUrl: 'https://example.com/remote-work',
        status: ArticleStatus.ORIGINAL,
        scrapedAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
        updatedContent: null,
        references: null
    }
];
