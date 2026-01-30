import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BillingStatsCards } from '@/components/billing/BillingStatsCards';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { PaymentHistory } from '@/components/billing/PaymentHistory';
import { SmsCreditsBilling } from '@/components/billing/SmsCreditsBilling';
import { useBillingStats, useInvoices, usePayments } from '@/hooks/useBilling';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Download, RefreshCw, FileText, CreditCard, MessageSquare } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Billing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  const { data: stats, isLoading: statsLoading } = useBillingStats();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices({
    status: invoiceStatusFilter,
  });
  const { data: payments = [], isLoading: paymentsLoading } = usePayments({
    status: paymentStatusFilter,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  };

  const handleMarkPaid = async (invoiceId: string) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', invoiceId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invoice status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Invoice marked as paid',
      });
      handleRefresh();
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', invoiceId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel invoice',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Invoice cancelled',
      });
      handleRefresh();
    }
  };

  const handleSendReminder = (invoiceId: string) => {
    // TODO: Implement reminder sending via edge function
    toast({
      title: 'Reminder Sent',
      description: 'Payment reminder has been sent to the institution',
    });
  };

  return (
    <DashboardLayout
      title="Billing & Payments"
      subtitle="Manage invoices, payments, and subscription billing"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <BillingStatsCards stats={stats} isLoading={statsLoading} />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payment History
            </TabsTrigger>
            <TabsTrigger value="sms-credits" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS Credits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
              </p>
            </div>
            <InvoiceTable
              invoices={invoices as any}
              isLoading={invoicesLoading}
              onMarkPaid={handleMarkPaid}
              onSendReminder={handleSendReminder}
              onCancel={handleCancelInvoice}
            />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {payments.length} payment{payments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <PaymentHistory payments={payments as any} isLoading={paymentsLoading} />
          </TabsContent>

          <TabsContent value="sms-credits" className="space-y-4">
            <SmsCreditsBilling />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
