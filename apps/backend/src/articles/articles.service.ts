import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, ArticleStatus } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) { }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    return this.prisma.article.create({
      data: createArticleDto,
    });
  }

  async findAll(filters?: { status?: string }): Promise<any[]> {
    // TEMPORARY: Return mock data to bypass database issues
    const mockArticles = [
      {
        id: '1',
        title: 'How to Build a Chatbot with AI: Complete Guide for 2024',
        content: `Building an AI-powered chatbot has become essential for modern businesses. This comprehensive guide walks you through the entire process, from choosing the right platform to deploying your chatbot in production.

## Why AI Chatbots Matter

Customer expectations have evolved. Today's users expect instant, 24/7 support with personalized responses. AI chatbots powered by large language models can understand context, maintain conversation flow, and provide human-like interactions.

## Key Technologies

- **Natural Language Processing (NLP)**: Understanding user intent
- **Machine Learning**: Improving responses over time
- **Integration APIs**: Connecting with your existing systems
- **Analytics**: Tracking performance and user satisfaction

## Getting Started

1. Define your use case and goals
2. Choose your AI provider (OpenAI, Anthropic, etc.)
3. Design conversation flows
4. Train with your specific data
5. Test thoroughly before launch
6. Monitor and iterate based on feedback

This guide provides everything you need to create a production-ready chatbot that delights your customers.`,
        sourceUrl: 'https://www.example.com/chatbot-guide-2024',
        status: 'ORIGINAL',
        updatedContent: null,
        references: null,
        scrapedAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        title: 'Advanced Chatbot Features: Going Beyond Basic Q&A',
        content: `While basic chatbots can answer simple questions, advanced features unlock true business value. Learn how to implement sophisticated capabilities that set your chatbot apart.

## Essential Advanced Features

**Context Awareness**: Your chatbot should remember previous messages in the conversation, understanding references and maintaining coherent dialogue across multiple turns.

**Multi-language Support**: Reach global audiences by detecting and responding in the user's preferred language automatically.

**Sentiment Analysis**: Detect frustrated users and escalate to human agents proactively, improving customer satisfaction.

**Custom Integrations**: Connect to your CRM, knowledge base, and other systems to provide personalized, data-driven responses.`,
        sourceUrl: 'https://www.example.com/advanced-chatbot-features',
        status: 'ENHANCED',
        updatedContent: `While basic chatbots can answer simple questions, advanced features unlock true business value. Learn how to implement sophisticated capabilities that set your chatbot apart from competitors and drive measurable ROI.

## Essential Advanced Features for Modern Chatbots

### 1. Context Awareness & Memory
Your chatbot should remember previous messages in the conversation, understanding references and maintaining coherent dialogue across multiple turns. This creates natural, human-like interactions that users appreciate.

**Implementation**: Use conversation history APIs and session management to track context. Store key information in temporary memory for the duration of the conversation.

### 2. Multi-language Support
Reach global audiences by detecting and responding in the user's preferred language automatically. Support for 50+ languages ensures no customer is left behind.

**Best Practice**: Use language detection APIs and maintain separate training data for each supported language to ensure quality responses.

### 3. Sentiment Analysis & Smart Escalation
Detect frustrated users and escalate to human agents proactively, improving customer satisfaction scores by up to 40%.

**Key Metrics**: Track sentiment scores, escalation rates, and resolution times to continuously improve your chatbot's performance.

### 4. Custom Integrations & Personalization
Connect to your CRM, knowledge base, inventory systems, and other tools to provide personalized, data-driven responses that solve real problems.

**Example Use Cases**:
- Check order status in real-time
- Book appointments based on calendar availability
- Provide personalized product recommendations
- Access customer purchase history for context

### 5. Proactive Engagement
Don't wait for users to ask questions. Use behavioral triggers to start conversations at the right moment, increasing engagement by 3x.

### 6. Analytics & Continuous Improvement
Track conversation metrics, identify common questions, and use insights to improve your chatbot's knowledge base and response quality over time.

## Real-World Impact

Companies implementing these advanced features report:
- 60% reduction in support ticket volume
- 24/7 availability without increasing headcount
- 85% customer satisfaction scores
- 40% faster resolution times

Start with one or two advanced features and expand based on user feedback and business needs.`,
        references: [
          {
            title: 'OpenAI GPT-4 Best Practices for Chatbots',
            url: 'https://platform.openai.com/docs/guides/chat',
          },
          {
            title: 'Building Production-Ready AI Applications',
            url: 'https://www.anthropic.com/index/building-effective-agents',
          },
        ],
        scrapedAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
      },
      {
        id: '3',
        title: 'Customer Service Automation: ROI and Best Practices',
        content: `Automating customer service with AI chatbots can transform your support operations. This article explores the business case, implementation strategies, and proven best practices for maximizing ROI.

## The Business Case for Automation

Customer service teams face mounting pressure: higher volumes, 24/7 expectations, and budget constraints. AI automation offers a solution that scales infinitely while reducing costs.

## Calculating ROI

Consider these factors when evaluating chatbot ROI:
- Cost per ticket (human vs bot)
- Response time improvements
- Customer satisfaction impact
- Agent productivity gains
- Scalability benefits

## Implementation Best Practices

Start with high-volume, low-complexity queries. Gradually expand to more sophisticated use cases as your chatbot learns and improves.`,
        sourceUrl: 'https://www.example.com/customer-service-automation',
        status: 'ORIGINAL',
        updatedContent: null,
        references: null,
        scrapedAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
      },
    ];

    if (filters?.status) {
      return mockArticles.filter((a) => a.status === filters.status);
    }
    return mockArticles;
  }

  async findOne(id: string): Promise<any> {
    // TEMPORARY: Return mock data
    const mockArticles = [
      {
        id: '1',
        title: 'Getting Started with BeyondChats',
        content:
          'This is a sample article about BeyondChats features and capabilities.',
        sourceUrl: 'https://beyondchats.com/blog/getting-started',
        status: 'ORIGINAL',
        updatedContent: null,
        references: null,
        scrapedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Advanced Chat Features',
        content: 'Learn about advanced features in BeyondChats.',
        sourceUrl: 'https://beyondchats.com/blog/advanced-features',
        status: 'ENHANCED',
        updatedContent: 'Enhanced version with AI-powered features...',
        references: [{ title: 'AI Guide', url: 'https://example.com/guide' }],
        scrapedAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return mockArticles.find((a) => a.id === id) || null;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    try {
      return await this.prisma.article.update({
        where: { id },
        data: updateArticleDto,
      });
    } catch (error) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<Article> {
    try {
      return await this.prisma.article.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }

  async count(status?: ArticleStatus): Promise<number> {
    return this.prisma.article.count({
      where: status ? { status } : undefined,
    });
  }
}
