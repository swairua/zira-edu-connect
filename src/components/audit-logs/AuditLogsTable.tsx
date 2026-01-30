import { format } from 'date-fns';
import type { AuditLog } from '@/hooks/useAuditLogs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { formatLabel } from '@/hooks/useAuditLogOptions';

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-success/10 text-success border-success/20',
  insert: 'bg-success/10 text-success border-success/20',
  update: 'bg-info/10 text-info border-info/20',
  delete: 'bg-destructive/10 text-destructive border-destructive/20',
  login: 'bg-primary/10 text-primary border-primary/20',
  logout: 'bg-muted text-muted-foreground border-border',
  export: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
  import: 'bg-accent text-accent-foreground border-accent',
};

export function AuditLogsTable({
  logs,
  isLoading,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: AuditLogsTableProps) {
  const getActionBadgeClass = (action: string) => {
    return ACTION_COLORS[action.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  const formatJsonValue = (value: unknown): string => {
    if (!value || (typeof value === 'object' && Object.keys(value as object).length === 0)) {
      return '';
    }
    return JSON.stringify(value, null, 2);
  };

  const hasDetails = (log: AuditLog): boolean => {
    const hasMetadata = log.metadata && Object.keys(log.metadata as object).length > 0;
    const hasOldValues = log.old_values && Object.keys(log.old_values as object).length > 0;
    const hasNewValues = log.new_values && Object.keys(log.new_values as object).length > 0;
    return hasMetadata || hasOldValues || hasNewValues;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12">
        <p className="text-muted-foreground">No audit logs found</p>
        <p className="text-sm text-muted-foreground/70">
          Audit logs will appear here as actions are performed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
              <TableHead className="w-[140px]">Entity Type</TableHead>
              <TableHead className="w-[200px]">Entity ID</TableHead>
              <TableHead className="w-[80px]">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{log.user_email || 'System'}</span>
                    {log.ip_address && (
                      <span className="text-xs text-muted-foreground">{log.ip_address}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getActionBadgeClass(log.action)}
                  >
                    {formatLabel(log.action)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatLabel(log.entity_type)}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {log.entity_id ? (
                    <span className="truncate" title={log.entity_id}>
                      {log.entity_id.substring(0, 8)}...
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {hasDetails(log) ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[500px] max-h-[400px] overflow-auto">
                        <div className="space-y-2 text-xs">
                          {log.old_values && Object.keys(log.old_values as object).length > 0 && (
                            <div>
                              <p className="font-semibold text-destructive mb-1">Previous Values:</p>
                              <pre className="whitespace-pre-wrap bg-destructive/10 p-2 rounded">
                                {formatJsonValue(log.old_values)}
                              </pre>
                            </div>
                          )}
                          {log.new_values && Object.keys(log.new_values as object).length > 0 && (
                            <div>
                              <p className="font-semibold text-success mb-1">New Values:</p>
                              <pre className="whitespace-pre-wrap bg-success/10 p-2 rounded">
                                {formatJsonValue(log.new_values)}
                              </pre>
                            </div>
                          )}
                          {log.metadata && Object.keys(log.metadata as object).length > 0 && (
                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Metadata:</p>
                              <pre className="whitespace-pre-wrap">
                                {formatJsonValue(log.metadata)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalCount)} of {totalCount} logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
