import { useState } from 'react';
import {
  Landmark,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  DollarSign,
  Users,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useCapitationRecords, useCreateCapitationRecord, useFunds } from '@/hooks/useAccounting';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const CAPITATION_TYPES = [
  { value: 'fpe', label: 'FPE (Free Primary Education)', color: 'bg-blue-100 text-blue-700' },
  { value: 'jss_tuition', label: 'JSS Tuition', color: 'bg-green-100 text-green-700' },
  { value: 'jss_operations', label: 'JSS Operations', color: 'bg-purple-100 text-purple-700' },
  { value: 'jss_infrastructure', label: 'JSS Infrastructure', color: 'bg-orange-100 text-orange-700' },
  { value: 'other', label: 'Other Grant', color: 'bg-gray-100 text-gray-700' },
];

type CapitationType = 'fpe' | 'jss_tuition' | 'jss_operations' | 'jss_infrastructure' | 'other';

const INITIAL_FORM = {
  capitation_type: 'fpe' as CapitationType,
  fund_id: '',
  academic_year_id: null as string | null,
  term_id: null as string | null,
  enrolled_learners: 0,
  rate_per_learner: 0,
  expected_amount: 0,
  received_amount: 0,
  disbursement_date: null as string | null,
  reference_number: '',
  notes: '',
};

export default function PortalCapitation() {
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const { data: records = [], isLoading } = useCapitationRecords(institutionId);
  const { data: funds = [] } = useFunds(institutionId);
  const createRecord = useCreateCapitationRecord();

  const filteredRecords = records.filter((record) => {
    if (typeFilter !== 'all' && record.capitation_type !== typeFilter) return false;
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      record.capitation_type.toLowerCase().includes(search) ||
      record.reference_number?.toLowerCase().includes(search)
    );
  });

  // Summary calculations
  const totalExpected = records.reduce((sum, r) => sum + r.expected_amount, 0);
  const totalReceived = records.reduce((sum, r) => sum + r.received_amount, 0);
  const totalPending = totalExpected - totalReceived;
  const collectionRate = totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenDialog = () => {
    setFormData(INITIAL_FORM);
    setDialogOpen(true);
  };

  const handleCalculateExpected = () => {
    const expected = formData.enrolled_learners * formData.rate_per_learner;
    setFormData((f) => ({ ...f, expected_amount: expected }));
  };

  const handleSave = async () => {
    if (!institutionId || !formData.fund_id) return;

    await createRecord.mutateAsync({
      ...formData,
      institution_id: institutionId,
      disbursement_date: formData.disbursement_date || null,
      receipt_id: null,
    });
    setDialogOpen(false);
  };

  return (
    <PortalLayout title="Capitation Tracking" subtitle="Government grants and disbursements">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Expected Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalExpected)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Collection Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{collectionRate.toFixed(1)}%</p>
              <Progress value={collectionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Capitation Records */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  Capitation Records
                </CardTitle>
                <CardDescription>Track government disbursements and grants</CardDescription>
              </div>
              <Button onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Record Capitation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {CAPITATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Records Table */}
            {isLoading ? (
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No capitation records found</p>
                <Button variant="outline" className="mt-4" onClick={handleOpenDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record your first capitation
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Fund</TableHead>
                    <TableHead className="text-center">Learners</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Expected</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const typeConfig = CAPITATION_TYPES.find(
                      (t) => t.value === record.capitation_type
                    );
                    const variance = record.received_amount - record.expected_amount;
                    const isFullyReceived = record.received_amount >= record.expected_amount;

                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Badge className={cn('text-xs', typeConfig?.color)}>
                            {typeConfig?.label || record.capitation_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.fund ? (
                            <span className="text-sm">{record.fund.fund_code}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {record.enrolled_learners.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(record.rate_per_learner)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(record.expected_amount)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span
                            className={cn(
                              isFullyReceived ? 'text-green-600' : 'text-amber-600'
                            )}
                          >
                            {formatCurrency(record.received_amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isFullyReceived ? (
                            <Badge className="bg-green-100 text-green-700">Received</Badge>
                          ) : record.received_amount > 0 ? (
                            <Badge className="bg-amber-100 text-amber-700">Partial</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.disbursement_date
                            ? format(new Date(record.disbursement_date), 'MMM d, yyyy')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Record Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Capitation</DialogTitle>
            <DialogDescription>Record a government grant or disbursement</DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capitation_type">Capitation Type</Label>
                <Select
                  value={formData.capitation_type}
                  onValueChange={(v) => setFormData((f) => ({ ...f, capitation_type: v as CapitationType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPITATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fund_id">Target Fund</Label>
                <Select
                  value={formData.fund_id}
                  onValueChange={(v) => setFormData((f) => ({ ...f, fund_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fund" />
                  </SelectTrigger>
                  <SelectContent>
                    {funds
                      .filter((f) => f.source === 'government')
                      .map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.fund_code} - {fund.fund_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrolled_learners">Enrolled Learners</Label>
                <Input
                  id="enrolled_learners"
                  type="number"
                  value={formData.enrolled_learners}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, enrolled_learners: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate_per_learner">Rate per Learner</Label>
                <Input
                  id="rate_per_learner"
                  type="number"
                  value={formData.rate_per_learner}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      rate_per_learner: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="1420"
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Amount</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.expected_amount}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        expected_amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCalculateExpected}
                    title="Calculate"
                  >
                    =
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="received_amount">Received Amount</Label>
                <Input
                  id="received_amount"
                  type="number"
                  value={formData.received_amount}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      received_amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disbursement_date">Disbursement Date</Label>
                <Input
                  id="disbursement_date"
                  type="date"
                  value={formData.disbursement_date || ''}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, disbursement_date: e.target.value || null }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => setFormData((f) => ({ ...f, reference_number: e.target.value }))}
                placeholder="MOE/2026/FPE/001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes..."
                rows={2}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.fund_id || createRecord.isPending}
            >
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
