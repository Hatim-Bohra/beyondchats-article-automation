import { useState } from 'react';
import { useArticles } from '../hooks/useArticles';
import { ArticleCard } from '../components/ArticleCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ArticleStatus } from '../types/article.types';
import { Button } from '../components/ui/Button';

export function ArticleListPage() {
    const [statusFilter, setStatusFilter] = useState<ArticleStatus | undefined>(undefined);
    const { data: articles, isLoading, error } = useArticles({ status: statusFilter });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <ErrorMessage
                title="Failed to Load Articles"
                message={error instanceof Error ? error.message : 'An unknown error occurred'}
            />
        );
    }

    const filterButtons: Array<{ label: string; value: ArticleStatus | undefined }> = [
        { label: 'All', value: undefined },
        { label: 'Original', value: ArticleStatus.ORIGINAL },
        { label: 'Enhanced', value: ArticleStatus.ENHANCED },
        { label: 'Processing', value: ArticleStatus.PROCESSING },
    ];

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Article Automation</h1>
                <p className="text-muted-foreground">
                    View original articles and their AI-enhanced versions
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filterButtons.map((btn) => (
                    <Button
                        key={btn.label}
                        variant={statusFilter === btn.value ? 'default' : 'outline'}
                        onClick={() => setStatusFilter(btn.value)}
                        size="sm"
                    >
                        {btn.label}
                    </Button>
                ))}
            </div>

            {/* Articles Grid */}
            {articles && articles.length > 0 ? (
                <>
                    <p className="text-sm text-muted-foreground mb-4">
                        Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-lg font-semibold mb-2">No Articles Found</p>
                    <p className="text-sm text-muted-foreground">
                        {statusFilter
                            ? `No articles with status "${statusFilter}"`
                            : 'No articles available. Start by scraping articles from the API.'}
                    </p>
                </div>
            )}
        </div>
    );
}
