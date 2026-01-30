import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { format } from 'date-fns';
import { ArrowLeft, Printer, Download, Mail, FileDown } from 'lucide-react';
import { generateInvoicePDF, generateReceiptPDF } from '@/lib/pdf-generators';
import { downloadInvoicePDF, downloadReceiptPDF } from '@/lib/pdf/invoice-pdf';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { institution } = useInstitution();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice-detail', id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch invoice with explicit select to avoid deep type instantiation
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('student_invoices')
        .select('id, invoice_number, status, total_amount, currency, due_date, created_at, student_id, academic_year_id, term_id')
        .eq('id', id)
        .maybeSingle();

      if (invoiceError) throw invoiceError;
      if (!invoiceData) return null;

      // Fetch related data in parallel
      const [studentRes, linesRes, yearRes, termRes] = await Promise.all([
        supabase.from('students').select('id, first_name, last_name, admission_number, class_id').eq('id', invoiceData.student_id).maybeSingle(),
        supabase.from('invoice_lines').select('id, description, quantity, unit_amount, total_amount').eq('invoice_id', id),
        invoiceData.academic_year_id ? supabase.from('academic_years').select('name').eq('id', invoiceData.academic_year_id).maybeSingle() : null,
        invoiceData.term_id ? supabase.from('terms').select('name').eq('id', invoiceData.term_id).maybeSingle() : null,
      ]);

      // Fetch class if student exists
      let classData = null;
      if (studentRes.data?.class_id) {
        const classRes = await supabase.from('classes').select('name, level').eq('id', studentRes.data.class_id).maybeSingle();
        classData = classRes.data;
      }

      return {
        ...invoiceData,
        student: studentRes.data ? { ...studentRes.data, class: classData } : null,
        invoice_lines: linesRes.data || [],
        academic_year: yearRes?.data || null,
        term: termRes?.data || null,
      };
    },
    enabled: !!id,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['invoice-payments', id],
    queryFn: async () => {
      if (!id) return [];

      // First get payment allocations for this invoice
      const { data: allocations, error: allocError } = await supabase
        .from('payment_allocations')
        .select('payment_id, amount')
        .eq('invoice_id', id);

      if (allocError) throw allocError;
      if (!allocations || allocations.length === 0) return [];

      // Get payment details
      const paymentIds = allocations.map(a => a.payment_id);
      const { data: paymentData, error: payError } = await supabase
        .from('student_payments')
        .select('id, receipt_number, payment_date, payment_method, transaction_reference, amount')
        .in('id', paymentIds)
        .order('payment_date', { ascending: false });

      if (payError) throw payError;
      return paymentData || [];
    },
    enabled: !!id,
  });

  const getStatusBadge = (status: string | null | undefined) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Draft', variant: 'outline' },
      posted: { label: 'Posted', variant: 'secondary' },
      partially_paid: { label: 'Partial', variant: 'secondary' },
      paid: { label: 'Paid', variant: 'default' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
    };
    const config = statusMap[status || 'draft'] || statusMap.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = (invoice?.total_amount || 0) - totalPaid;

  const handlePrintInvoice = () => {
    if (!invoice || !institution) return;
    generateInvoicePDF({ invoice, institution, lines: invoice.invoice_lines || [] });
  };

  const handleDownloadInvoice = () => {
    if (!invoice || !institution) return;
    downloadInvoicePDF({
      invoice: {
        ...invoice,
        student: invoice.student,
        academic_year: invoice.academic_year,
        term: invoice.term,
      },
      institution,
      lines: invoice.invoice_lines || [],
    });
  };

  const handlePrintReceipt = () => {
    if (!invoice || !institution || payments.length === 0) return;
    generateReceiptPDF({ invoice, institution, payments, totalPaid });
  };

  const handleDownloadReceipt = () => {
    if (!invoice || !institution || payments.length === 0) return;
    downloadReceiptPDF({
      invoice: {
        ...invoice,
        student: invoice.student,
      },
      institution,
      payments,
      totalPaid,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Invoice Details" subtitle="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout title="Invoice Not Found" subtitle="">
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-xl font-semibold">Invoice not found</h2>
          <Button className="mt-4" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={`Invoice ${invoice.invoice_number}`} 
      subtitle={`${invoice.student?.first_name} ${invoice.student?.last_name}`}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadInvoice}>
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrintInvoice}>
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
            {payments.length > 0 && (
              <>
                <Button variant="outline" onClick={handleDownloadReceipt}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
                <Button variant="outline" onClick={handlePrintReceipt}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{invoice.invoice_number}</CardTitle>
                  <CardDescription>
                    {invoice.academic_year?.name} - {invoice.term?.name || 'No Term'}
                  </CardDescription>
                </div>
                {getStatusBadge(invoice.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Student</h4>
                <p className="font-semibold">{invoice.student?.first_name} {invoice.student?.last_name}</p>
                <p className="text-sm text-muted-foreground">{invoice.student?.admission_number}</p>
                <p className="text-sm text-muted-foreground">{invoice.student?.class?.name}</p>
              </div>

              <Separator />

              <div>
                <h4 className="mb-4 text-sm font-medium">Invoice Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.invoice_lines?.map((line: any) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell className="text-right">{line.quantity || 1}</TableCell>
                        <TableCell className="text-right">
                          {invoice.currency || 'KES'} {(line.unit_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {invoice.currency || 'KES'} {(line.total_amount || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {invoice.currency || 'KES'} {invoice.total_amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Date</span>
                <span className="font-medium">{format(new Date(invoice.created_at || new Date()), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">{format(new Date(invoice.due_date), 'dd MMM yyyy')}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-medium">{invoice.currency || 'KES'} {invoice.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium text-success">{invoice.currency || 'KES'} {totalPaid.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Balance Due</span>
                <span className={`font-bold ${balance > 0 ? 'text-destructive' : 'text-success'}`}>
                  {invoice.currency || 'KES'} {balance.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>{payments.length} payment(s) recorded</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono">{payment.receipt_number}</TableCell>
                      <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="capitalize">{payment.payment_method}</TableCell>
                      <TableCell>{payment.transaction_reference || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {invoice.currency || 'KES'} {(payment.amount || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
