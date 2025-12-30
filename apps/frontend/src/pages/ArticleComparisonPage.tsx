import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useArticleById } from '../hooks/useArticleById';
import { ArticleComparison } from '../components/ArticleComparison';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Button } from '../components/ui/Button';

export function ArticleComparisonPage() {
    const { id } = useParams<{ id: string }>();
    const { data: article, isLoading, error } = useArticleById(id!);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Link to="/">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Articles
                    </Button>
                </Link>
                <ErrorMessage
                    title="Failed to Load Article"
                    message={error instanceof Error ? error.message : 'An unknown error occurred'}
                />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Link to="/">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Articles
                    </Button>
                </Link>
                <ErrorMessage title="Article Not Found" message="The requested article could not be found." />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <Link to="/">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Articles
                </Button>
            </Link>

            <ArticleComparison article={article} />
        </div>
    );
}
