import ReactMarkdown from 'react-markdown';
import { ExternalLink } from 'lucide-react';
import { Article, ArticleStatus } from '../types/article.types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

interface ArticleComparisonProps {
    article: Article;
}

export function ArticleComparison({ article }: ArticleComparisonProps) {
    const isEnhanced = article.status === ArticleStatus.ENHANCED;
    const isProcessing = article.status === ArticleStatus.PROCESSING;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="text-4xl font-bold tracking-tight">{article.title}</h1>
                    <Badge
                        variant={
                            isEnhanced ? 'success' : isProcessing ? 'warning' : 'outline'
                        }
                        className="flex-shrink-0"
                    >
                        {article.status}
                    </Badge>
                </div>
                <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                    <ExternalLink className="h-3 w-3" />
                    <span>{article.sourceUrl}</span>
                </a>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Article */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-12 bg-blue-500 rounded"></div>
                        <h2 className="text-2xl font-bold">Original Article</h2>
                    </div>
                    <Card>
                        <CardContent className="p-6">
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{article.content}</ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Article */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-12 bg-green-500 rounded"></div>
                        <h2 className="text-2xl font-bold">Enhanced Article</h2>
                    </div>

                    {isEnhanced ? (
                        <>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown>{article.updatedContent || ''}</ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* References */}
                            {article.references && article.references.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">References</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {article.references.map((ref, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-sm font-semibold text-muted-foreground flex-shrink-0">
                                                        {idx + 1}.
                                                    </span>
                                                    <a
                                                        href={ref.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        {ref.title}
                                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : isProcessing ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                <p className="text-lg font-semibold mb-2">Enhancement in Progress</p>
                                <p className="text-sm text-muted-foreground">
                                    This article is being enhanced using AI. Please check back in a few moments.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                                <p className="text-lg font-semibold mb-2">Not Yet Enhanced</p>
                                <p className="text-sm text-muted-foreground">
                                    This article hasn't been enhanced yet. Trigger the enhancement process from the
                                    API.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
