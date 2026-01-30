import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FinanceStatsCards } from '@/components/finance/FinanceStatsCards';
import { AgingAnalysisChart } from '@/components/finance/AgingAnalysisChart';
import { DefaulterList } from '@/components/finance/DefaulterList';
import { RecentPaymentsList } from '@/components/finance/RecentPaymentsList';
import { CollectionProjection } from '@/components/finance/CollectionProjection';
import { SendRemindersDialog } from '@/components/finance/SendRemindersDialog';
import { RealtimePaymentFeed } from '@/components/finance/RealtimePaymentFeed';
import { useFinance } from '@/hooks/useFinance';
import { useRealtimePayments } from '@/hooks/useRealtimePayments';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Download, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function Finance() {
  const queryClient = useQueryClient();
  const {
    stats,
    isLoadingStats,
    aging,
    isLoadingAging,
    defaulters,
    isLoadingDefaulters,
    recentPayments,
    isLoadingPayments,
  } = useFinance();

  const { recentNotifications, isConnected, clearNotifications } = useRealtimePayments();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
    queryClient.invalidateQueries({ queryKey: ['finance-aging'] });
    queryClient.invalidateQueries({ queryKey: ['finance-defaulters'] });
    queryClient.invalidateQueries({ queryKey: ['finance-recent-payments'] });
  };

  return (
    <DashboardLayout
      title="Finance"
      subtitle="Fee collection, aging analysis, and defaulter tracking"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs defaultValue="overview" className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <SendRemindersDialog onSuccess={handleRefresh} />
            <Button variant="gradient" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <FinanceStatsCards stats={stats} isLoading={isLoadingStats} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Charts */}
          <div className="space-y-6 lg:col-span-2">
            <AgingAnalysisChart data={aging} isLoading={isLoadingAging} />
            <CollectionProjection />
          </div>

          {/* Right Column - Live Feed & Lists */}
          <div className="space-y-6">
            <RealtimePaymentFeed
              notifications={recentNotifications}
              isConnected={isConnected}
              onClear={clearNotifications}
            />
            <RecentPaymentsList payments={recentPayments} isLoading={isLoadingPayments} />
          </div>
        </div>

        {/* Full Width Defaulter List */}
        <DefaulterList defaulters={defaulters} isLoading={isLoadingDefaulters} />
      </div>
    </DashboardLayout>
  );
}
