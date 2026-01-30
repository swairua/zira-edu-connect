import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({ 
  title = 'Something went wrong',
  message = 'We couldn\'t load this data. Please try again.',
  onRetry 
}: ErrorCardProps) {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <h3 className="mt-3 text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {message}
          </p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 gap-2"
              onClick={onRetry}
              aria-label="Retry loading data"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
