import { Link } from 'react-router-dom';
import { Clock, ExternalLink } from 'lucide-react';
import { Article, ArticleStatus } from '../types/article.types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { formatDate, truncateText } from '../lib/utils';

interface ArticleCardProps {
    article: Article;
}

function getStatusVariant(status: ArticleStatus) {
    switch (status) {
        case ArticleStatus.ORIGINAL:
            return 'outline';
        case ArticleStatus.PROCESSING:
            return 'warning';
        case ArticleStatus.ENHANCED:
            return 'success';
        case ArticleStatus.FAILED:
            return 'destructive';
        default:
            return 'default';
    }
}

function getStatusLabel(status: ArticleStatus) {
    switch (status) {
        case ArticleStatus.ORIGINAL:
            return 'Original';
        case ArticleStatus.PROCESSING:
            return 'Processing...';
        case ArticleStatus.ENHANCED:
            return 'Enhanced';
        case ArticleStatus.FAILED:
            return 'Failed';
        default:
            return status;
    }
}

export function ArticleCard({ article }: ArticleCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <CardTitle className="line-clamp-2 text-xl">{article.title}</CardTitle>
                    <Badge variant={getStatusVariant(article.status)} className="flex-shrink-0">
                        {getStatusLabel(article.status)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {truncateText(article.content, 200)}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Scraped {formatDate(article.scrapedAt)}</span>
                </div>

                {article.status === ArticleStatus.ENHANCED && article.references && (
                    <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                            Enhanced using {article.references.length} reference{article.references.length > 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex gap-2">
                <Link to={`/articles/${article.id}`} className="flex-1">
                    <Button variant="default" className="w-full">
                        View {article.status === ArticleStatus.ENHANCED ? 'Comparison' : 'Article'}
                    </Button>
                </Link>
                <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                >
                    <Button variant="outline" size="default">
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </a>
            </CardFooter>
        </Card>
    );
}
