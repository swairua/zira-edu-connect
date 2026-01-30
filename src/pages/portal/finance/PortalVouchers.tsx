import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Banknote,
  Loader2,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePaymentVouchers, useApproveVoucher, useMarkVoucherPaid, useBankAccounts, PaymentVoucher } from '@/hooks/useAccounting';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FileText, className: 'bg-gray-100 text-gray-700' },
  pending_check: { label: 'Pending Check', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
  pending_approval: { label: 'Pending Approval', icon: AlertTriangle, className: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
  paid: { label: 'Paid', icon: CheckCircle, className: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-red-100 text-red-700' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

export default function PortalVouchers() {
  const navigate = useNavigate();
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PaymentVoucher | null>(null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [chequeNumber, setChequeNumber] = useState<string>('');

  const { data: vouchers = [], isLoading } = usePaymentVouchers(
    institutionId,
    statusFilter !== 'all' ? statusFilter : undefined
  );
  const { data: bankAccounts = [] } = useBankAccounts(institutionId);
  const approveVoucher = useApproveVoucher();
  const markVoucherPaid = useMarkVoucherPaid();

  const filteredVouchers = vouchers.filter((voucher) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      voucher.voucher_number.toLowerCase().includes(search) ||
      voucher.payee_name.toLowerCase().includes(search) ||
      voucher.description.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Stats
  const stats = {
    total: vouchers.length,
    pending: vouchers.filter((v) => ['pending_check', 'pending_approval'].includes(v.status)).length,
    approved: vouchers.filter((v) => v.status === 'approved').length,
    paid: vouchers.filter((v) => v.status === 'paid').length,
    totalAmount: vouchers.filter((v) => v.status === 'paid').reduce((sum, v) => sum + v.total_amount, 0),
  };

  const handleAction = (voucherId: string, action: 'check' | 'approve' | 'reject') => {
    approveVoucher.mutate({ id: voucherId, action });
  };

  const handleOpenPayDialog = (voucher: PaymentVoucher) => {
    setSelectedVoucher(voucher);
    setSelectedBankAccountId(voucher.bank_account_id || '');
    setPaymentMethod(voucher.payment_method || 'bank_transfer');
    setChequeNumber(voucher.cheque_number || '');
    setPayDialogOpen(true);
  };

  const handleMarkAsPaid = () => {
    if (!selectedVoucher || !selectedBankAccountId) return;
    
    markVoucherPaid.mutate(
      {
        voucherId: selectedVoucher.id,
        bankAccountId: selectedBankAccountId,
        paymentMethod,
        chequeNumber: paymentMethod === 'cheque' ? chequeNumber : undefined,
      },
      {
        onSuccess: () => {
          setPayDialogOpen(false);
          setSelectedVoucher(null);
        },
      }
    );
  };

  return (
    <PortalLayout title="Payment Vouchers" subtitle="Manage payment vouchers and approvals">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Vouchers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Vouchers List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Vouchers
              </CardTitle>
              <Button onClick={() => navigate('/portal/vouchers/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Voucher
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vouchers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_check">Pending Check</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voucher #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Fund</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          {Array(8)
                            .fill(0)
                            .map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                        </TableRow>
                      ))
                  ) : filteredVouchers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No vouchers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVouchers.map((voucher) => {
                      const statusConfig = STATUS_CONFIG[voucher.status] || STATUS_CONFIG.draft;
                      const StatusIcon = statusConfig.icon;
                      return (
                        <TableRow key={voucher.id}>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-0.5 rounded font-mono">
                              {voucher.voucher_number}
                            </code>
                          </TableCell>
                          <TableCell>
                            {format(new Date(voucher.voucher_date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{voucher.payee_name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {voucher.payee_type}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {voucher.description}
                          </TableCell>
                          <TableCell>
                            {voucher.fund ? (
                              <Badge variant="outline">{voucher.fund.fund_code}</Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(voucher.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('gap-1', statusConfig.className)}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/portal/vouchers/${voucher.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {voucher.status === 'draft' && (
                                  <DropdownMenuItem
                                    onClick={() => handleAction(voucher.id, 'check')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Submit for Check
                                  </DropdownMenuItem>
                                )}
                                {voucher.status === 'pending_check' && (
                                  <DropdownMenuItem
                                    onClick={() => handleAction(voucher.id, 'check')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Verify & Forward
                                  </DropdownMenuItem>
                                )}
                                {voucher.status === 'pending_approval' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleAction(voucher.id, 'approve')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleAction(voucher.id, 'reject')}
                                      className="text-destructive"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {voucher.status === 'approved' && (
                                  <DropdownMenuItem
                                    onClick={() => handleOpenPayDialog(voucher)}
                                    className="text-primary"
                                  >
                                    <Banknote className="h-4 w-4 mr-2" />
                                    Mark as Paid
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mark as Paid Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Voucher as Paid</DialogTitle>
            <DialogDescription>
              This will create a journal entry and update the cashbook.
            </DialogDescription>
          </DialogHeader>

          {selectedVoucher && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{selectedVoucher.payee_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedVoucher.description}</p>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(selectedVoucher.total_amount)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account">Pay From Bank Account *</Label>
                <Select value={selectedBankAccountId} onValueChange={setSelectedBankAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.filter(ba => ba.is_active).map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name} - {account.bank_name}
                        <span className="text-muted-foreground ml-2">
                          ({formatCurrency(account.current_balance)})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mpesa">M-PESA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'cheque' && (
                <div className="space-y-2">
                  <Label htmlFor="cheque_number">Cheque Number</Label>
                  <Input
                    id="cheque_number"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    placeholder="Enter cheque number"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={!selectedBankAccountId || markVoucherPaid.isPending}
            >
              {markVoucherPaid.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
