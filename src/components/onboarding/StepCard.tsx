import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepCardProps {
  title: string;
  description: string;
  children: ReactNode;
  isCompleted?: boolean;
  hasErrors?: boolean;
  tips?: string[];
  className?: string;
}

export function StepCard({
  title,
  description,
  children,
  isCompleted = false,
  hasErrors = false,
  tips,
  className,
}: StepCardProps) {
  return (
    <Card className={cn('relative', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {title}
              {isCompleted && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
              {hasErrors && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Needs Attention
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}

        {tips && tips.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-700">Tips</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
