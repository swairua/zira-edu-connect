import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SystemStatsCards } from '@/components/system-health/SystemStatsCards';
import { RecentActivityFeed } from '@/components/system-health/RecentActivityFeed';
import { InstitutionStatusChart } from '@/components/system-health/InstitutionStatusChart';
import { CountryDistributionChart } from '@/components/system-health/CountryDistributionChart';
import { SystemStatusIndicator } from '@/components/system-health/SystemStatusIndicator';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function SystemHealth() {
  const queryClient = useQueryClient();
  const {
    stats,
    isLoadingStats,
    recentActivity,
    isLoadingActivity,
    institutionsByStatus,
    institutionsByCountry,
  } = useSystemHealth();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['system-health-stats'] });
    queryClient.invalidateQueries({ queryKey: ['system-recent-activity'] });
    queryClient.invalidateQueries({ queryKey: ['institutions-by-status'] });
    queryClient.invalidateQueries({ queryKey: ['institutions-by-country'] });
  };

  return (
    <DashboardLayout
      title="System Health"
      subtitle="Monitor system performance and activity in real-time"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <SystemStatsCards stats={stats} isLoading={isLoadingStats} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-1">
            <RecentActivityFeed activities={recentActivity} isLoading={isLoadingActivity} />
          </div>

          {/* Right Column - Charts and Status */}
          <div className="space-y-6 lg:col-span-2">
            {/* System Status */}
            <SystemStatusIndicator />

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <InstitutionStatusChart data={institutionsByStatus} />
              <CountryDistributionChart data={institutionsByCountry} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
