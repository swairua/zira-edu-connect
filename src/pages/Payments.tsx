import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { useStudentPayments, useCreatePayment, usePaymentStats, StudentPayment } from '@/hooks/useStudentPayments';
import { useStudents } from '@/hooks/useStudents';
import { useStudentInvoices } from '@/hooks/useInvoices';
import { PaymentReversalDialog } from '@/components/finance/PaymentReversalDialog';
import { PaymentDetailsDialog } from '@/components/finance/PaymentDetailsDialog';
import { BulkPaymentImportDialog } from '@/components/finance/BulkPaymentImportDialog';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  CreditCard,
  Smartphone,
  Banknote,
  Loader2,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Upload,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

export default function Payments() {
  const { institutionId, institution } = useInstitution();
  const { user } = useAuth();
  const { can } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  // Selected payment for dialogs
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isReversalDialogOpen, setIsReversalDialogOpen] = useState(false);

  const { data: payments = [], isLoading, refetch } = useStudentPayments(institutionId, {
    paymentMethod: methodFilter !== 'all' ? methodFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: students = [] } = useStudents(institutionId);
  const { data: stats } = usePaymentStats(institutionId);
  const createPayment = useCreatePayment();

  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_reference: '',
    notes: '',
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { data: studentInvoices = [] } = useStudentInvoices(selectedStudentId);

  const handleStudentChange = (studentId: string) => {
    setFormData({ ...formData, student_id: studentId });
    setSelectedStudentId(studentId);
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.receipt_number.toLowerCase().includes(searchLower) ||
      payment.student?.first_name?.toLowerCase().includes(searchLower) ||
      payment.student?.last_name?.toLowerCase().includes(searchLower) ||
      payment.student?.admission_number?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddPayment = async () => {
    if (!institutionId || !formData.student_id || !formData.amount) return;

    await createPayment.mutateAsync({
      institution_id: institutionId,
      student_id: formData.student_id,
      amount: parseInt(formData.amount, 10),
      payment_method: formData.payment_method,
      payment_date: formData.payment_date,
      transaction_reference: formData.transaction_reference || undefined,
      received_by: user?.id,
      notes: formData.notes || undefined,
    });

    setFormData({
      student_id: '',
      amount: '',
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      transaction_reference: '',
      notes: '',
    });
    setSelectedStudentId(null);
    setIsAddDialogOpen(false);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-4 w-4" />;
      case 'bank':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Banknote className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout title="Payments" subtitle="Record and manage payments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground">
              Record and manage student payments for {institution?.name || 'your institution'}
            </p>
          </div>
          <div className="flex gap-2">
            <PermissionGate domain="finance" action="create">
              <Button variant="outline" className="gap-2" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </PermissionGate>
            <PermissionGate domain="finance" action="create">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Record Payment
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Enter payment details for a student
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">Student *</Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={handleStudentChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.admission_number} - {student.first_name} {student.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStudentId && studentInvoices.length > 0 && (
                    <div className="rounded-lg border p-3 text-sm">
                      <p className="font-medium">Outstanding Invoices:</p>
                      {studentInvoices
                        .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
                        .slice(0, 3)
                        .map(inv => (
                          <p key={inv.id} className="text-muted-foreground">
                            {inv.invoice_number}: KES {inv.total_amount.toLocaleString()}
                          </p>
                        ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (KES) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="method">Payment Method</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Payment Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">Transaction Reference</Label>
                    <Input
                      id="reference"
                      placeholder="e.g., M-Pesa code"
                      value={formData.transaction_reference}
                      onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPayment}
                    disabled={createPayment.isPending || !formData.student_id || !formData.amount}
                  >
                    {createPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Record Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGate>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Wallet className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold">
                    KES {(stats?.totalCollected || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{stats?.transactionCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Smartphone className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">M-Pesa</p>
                  <p className="text-2xl font-bold">
                    KES {(stats?.byMethod?.['mpesa'] || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>
                  {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:w-64"
                  />
                </div>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
                <PermissionGate domain="finance" action="export">
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </PermissionGate>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No payments found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm || methodFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by recording your first payment'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.receipt_number}
                        </TableCell>
                        <TableCell>
                          {payment.student?.first_name} {payment.student?.last_name}
                          <p className="text-sm text-muted-foreground">
                            {payment.student?.admission_number}
                          </p>
                        </TableCell>
                        <TableCell className="font-medium">
                          KES {payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.payment_method)}
                            <span className="capitalize">{payment.payment_method}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(payment.payment_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === 'confirmed'
                                ? 'default'
                                : payment.status === 'reversed'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedPayment(payment);
                                setIsDetailsDialogOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {payment.status === 'confirmed' && can('finance', 'edit') && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setIsReversalDialogOpen(true);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Reverse Payment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Dialog */}
        <PaymentDetailsDialog
          payment={selectedPayment}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          canReverse={can('finance', 'edit')}
          onReverse={() => {
            setIsDetailsDialogOpen(false);
            setIsReversalDialogOpen(true);
          }}
        />

        {/* Payment Reversal Dialog */}
        <PaymentReversalDialog
          payment={selectedPayment}
          open={isReversalDialogOpen}
          onOpenChange={setIsReversalDialogOpen}
          approvalThreshold={10000}
        />

        {/* Bulk Import Dialog */}
        {institutionId && (
          <BulkPaymentImportDialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
            institutionId={institutionId}
            onSuccess={() => refetch()}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
