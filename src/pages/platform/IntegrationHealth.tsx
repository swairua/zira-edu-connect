import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useIntegrationHealthSummary,
  useIntegrationHealthLogs,
  useIntegrationAlerts,
  useAcknowledgeAlert,
  useResolveAlert,
} from '@/hooks/useIntegrationHealth';
import { useQueryClient } from '@tanstack/react-query';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Clock,
  Bell,
  BellOff,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';

const healthStatusStyles = {
  healthy: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
  degraded: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
  down: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
  unknown: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
};

const alertSeverityStyles = {
  info: { bg: 'bg-blue-100', text: 'text-blue-800' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  critical: { bg: 'bg-red-100', text: 'text-red-800' },
};

export default function IntegrationHealth() {
  const [searchParams] = useSearchParams();
  const bankFilter = searchParams.get('bank');
  const queryClient = useQueryClient();

  const { data: summary, isLoading: summaryLoading } = useIntegrationHealthSummary();
  const { data: logs, isLoading: logsLoading } = useIntegrationHealthLogs(undefined, 200);
  const { data: alerts, isLoading: alertsLoading } = useIntegrationAlerts({ unresolvedOnly: true });

  const acknowledgeMutation = useAcknowledgeAlert();
  const resolveMutation = useResolveAlert();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['integration-health-summary'] });
    queryClient.invalidateQueries({ queryKey: ['integration-health-logs'] });
    queryClient.invalidateQueries({ queryKey: ['integration-alerts'] });
  };

  // Filter by bank if specified
  const filteredSummary = bankFilter
    ? summary?.filter((s) => s.bank_code === bankFilter)
    : summary;

  const activeIntegrations = summary?.filter((s) => s.is_active) || [];
  const healthyCount = activeIntegrations.filter((s) => s.health_status === 'healthy').length;
  const degradedCount = activeIntegrations.filter((s) => s.health_status === 'degraded').length;
  const downCount = activeIntegrations.filter((s) => s.health_status === 'down').length;

  return (
    <DashboardLayout
      title="Integration Health"
      subtitle="Monitor bank API health, latency, and alerts"
    >
      <div className="space-y-6">
        {/* Health Overview Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{healthyCount}</p>
                  <p className="text-sm text-muted-foreground">Healthy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{degradedCount}</p>
                  <p className="text-sm text-muted-foreground">Degraded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{downCount}</p>
                  <p className="text-sm text-muted-foreground">Down</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{alerts?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Status Grid */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>Real-time health status of all bank integrations</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSummary?.map((integration) => {
                  const statusStyle = healthStatusStyles[integration.health_status];
                  const StatusIcon = statusStyle.icon;

                  return (
                    <Card
                      key={integration.id}
                      className={`${integration.is_active ? '' : 'opacity-50'}`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{integration.bank_name}</p>
                            <p className="text-xs text-muted-foreground">{integration.bank_code}</p>
                          </div>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {integration.health_status}
                          </Badge>
                        </div>

                        <div className="mt-4 space-y-2">
                          {/* Uptime */}
                          <div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">24h Uptime</span>
                              <span>
                                {integration.uptime24h !== null
                                  ? `${integration.uptime24h.toFixed(1)}%`
                                  : 'N/A'}
                              </span>
                            </div>
                            <Progress
                              value={integration.uptime24h || 0}
                              className="mt-1 h-1.5"
                            />
                          </div>

                          {/* Response Time */}
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Avg Response</span>
                            <span>
                              {integration.avgResponseTime24h !== null
                                ? `${Math.round(integration.avgResponseTime24h)}ms`
                                : 'N/A'}
                            </span>
                          </div>

                          {/* Alerts */}
                          {integration.activeAlerts > 0 && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <Bell className="h-3 w-3" />
                              {integration.activeAlerts} active alert
                              {integration.activeAlerts > 1 ? 's' : ''}
                              {integration.criticalAlerts > 0 && (
                                <Badge variant="destructive" className="ml-1 h-4 px-1 text-xs">
                                  {integration.criticalAlerts} critical
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Alerts and Logs */}
        <Tabs defaultValue="alerts">
          <TabsList>
            <TabsTrigger value="alerts">
              Active Alerts ({alerts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="logs">Health Logs</TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardContent className="pt-6">
                {alertsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : alerts?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BellOff className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground">No active alerts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts?.map((alert) => {
                      const severityStyle = alertSeverityStyles[alert.severity];

                      return (
                        <div
                          key={alert.id}
                          className={`rounded-lg border p-4 ${
                            alert.severity === 'critical' ? 'border-red-200 bg-red-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge className={`${severityStyle.bg} ${severityStyle.text}`}>
                                  {alert.severity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {alert.platform_bank_integrations?.bank_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                                </span>
                              </div>
                              <p className="mt-1 font-medium">{alert.title}</p>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                            </div>
                            <div className="flex gap-2">
                              {!alert.is_acknowledged && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => acknowledgeMutation.mutate(alert.id)}
                                  disabled={acknowledgeMutation.isPending}
                                >
                                  Acknowledge
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resolveMutation.mutate(alert.id)}
                                disabled={resolveMutation.isPending}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Resolve
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardContent className="pt-6">
                {logsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Bank</TableHead>
                          <TableHead>Check Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Response Time</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs?.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-xs">
                              {format(new Date(log.checked_at), 'MMM d, HH:mm:ss')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {log.platform_bank_integrations?.bank_code}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize text-sm">
                              {log.check_type}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={log.status === 'success' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {log.response_time_ms ? `${log.response_time_ms}ms` : '-'}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                              {log.error_message || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
