import { Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: 'complete' | 'incomplete' | 'warning' | 'loading';
  required: boolean;
  count?: number;
}

interface GoLiveChecklistProps {
  items: ChecklistItem[];
  className?: string;
}

export function GoLiveChecklist({ items, className }: GoLiveChecklistProps) {
  const completedRequired = items.filter(i => i.required && i.status === 'complete').length;
  const totalRequired = items.filter(i => i.required).length;
  const allRequiredComplete = completedRequired === totalRequired;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Go-Live Checklist</span>
          <span className={cn(
            'text-sm font-normal',
            allRequiredComplete ? 'text-green-600' : 'text-amber-600'
          )}>
            {completedRequired}/{totalRequired} required items complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border',
                item.status === 'complete'
                  ? 'bg-green-50 border-green-200'
                  : item.status === 'warning'
                  ? 'bg-amber-50 border-amber-200'
                  : item.status === 'loading'
                  ? 'bg-muted border-muted-foreground/20'
                  : 'bg-red-50 border-red-200'
              )}
            >
              <div className="mt-0.5">
                {item.status === 'loading' ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : item.status === 'complete' ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : item.status === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'font-medium',
                    item.status === 'complete' ? 'text-green-800' :
                    item.status === 'warning' ? 'text-amber-800' :
                    item.status === 'loading' ? 'text-muted-foreground' :
                    'text-red-800'
                  )}>
                    {item.label}
                    {item.count !== undefined && (
                      <span className="ml-1 text-sm font-normal">({item.count})</span>
                    )}
                  </p>
                  {item.required && item.status !== 'complete' && (
                    <span className="text-xs text-red-600 font-medium">Required</span>
                  )}
                </div>
                <p className={cn(
                  'text-sm',
                  item.status === 'complete' ? 'text-green-600' :
                  item.status === 'warning' ? 'text-amber-600' :
                  item.status === 'loading' ? 'text-muted-foreground' :
                  'text-red-600'
                )}>
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {!allRequiredComplete && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Please complete all required items before going live. You can skip optional items and configure them later.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
