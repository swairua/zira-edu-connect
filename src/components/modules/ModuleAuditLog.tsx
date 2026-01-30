import { useModuleActivationHistory } from "@/hooks/useModuleConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { History, CheckCircle, XCircle, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ModuleAuditLogProps {
  institutionId: string;
}

export function ModuleAuditLog({ institutionId }: ModuleAuditLogProps) {
  const { data: history, isLoading } = useModuleActivationHistory(institutionId);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "activated":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "deactivated":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "upgraded":
        return <ArrowUp className="h-4 w-4 text-blue-500" />;
      case "downgraded":
        return <ArrowDown className="h-4 w-4 text-amber-500" />;
      case "trial_started":
      case "trial_expired":
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "activated":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
      case "deactivated":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
      case "upgraded":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      case "downgraded":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Recent Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Recent Changes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {history && history.length > 0 ? (
            <div className="divide-y">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5">{getActionIcon(entry.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium capitalize">{entry.module_id}</span>
                      <Badge variant="secondary" className={getActionColor(entry.action)}>
                        {entry.action}
                      </Badge>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {entry.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  {entry.monthly_price > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {entry.billing_tier}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <History className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No module changes yet</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
