import { Article } from '../types/article.types';

export const MOCK_ARTICLES: Article[] = [
    {
        id: '1',
        title: 'The Future of AI in Automation',
        content: 'Artificial Intelligence is revolutionizing the way we approach automation tasks...',
        url: 'https://example.com/ai-automation',
        status: 'ENHANCED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        originalAnalysis: {
            summary: 'AI enhances automation efficiency.',
            sentiment: 'POSITIVE',
            keywords: ['AI', 'Automation', 'Efficiency'],
            category: 'Technology'
        },
        enhancedContent: {
            title: 'How AI is Reshaping Automation',
            introduction: 'A deep dive into AI-driven workflows.',
            sections: [
                { heading: 'Efficiency Gains', content: 'Businesses see 40% improvement...' },
                { heading: 'Future Trends', content: 'Predictive analytics will dominate...' }
            ],
            conclusion: 'AI is the future.',
            faq: [
                { question: 'Will robots replace us?', answer: 'No, they will assist us.' }
            ]
        }
    },
    {
        id: '2',
        title: 'Sustainable Energy Solutions',
        content: 'Renewable energy sources such as solar and wind are becoming more accessible...',
        url: 'https://example.com/sustainable-energy',
        status: 'PROCESSING',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '3',
        title: 'Understanding Quantum Computing',
        content: 'Quantum bits (qubits) allow for processing power previously unimagined...',
        url: 'https://example.com/quantum-computing',
        status: 'FAILED',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        originalAnalysis: {
            summary: 'Quantum computing is hard.',
            sentiment: 'NEUTRAL',
            keywords: ['Quantum', 'Physics', 'Computing'],
            category: 'Science'
        }
    },
    {
        id: '4',
        title: 'Remote Work Trends 2025',
        content: 'The shift to hybrid work models is permanent...',
        url: 'https://example.com/remote-work',
        status: 'ORIGINAL',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
    }
];
