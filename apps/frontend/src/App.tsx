import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArticleListPage } from './pages/ArticleListPage';
import { ArticleComparisonPage } from './pages/ArticleComparisonPage';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className="min-h-screen bg-background">
                    <Routes>
                        <Route path="/" element={<ArticleListPage />} />
                        <Route path="/articles/:id" element={<ArticleComparisonPage />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
