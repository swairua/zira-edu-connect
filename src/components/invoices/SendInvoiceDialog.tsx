import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoice_number: string;
    total_amount: number;
    currency?: string;
    student?: {
      first_name: string;
      last_name: string;
      guardian_email?: string;
      guardian_name?: string;
    };
  };
  institutionId: string;
}

export function SendInvoiceDialog({ open, onOpenChange, invoice, institutionId }: SendInvoiceDialogProps) {
  const queryClient = useQueryClient();
  const [emailOverride, setEmailOverride] = useState('');
  const [includePdf, setIncludePdf] = useState(true);

  const parentEmail = invoice.student?.guardian_email;
  const targetEmail = emailOverride || parentEmail;

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!targetEmail) {
        throw new Error('No email address provided');
      }

      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: {
          invoiceId: invoice.id,
          email: targetEmail,
          includePdf,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      toast.success('Invoice sent successfully', {
        description: `Invoice ${invoice.invoice_number} has been sent to ${targetEmail}`,
      });
      queryClient.invalidateQueries({ queryKey: ['invoice-email-logs'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to send invoice', {
        description: error.message,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Invoice
          </DialogTitle>
          <DialogDescription>
            Send invoice {invoice.invoice_number} to parent/guardian via email
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            {/* Student Info */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm font-medium">
                {invoice.student?.first_name} {invoice.student?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                Amount: {invoice.currency || 'KES'} {invoice.total_amount.toLocaleString()}
              </p>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              {parentEmail ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Guardian:</span>
                    <span className="font-medium">{parentEmail}</span>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Override email address (optional)"
                    value={emailOverride}
                    onChange={(e) => setEmailOverride(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No guardian email on file. Please enter an email address.
                    </AlertDescription>
                  </Alert>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={emailOverride}
                    onChange={(e) => setEmailOverride(e.target.value)}
                    required
                  />
                </>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-pdf"
                checked={includePdf}
                onCheckedChange={(checked) => setIncludePdf(checked as boolean)}
              />
              <Label htmlFor="include-pdf" className="text-sm font-normal">
                Attach invoice PDF
              </Label>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!targetEmail || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
