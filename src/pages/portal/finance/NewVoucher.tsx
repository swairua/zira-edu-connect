import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calculator, Save, Send } from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFunds, useVoteheads, useBankAccounts, useCreatePaymentVoucher } from '@/hooks/useAccounting';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { format } from 'date-fns';

type PayeeType = 'supplier' | 'staff' | 'government' | 'other';

const PAYEE_TYPES: { value: PayeeType; label: string }[] = [
  { value: 'supplier', label: 'Supplier' },
  { value: 'staff', label: 'Staff' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'cheque', label: 'Cheque' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'cash', label: 'Cash' },
];

interface VoucherLine {
  id: string;
  description: string;
  votehead_id: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export default function NewVoucher() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  const { data: funds = [] } = useFunds(institutionId);
  const { data: voteheads = [] } = useVoteheads(institutionId);
  const { data: bankAccounts = [] } = useBankAccounts(institutionId);
  const createVoucher = useCreatePaymentVoucher();

  const [formData, setFormData] = useState({
    voucher_date: format(new Date(), 'yyyy-MM-dd'),
    payee_type: 'supplier' as PayeeType,
    payee_name: '',
    payee_details: '',
    fund_id: '',
    bank_account_id: '',
    payment_method: 'cheque',
    description: '',
    cheque_number: '',
  });

  const [lines, setLines] = useState<VoucherLine[]>([
    { id: crypto.randomUUID(), description: '', votehead_id: '', quantity: 1, unit_price: 0, amount: 0 },
  ]);

  const updateLine = (id: string, updates: Partial<VoucherLine>) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const updated = { ...line, ...updates };
        // Auto-calculate amount
        if ('quantity' in updates || 'unit_price' in updates) {
          updated.amount = updated.quantity * updated.unit_price;
        }
        return updated;
      })
    );
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: '', votehead_id: '', quantity: 1, unit_price: 0, amount: 0 },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const totalAmount = lines.reduce((sum, line) => sum + line.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = async (submitForApproval = false) => {
    if (!institutionId) return;

    // Validation
    if (!formData.payee_name || !formData.fund_id || !formData.bank_account_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (lines.every((l) => l.amount === 0)) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one line item with an amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createVoucher.mutateAsync({
        voucher: {
          institution_id: institutionId,
          voucher_date: formData.voucher_date,
          payee_type: formData.payee_type,
          payee_id: null,
          payee_name: formData.payee_name,
          fund_id: formData.fund_id || null,
          bank_account_id: formData.bank_account_id || null,
          payment_method: formData.payment_method,
          description: formData.description,
          purpose: formData.description,
          cheque_number: formData.cheque_number || null,
          cheque_date: null,
          total_amount: totalAmount,
          currency: 'KES',
          status: submitForApproval ? 'pending_check' : 'draft',
          checked_by: null,
          checked_at: null,
          approved_by: null,
          approved_at: null,
          secondary_approved_by: null,
          secondary_approved_at: null,
          paid_by: null,
          paid_at: null,
          rejection_reason: null,
          cancelled_by: null,
          cancelled_at: null,
          cancellation_reason: null,
          journal_entry_id: null,
          cashbook_entry_id: null,
          supporting_documents: [],
        },
        lines: lines.filter((l) => l.amount > 0).map((l, index) => ({
          institution_id: institutionId,
          description: l.description,
          votehead_id: l.votehead_id || null,
          account_id: null,
          quantity: l.quantity,
          unit_price: l.unit_price,
          amount: l.amount,
          line_order: index + 1,
        })),
      });

      toast({
        title: submitForApproval ? 'Voucher Submitted' : 'Voucher Saved',
        description: submitForApproval
          ? 'Voucher has been submitted for verification.'
          : 'Voucher saved as draft.',
      });

      navigate('/portal/vouchers');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save voucher. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PortalLayout title="New Payment Voucher" subtitle="Create a payment voucher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/portal/vouchers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Payment Voucher</h1>
            <p className="text-muted-foreground">Create a new payment voucher</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payee Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payee Information</CardTitle>
                <CardDescription>Who is being paid?</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voucher_date">Voucher Date</Label>
                    <Input
                      id="voucher_date"
                      type="date"
                      value={formData.voucher_date}
                      onChange={(e) => setFormData((f) => ({ ...f, voucher_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payee_type">Payee Type</Label>
                  <Select
                    value={formData.payee_type}
                    onValueChange={(v) => setFormData((f) => ({ ...f, payee_type: v as PayeeType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYEE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payee_name">Payee Name *</Label>
                  <Input
                    id="payee_name"
                    value={formData.payee_name}
                    onChange={(e) => setFormData((f) => ({ ...f, payee_name: e.target.value }))}
                    placeholder="Enter payee name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payee_details">Payee Details (Address, ID, etc.)</Label>
                  <Textarea
                    id="payee_details"
                    value={formData.payee_details}
                    onChange={(e) => setFormData((f) => ({ ...f, payee_details: e.target.value }))}
                    placeholder="Additional payee details..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Payment Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What is this payment for?"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Voucher Lines */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Line Items</CardTitle>
                    <CardDescription>Add items/expenses being paid</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addLine}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Line
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lines.map((line, index) => (
                    <div key={line.id} className="grid gap-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Line {index + 1}
                        </span>
                        {lines.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeLine(line.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={line.description}
                            onChange={(e) => updateLine(line.id, { description: e.target.value })}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Votehead</Label>
                          <Select
                            value={line.votehead_id || 'none'}
                            onValueChange={(v) =>
                              updateLine(line.id, { votehead_id: v === 'none' ? '' : v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select votehead" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No votehead</SelectItem>
                              {voteheads.map((vh) => (
                                <SelectItem key={vh.id} value={vh.id}>
                                  {vh.code} - {vh.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={line.quantity}
                            onChange={(e) =>
                              updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })
                            }
                            min={0}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            value={line.unit_price}
                            onChange={(e) =>
                              updateLine(line.id, { unit_price: parseFloat(e.target.value) || 0 })
                            }
                            min={0}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Amount</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={line.amount}
                              onChange={(e) =>
                                updateLine(line.id, { amount: parseFloat(e.target.value) || 0 })
                              }
                              className="font-mono"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={() =>
                                updateLine(line.id, { amount: line.quantity * line.unit_price })
                              }
                              title="Calculate"
                            >
                              <Calculator className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fund_id">Source Fund *</Label>
                  <Select
                    value={formData.fund_id}
                    onValueChange={(v) => setFormData((f) => ({ ...f, fund_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fund" />
                    </SelectTrigger>
                    <SelectContent>
                      {funds.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.fund_code} - {fund.fund_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_account_id">Bank Account *</Label>
                  <Select
                    value={formData.bank_account_id}
                    onValueChange={(v) => setFormData((f) => ({ ...f, bank_account_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(v) => setFormData((f) => ({ ...f, payment_method: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.payment_method === 'cheque' && (
                  <div className="space-y-2">
                    <Label htmlFor="cheque_number">Cheque Number</Label>
                    <Input
                      id="cheque_number"
                      value={formData.cheque_number}
                      onChange={(e) => setFormData((f) => ({ ...f, cheque_number: e.target.value }))}
                      placeholder="Enter cheque number"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => handleSave(true)}
                    disabled={createVoucher.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSave(false)}
                    disabled={createVoucher.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/portal/vouchers')}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
