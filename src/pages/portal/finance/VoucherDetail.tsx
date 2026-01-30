import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Building,
  CreditCard,
  User,
  Calendar,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentVoucherDetail, useApproveVoucher, VOUCHER_ROLE_MATRIX } from '@/hooks/useAccounting';
import { useFinanceSettings } from '@/hooks/useFinanceSettings';
import { ApprovalTrail, buildVoucherApprovalSteps } from '@/components/approvals/ApprovalTrail';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof FileText; className: string }> = {
  draft: { label: 'Draft', icon: FileText, className: 'bg-gray-100 text-gray-700' },
  pending_check: { label: 'Pending Check', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
  pending_approval: { label: 'Pending Approval', icon: Clock, className: 'bg-orange-100 text-orange-700' },
  pending_secondary_approval: { label: 'Pending Final Approval', icon: Clock, className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
  paid: { label: 'Paid', icon: CheckCircle, className: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-red-100 text-red-700' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

export default function VoucherDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { userRoles } = useAuth();
  const { data: voucher, isLoading } = usePaymentVoucherDetail(id || null);
  const approveVoucher = useApproveVoucher();
  
  // Get institution settings for approval levels
  const institutionId = userRoles.find(r => r.institution_id)?.institution_id;
  const { data: financeSettings } = useFinanceSettings(institutionId);
  const approvalLevels = financeSettings?.voucher_approval_levels || 2;

  // Check if user has permission for specific voucher actions
  const canCheck = userRoles.some(ur => VOUCHER_ROLE_MATRIX.check.includes(ur.role as any));
  const canApprove = userRoles.some(ur => VOUCHER_ROLE_MATRIX.approve.includes(ur.role as any));
  const canSecondaryApprove = userRoles.some(ur => VOUCHER_ROLE_MATRIX.secondary_approve.includes(ur.role as any));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAction = async (action: 'check' | 'approve' | 'secondary_approve' | 'reject') => {
    if (!id) return;
    try {
      await approveVoucher.mutateAsync({ id, action, approvalLevels });
      const messages: Record<string, string> = {
        check: 'verified and forwarded',
        approve: approvalLevels === 3 ? 'approved (Level 1)' : 'approved',
        secondary_approve: 'final approval granted',
        reject: 'rejected',
      };
      toast({
        title: 'Success',
        description: `Voucher ${messages[action]} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update voucher status.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <PortalLayout title="Voucher Details" subtitle="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PortalLayout>
    );
  }

  if (!voucher) {
    return (
      <PortalLayout title="Voucher Not Found" subtitle="The requested voucher could not be found">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">Voucher not found</p>
          <Button onClick={() => navigate('/portal/vouchers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vouchers
          </Button>
        </div>
      </PortalLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[voucher.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  return (
    <PortalLayout title={`Voucher ${voucher.voucher_number}`} subtitle="Payment voucher details">
      <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/portal/vouchers')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {voucher.voucher_number}
                <Badge className={cn('ml-2', statusConfig.className)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Created on {format(new Date(voucher.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {voucher.status === 'draft' && canCheck && (
              <Button onClick={() => handleAction('check')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit for Check
              </Button>
            )}
            {voucher.status === 'pending_check' && canCheck && (
              <Button onClick={() => handleAction('check')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify & Forward
              </Button>
            )}
            {voucher.status === 'pending_approval' && canApprove && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Voucher?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject this voucher? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleAction('reject')}>
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={() => handleAction('approve')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {approvalLevels === 3 ? 'Approve (Level 1)' : 'Approve'}
                </Button>
              </>
            )}
            {voucher.status === 'pending_secondary_approval' && canSecondaryApprove && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Voucher?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject this voucher at the final approval stage?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleAction('reject')}>
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={() => handleAction('secondary_approve')}>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Final Approval
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">PAYMENT VOUCHER</h1>
          <p className="text-lg">{voucher.voucher_number}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voucher Details */}
            <Card>
              <CardHeader>
                <CardTitle>Voucher Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Voucher Date</p>
                      <p className="font-medium">
                        {format(new Date(voucher.voucher_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Voucher Number</p>
                      <p className="font-medium font-mono">{voucher.voucher_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Payee</p>
                      <p className="font-medium">{voucher.payee_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        ({voucher.payee_type})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">
                        {voucher.payment_method?.replace('_', ' ') || 'N/A'}
                      </p>
                      {voucher.cheque_number && (
                        <p className="text-sm text-muted-foreground">
                          Cheque: {voucher.cheque_number}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {voucher.description && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p>{voucher.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Itemized breakdown of expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Votehead</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voucher.lines && voucher.lines.length > 0 ? (
                      voucher.lines.map((line: any, index: number) => (
                        <TableRow key={line.id || index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{line.description || '-'}</TableCell>
                          <TableCell>
                            {line.votehead ? (
                              <Badge variant="outline">{line.votehead.code}</Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">{line.quantity || 1}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(line.unit_price || line.amount || 0)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {formatCurrency(line.amount || 0)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No line items
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-semibold">
                        Total Amount
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-lg">
                        {formatCurrency(voucher.total_amount)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 print:hidden">
            {/* Fund & Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fund</p>
                    {voucher.fund ? (
                      <>
                        <p className="font-medium">{voucher.fund.fund_name}</p>
                        <Badge variant="outline" className="mt-1">
                          {voucher.fund.fund_code}
                        </Badge>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No fund assigned</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Account</p>
                    {voucher.bank_account ? (
                      <>
                        <p className="font-medium">{voucher.bank_account.account_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {voucher.bank_account.bank_name}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No account assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Trail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Approval Trail
                  {approvalLevels === 3 && (
                    <Badge variant="outline" className="text-xs">3-Level</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ApprovalTrail 
                  steps={buildVoucherApprovalSteps(voucher, approvalLevels)} 
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Print Footer - Signatures */}
        <div className="hidden print:block mt-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="border-t border-black pt-2">Prepared By</div>
            </div>
            <div>
              <div className="border-t border-black pt-2">Checked By</div>
            </div>
            <div>
              <div className="border-t border-black pt-2">Approved By</div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
