import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Download, RefreshCw } from 'lucide-react';
import { useDemoRequests } from '@/hooks/useDemoRequests';
import { DemoStatsCards } from '@/components/demo/DemoStatsCards';
import { DemoRequestsTable } from '@/components/demo/DemoRequestsTable';

export default function DemoRequests() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { requests, stats, isLoading, updateStatus, deleteRequest, isUpdating, isDeleting } = useDemoRequests();

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.name.toLowerCase().includes(search.toLowerCase()) ||
      request.email.toLowerCase().includes(search.toLowerCase()) ||
      request.school_name.toLowerCase().includes(search.toLowerCase()) ||
      request.phone.includes(search);
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Phone', 'School', 'Status', 'Notes'];
    const rows = requests.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      r.name,
      r.email,
      r.phone,
      r.school_name,
      r.status,
      r.notes || '',
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demo-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Demo Requests">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Demo Requests">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Demo Requests</h1>
            <p className="text-muted-foreground">
              Manage and follow up on demo requests from potential customers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <DemoStatsCards stats={stats} />

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>All Requests</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="contacted">Contacted ({stats.contacted})</TabsTrigger>
                <TabsTrigger value="converted">Converted ({stats.converted})</TabsTrigger>
              </TabsList>

              <TabsContent value={statusFilter} className="mt-0">
                <DemoRequestsTable
                  requests={filteredRequests}
                  onUpdateStatus={updateStatus}
                  onDelete={deleteRequest}
                  isUpdating={isUpdating || isDeleting}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
