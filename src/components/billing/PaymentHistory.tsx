import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentWithRelations {
  id: string;
  amount: number;
  currency: string | null;
  payment_method: string | null;
  transaction_ref: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  institutions: {
    id: string;
    name: string;
  } | null;
  invoices: {
    id: string;
    invoice_number: string;
  } | null;
}

interface PaymentHistoryProps {
  payments: PaymentWithRelations[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
  refunded: 'bg-muted text-muted-foreground border-border',
};

const METHOD_LABELS: Record<string, string> = {
  mpesa: 'M-Pesa',
  bank_transfer: 'Bank Transfer',
  card: 'Card',
  cash: 'Cash',
  other: 'Other',
};

const formatCurrency = (amount: number, currency: string = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
};

export function PaymentHistory({ payments, isLoading }: PaymentHistoryProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12">
        <p className="text-muted-foreground">No payments recorded</p>
        <p className="text-sm text-muted-foreground/70">
          Payment history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="text-muted-foreground">
                {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell className="font-medium">
                {payment.institutions?.name || '-'}
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {payment.invoices?.invoice_number || '-'}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(payment.amount, payment.currency || 'KES')}
              </TableCell>
              <TableCell>
                {METHOD_LABELS[payment.payment_method || 'other'] || payment.payment_method}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {payment.transaction_ref || '-'}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[payment.status || 'pending']}
                >
                  {payment.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
