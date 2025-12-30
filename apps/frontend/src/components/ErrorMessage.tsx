import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
    title?: string;
    message: string;
}

export function ErrorMessage({ title = 'Error', message }: ErrorMessageProps) {
    return (
        <div className="flex items-center justify-center p-12">
            <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-destructive mb-1">{title}</h3>
                        <p className="text-sm text-muted-foreground">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
