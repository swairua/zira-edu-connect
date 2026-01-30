import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useIPNEvents,
  useIPNEventStats,
  useQueueStats,
  useRealtimeIPNEvents,
  type IPNEvent,
} from '@/hooks/useIPNEvents';
import { useBankIntegrations } from '@/hooks/useBankIntegrations';
import { useQueryClient } from '@tanstack/react-query';
import {
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Zap,
  FileJson,
} from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  received: { color: 'bg-blue-500', icon: Clock, label: 'Received' },
  validated: { color: 'bg-indigo-500', icon: CheckCircle2, label: 'Validated' },
  queued: { color: 'bg-yellow-500', icon: ArrowRight, label: 'Queued' },
  processed: { color: 'bg-green-500', icon: CheckCircle2, label: 'Processed' },
  failed: { color: 'bg-red-500', icon: XCircle, label: 'Failed' },
  duplicate: { color: 'bg-gray-500', icon: AlertTriangle, label: 'Duplicate' },
};

function EventStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.received;
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className="gap-1">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </Badge>
  );
}

export default function IPNGatewayMonitor() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [bankFilter, setBankFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<IPNEvent | null>(null);
  const [realtimeEvents, setRealtimeEvents] = useState<IPNEvent[]>([]);

  const { data: events, isLoading } = useIPNEvents({
    status: statusFilter || undefined,
    integrationId: bankFilter || undefined,
    limit: 100,
  });

  const { data: eventStats } = useIPNEventStats();
  const { data: queueStats } = useQueueStats();
  const { data: integrations } = useBankIntegrations();

  // Handle realtime events
  const handleNewEvent = useCallback((event: IPNEvent) => {
    setRealtimeEvents((prev) => [event, ...prev.slice(0, 9)]);
    queryClient.invalidateQueries({ queryKey: ['ipn-events'] });
    queryClient.invalidateQueries({ queryKey: ['ipn-event-stats'] });
  }, [queryClient]);

  useRealtimeIPNEvents(handleNewEvent);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['ipn-events'] });
    queryClient.invalidateQueries({ queryKey: ['ipn-event-stats'] });
    queryClient.invalidateQueries({ queryKey: ['queue-stats'] });
  };

  const filteredEvents = events?.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.external_reference?.toLowerCase().includes(query) ||
        event.bank_reference?.toLowerCase().includes(query) ||
        event.sender_phone?.includes(query) ||
        event.sender_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatCurrency = (amount: number | null, currency = 'KES') => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout
      title="IPN Gateway Monitor"
      subtitle="Central hub for all payment notifications from banks and mobile money"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{eventStats?.today || 0}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {eventStats?.byStatus.processed || 0}
                </p>
                <p className="text-sm text-muted-foreground">Processed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {queueStats?.pending || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {eventStats?.byStatus.failed || 0}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {queueStats?.manualReview || 0}
                </p>
                <p className="text-sm text-muted-foreground">Manual Review</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Realtime Feed */}
        {realtimeEvents.length > 0 && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                <CardTitle className="text-sm text-green-800">Live Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {realtimeEvents.map((event) => (
                  <Badge
                    key={event.id}
                    variant="outline"
                    className="cursor-pointer bg-white"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {event.platform_bank_integrations?.bank_code || 'unknown'} •{' '}
                    {formatCurrency(event.amount)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference, phone, name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="duplicate">Duplicate</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bankFilter || 'all'} onValueChange={(v) => setBankFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Banks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  {integrations?.map((integration) => (
                    <SelectItem key={integration.id} value={integration.id}>
                      {integration.bank_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>IPN Events</CardTitle>
            <CardDescription>
              Showing last 100 events. Click on an event to view full payload.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredEvents?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No IPN events found matching your criteria.
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents?.map((event) => (
                      <TableRow
                        key={event.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <TableCell className="text-xs">
                          {format(new Date(event.created_at), 'MMM d, HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {event.platform_bank_integrations?.bank_code || 'unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {event.external_reference || event.bank_reference || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{event.sender_name || '-'}</div>
                          <div className="text-xs text-muted-foreground">
                            {event.sender_phone || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(event.amount, event.currency)}
                        </TableCell>
                        <TableCell>
                          <EventStatusBadge status={event.status} />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon-sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Event Detail Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                IPN Event Details
              </DialogTitle>
              <DialogDescription>
                {selectedEvent && format(new Date(selectedEvent.created_at), 'PPpp')}
              </DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="font-medium">
                      {selectedEvent.platform_bank_integrations?.bank_name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <EventStatusBadge status={selectedEvent.status} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {formatCurrency(selectedEvent.amount, selectedEvent.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-mono text-sm">{selectedEvent.external_reference || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sender</p>
                    <p className="font-medium">{selectedEvent.sender_name || '-'}</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.sender_phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Reference</p>
                    <p className="font-mono text-sm">{selectedEvent.bank_reference || '-'}</p>
                  </div>
                </div>

                {/* Validation Errors */}
                {selectedEvent.validation_errors && selectedEvent.validation_errors.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="font-medium text-red-800">Validation Errors</p>
                    <ul className="mt-1 list-inside list-disc text-sm text-red-700">
                      {selectedEvent.validation_errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Raw Payload */}
                <div>
                  <p className="mb-2 font-medium">Raw Payload</p>
                  <ScrollArea className="h-[200px] rounded-lg border bg-muted/50 p-3">
                    <pre className="text-xs">
                      {JSON.stringify(selectedEvent.raw_payload, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>

                {/* Normalized Payload */}
                {selectedEvent.normalized_payload && (
                  <div>
                    <p className="mb-2 font-medium">Normalized Payload</p>
                    <ScrollArea className="h-[150px] rounded-lg border bg-muted/50 p-3">
                      <pre className="text-xs">
                        {JSON.stringify(selectedEvent.normalized_payload, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
