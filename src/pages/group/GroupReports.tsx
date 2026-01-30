import { useState, useMemo } from 'react';
import { DollarSign, Users, TrendingUp, Building2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGroup } from '@/contexts/GroupContext';
import { useGroupReports } from '@/hooks/useGroupReports';

const PAGE_SIZE = 10;

type SortField = 'name' | 'students' | 'staff' | 'revenue' | 'collected' | 'outstanding' | 'rate';
type SortDirection = 'asc' | 'desc';

export default function GroupReports() {
  const { group, groupId } = useGroup();
  const { 
    campusReports, 
    consolidatedStats, 
    topByRevenue,
    topByCollection,
    isLoading 
  } = useGroupReports(groupId ?? undefined);

  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Sorted and paginated data
  const sortedReports = useMemo(() => {
    const sorted = [...campusReports].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      
      switch (sortField) {
        case 'name': aVal = a.campusName; bVal = b.campusName; break;
        case 'students': aVal = a.studentCount; bVal = b.studentCount; break;
        case 'staff': aVal = a.staffCount; bVal = b.staffCount; break;
        case 'revenue': aVal = a.totalRevenue; bVal = b.totalRevenue; break;
        case 'collected': aVal = a.collectedAmount; bVal = b.collectedAmount; break;
        case 'outstanding': aVal = a.outstandingAmount; bVal = b.outstandingAmount; break;
        case 'rate': aVal = a.collectionRate; bVal = b.collectionRate; break;
        default: aVal = a.totalRevenue; bVal = b.totalRevenue;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [campusReports, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedReports.length / PAGE_SIZE);
  const paginatedReports = sortedReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(1);
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="pb-3 font-medium text-right cursor-pointer hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </span>
    </th>
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Group Reports" subtitle="Loading...">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Consolidated Reports" 
      subtitle={`Financial overview for ${group?.name ?? 'your group'} (${campusReports.length} campuses)`}
    >
      <div className="space-y-6">
        {/* Consolidated Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(consolidatedStats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all campuses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(consolidatedStats.totalCollected)}
              </div>
              <p className="text-xs text-muted-foreground">
                {consolidatedStats.avgCollectionRate.toFixed(1)}% collection rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(consolidatedStats.totalOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending collection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {consolidatedStats.totalStudents.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Students across {campusReports.length} campuses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campus Comparison */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue by Campus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue by Campus
              </CardTitle>
              <CardDescription>
                Ranked by total invoiced amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topByRevenue.slice(0, 5).map((campus, index) => (
                <div key={campus.campusId} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{campus.campusName}</span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(campus.totalRevenue)}
                      </span>
                    </div>
                    <Progress 
                      value={(campus.totalRevenue / (topByRevenue[0]?.totalRevenue || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
              {topByRevenue.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No revenue data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Collection Rate by Campus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Collection Rate by Campus
              </CardTitle>
              <CardDescription>
                Ranked by fee collection percentage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topByCollection.slice(0, 5).map((campus, index) => (
                <div key={campus.campusId} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{campus.campusName}</span>
                      <Badge variant={campus.collectionRate >= 80 ? 'default' : campus.collectionRate >= 50 ? 'secondary' : 'destructive'}>
                        {campus.collectionRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={campus.collectionRate} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
              {topByCollection.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No collection data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Campus Table */}
        <Card>
          <CardHeader>
            <CardTitle>Campus Comparison</CardTitle>
            <CardDescription>
              Detailed breakdown of all {campusReports.length} campuses (click headers to sort)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th 
                      className="pb-3 font-medium cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <span className="inline-flex items-center gap-1">
                        Campus
                        <ArrowUpDown className={`h-3 w-3 ${sortField === 'name' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </span>
                    </th>
                    <SortableHeader field="students">Students</SortableHeader>
                    <SortableHeader field="staff">Staff</SortableHeader>
                    <SortableHeader field="revenue">Revenue</SortableHeader>
                    <SortableHeader field="collected">Collected</SortableHeader>
                    <SortableHeader field="outstanding">Outstanding</SortableHeader>
                    <SortableHeader field="rate">Rate</SortableHeader>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.map((campus) => (
                    <tr key={campus.campusId} className="border-b last:border-0">
                      <td className="py-3 font-medium">{campus.campusName}</td>
                      <td className="py-3 text-right">{campus.studentCount}</td>
                      <td className="py-3 text-right">{campus.staffCount}</td>
                      <td className="py-3 text-right">{formatCurrency(campus.totalRevenue)}</td>
                      <td className="py-3 text-right text-green-600">{formatCurrency(campus.collectedAmount)}</td>
                      <td className="py-3 text-right text-amber-600">{formatCurrency(campus.outstandingAmount)}</td>
                      <td className="py-3 text-right">
                        <Badge variant={campus.collectionRate >= 80 ? 'default' : campus.collectionRate >= 50 ? 'secondary' : 'destructive'}>
                          {campus.collectionRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="py-3">Total</td>
                    <td className="py-3 text-right">{consolidatedStats.totalStudents}</td>
                    <td className="py-3 text-right">{consolidatedStats.totalStaff}</td>
                    <td className="py-3 text-right">{formatCurrency(consolidatedStats.totalRevenue)}</td>
                    <td className="py-3 text-right text-green-600">{formatCurrency(consolidatedStats.totalCollected)}</td>
                    <td className="py-3 text-right text-amber-600">{formatCurrency(consolidatedStats.totalOutstanding)}</td>
                    <td className="py-3 text-right">
                      <Badge variant="outline">
                        {consolidatedStats.avgCollectionRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, sortedReports.length)} of {sortedReports.length} campuses
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
