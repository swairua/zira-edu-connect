import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuditLogsFilters } from '@/components/audit-logs/AuditLogsFilters';
import { AuditLogsTable } from '@/components/audit-logs/AuditLogsTable';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function AuditLogs() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('all');
  const [entityType, setEntityType] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const filters = {
    search,
    action,
    entityType,
    dateFrom,
    dateTo,
  };

  const { logs, totalCount, totalPages, isLoading } = useAuditLogs(filters, page);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setAction('all');
    setEntityType('all');
    setDateFrom(null);
    setDateTo(null);
    setPage(1);
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Timestamp', 'User Email', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Metadata'];
    const rows = logs.map((log) => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.user_email || '',
      log.action,
      log.entity_type,
      log.entity_id || '',
      log.ip_address || '',
      JSON.stringify(log.metadata || {}),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleActionChange = (value: string) => {
    setAction(value);
    setPage(1);
  };

  const handleEntityTypeChange = (value: string) => {
    setEntityType(value);
    setPage(1);
  };

  const handleDateFromChange = (date: Date | null) => {
    setDateFrom(date);
    setPage(1);
  };

  const handleDateToChange = (date: Date | null) => {
    setDateTo(date);
    setPage(1);
  };

  return (
    <DashboardLayout
      title="Audit Logs"
      subtitle="Track all system activities and user actions"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Real-time activity monitoring for security and compliance
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={logs.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <AuditLogsFilters
          search={search}
          onSearchChange={handleSearchChange}
          action={action}
          onActionChange={handleActionChange}
          entityType={entityType}
          onEntityTypeChange={handleEntityTypeChange}
          dateFrom={dateFrom}
          onDateFromChange={handleDateFromChange}
          dateTo={dateTo}
          onDateToChange={handleDateToChange}
          onClearFilters={handleClearFilters}
        />

        {/* Table */}
        <AuditLogsTable
          logs={logs}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
