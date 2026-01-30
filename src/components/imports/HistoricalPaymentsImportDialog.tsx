import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useStudents } from '@/hooks/useStudents';
import { useDataImports } from '@/hooks/useDataImports';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Download, Upload, Banknote, FileUp } from 'lucide-react';
import { parseFlexibleDate, isExampleRow } from '@/lib/date-utils';
import { format } from 'date-fns';

interface ParsedPayment {
  admission_number: string;
  payment_date: string;
  amount: string;
  receipt_number?: string;
  payment_method?: string;
  transaction_reference?: string;
  notes?: string;
  rowIndex: number;
  errors: string[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface HistoricalPaymentsImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
}

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'mpesa', 'cheque', 'card', 'other'];

export function HistoricalPaymentsImportDialog({
  open,
  onOpenChange,
  institutionId,
}: HistoricalPaymentsImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [parsedData, setParsedData] = useState<ParsedPayment[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0, totalAmount: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: students = [] } = useStudents(institutionId);
  const { createImport, updateImport } = useDataImports();

  const studentMap = new Map(students.map(s => [s.admission_number?.toLowerCase(), s]));

  const resetState = () => {
    setStep('upload');
    setParsedData([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, totalAmount: 0 });
    setSelectedFile(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validateData = useCallback((data: ParsedPayment[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      if (!row.admission_number) {
        errors.push({ row: index + 2, field: 'admission_number', message: 'Admission number is required' });
      } else if (!studentMap.has(row.admission_number.toLowerCase())) {
        errors.push({ row: index + 2, field: 'admission_number', message: `Student not found: ${row.admission_number}` });
      }

      if (!row.payment_date) {
        errors.push({ row: index + 2, field: 'payment_date', message: 'Payment date is required' });
      } else {
        const parsed = parseFlexibleDate(row.payment_date);
        if (!parsed) {
          errors.push({ row: index + 2, field: 'payment_date', message: `Invalid date format: ${row.payment_date}` });
        }
      }

      if (!row.amount) {
        errors.push({ row: index + 2, field: 'amount', message: 'Amount is required' });
      } else {
        const amount = parseFloat(row.amount.replace(/,/g, ''));
        if (isNaN(amount) || amount <= 0) {
          errors.push({ row: index + 2, field: 'amount', message: 'Amount must be a positive number' });
        }
      }

      if (row.payment_method && !PAYMENT_METHODS.includes(row.payment_method.toLowerCase())) {
        errors.push({ row: index + 2, field: 'payment_method', message: `Invalid payment method. Use: ${PAYMENT_METHODS.join(', ')}` });
      }
    });

    return errors;
  }, [studentMap]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: ParsedPayment[] = results.data
          .filter((row: any) => !isExampleRow(row, ['admission_number', 'amount']))
          .map((row: any, index: number) => ({
            admission_number: row.admission_number?.trim() || '',
            payment_date: row.payment_date?.trim() || '',
            amount: row.amount?.trim() || '',
            receipt_number: row.receipt_number?.trim() || '',
            payment_method: row.payment_method?.trim() || '',
            transaction_reference: row.transaction_reference?.trim() || '',
            notes: row.notes?.trim() || '',
            rowIndex: index,
            errors: [],
          }));

        const errors = validateData(parsed);
        setValidationErrors(errors);
        setParsedData(parsed);
        setStep('preview');
      },
      error: (error) => {
        toast.error('Failed to parse CSV file', { description: error.message });
      },
    });
  }, [validateData]);

  const handleImport = async () => {
    setStep('importing');
    setImportProgress(0);

    let successCount = 0;
    let failedCount = 0;
    let totalAmount = 0;

    try {
      const importRecord = await createImport.mutateAsync({
        importType: 'historical_payments',
        fileName: selectedFile?.name || 'historical_payments.csv',
        totalRows: parsedData.length,
      });

      const validRows = parsedData.filter((_, index) => 
        !validationErrors.some(e => e.row === index + 2)
      );

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        const student = studentMap.get(row.admission_number.toLowerCase());

        if (!student) {
          failedCount++;
          continue;
        }

        const paymentDate = parseFlexibleDate(row.payment_date);
        const amount = parseFloat(row.amount.replace(/,/g, ''));

        // Generate receipt number with HIST prefix if not provided
        const receiptNumber = row.receipt_number 
          ? `HIST-${row.receipt_number}` 
          : `HIST-RCP-${format(new Date(), 'yyyyMM')}-${String(i + 1).padStart(5, '0')}`;

        const { error } = await supabase
          .from('student_payments')
          .insert({
            institution_id: institutionId,
            student_id: student.id,
            amount,
            payment_date: paymentDate,
            payment_method: row.payment_method?.toLowerCase() || 'other',
            transaction_reference: row.transaction_reference || null,
            notes: row.notes || 'Historical payment import',
            receipt_number: receiptNumber,
            source_receipt_number: row.receipt_number || null,
            status: 'completed',
            is_historical: true,
          });

        if (error) {
          console.error('Failed to insert payment:', error);
          failedCount++;
        } else {
          successCount++;
          totalAmount += amount;
        }

        setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
      }

      await updateImport.mutateAsync({
        importId: importRecord.id,
        updates: {
          status: failedCount === 0 ? 'completed' : 'completed',
          imported_rows: successCount,
          failed_rows: failedCount,
          imported_at: new Date().toISOString(),
        },
      });

      setImportResults({ success: successCount, failed: failedCount, totalAmount });
      setStep('complete');
      toast.success(`Imported ${successCount} historical payments`);

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Import failed', { description: error.message });
      setStep('preview');
    }
  };

  const downloadTemplate = () => {
    const template = `admission_number,payment_date,amount,receipt_number,payment_method,transaction_reference,notes
STU001,2024-02-15,25000,RCP-2024-0001,bank_transfer,TRX123456,Term 1 tuition fees
STU001,2024-03-20,5000,RCP-2024-0045,mpesa,MPESA789012,Activity fees
STU002,2024-02-18,25000,RCP-2024-0003,cash,,Term 1 fees`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historical_payments_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowsWithErrors = new Set(validationErrors.map(e => e.row));
  const validRows = parsedData.filter((_, i) => !rowsWithErrors.has(i + 2));
  const totalAmount = validRows.reduce((sum, row) => sum + parseFloat(row.amount.replace(/,/g, '') || '0'), 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Import Historical Payments
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file containing historical payment transactions. This creates an audit trail of past payments for reporting and parent portal display.
              </p>

              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="max-w-xs mx-auto"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Select a CSV file to upload
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><code>admission_number</code> - Student's admission number</li>
                  <li><code>payment_date</code> - Date of payment (YYYY-MM-DD or DD-MM-YYYY)</li>
                  <li><code>amount</code> - Payment amount</li>
                </ul>
                <h4 className="font-medium mb-2 mt-4">Optional Columns:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><code>receipt_number</code> - Original receipt number (preserved for reference)</li>
                  <li><code>payment_method</code> - cash, bank_transfer, mpesa, cheque, card, other</li>
                  <li><code>transaction_reference</code> - Bank/mobile money reference</li>
                  <li><code>notes</code> - Additional notes</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {validationErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">{validationErrors.length} validation errors found</span>
                  </div>
                  <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                    {validationErrors.slice(0, 10).map((error, i) => (
                      <li key={i}>Row {error.row}: {error.message}</li>
                    ))}
                    {validationErrors.length > 10 && (
                      <li className="text-muted-foreground">...and {validationErrors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span>{parsedData.length} rows found</span>
                <div className="text-right">
                  <span className="text-green-600">{validRows.length} valid rows</span>
                  <span className="text-muted-foreground ml-2">
                    Total: KES {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 20).map((row, i) => (
                      <TableRow 
                        key={i}
                        className={rowsWithErrors.has(i + 2) ? 'bg-destructive/10' : ''}
                      >
                        <TableCell>{row.admission_number}</TableCell>
                        <TableCell>{row.payment_date}</TableCell>
                        <TableCell>{parseFloat(row.amount.replace(/,/g, '') || '0').toLocaleString()}</TableCell>
                        <TableCell>{row.receipt_number || '-'}</TableCell>
                        <TableCell>{row.payment_method || 'other'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsedData.length > 20 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing first 20 of {parsedData.length} rows
                </p>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="space-y-4 py-8">
              <div className="flex items-center justify-center">
                <Upload className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <Progress value={importProgress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                Importing historical payments... {importProgress}%
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-4 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="text-lg font-medium">Import Complete</p>
                <p className="text-sm text-muted-foreground">
                  Successfully imported {importResults.success} payments
                  {importResults.failed > 0 && ` (${importResults.failed} failed)`}
                </p>
                <p className="text-sm font-medium text-green-600 mt-2">
                  Total: KES {importResults.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={resetState}>Upload Different File</Button>
              <Button 
                onClick={handleImport} 
                disabled={validRows.length === 0}
              >
                Import {validRows.length} Payments
              </Button>
            </>
          )}
          {step === 'complete' && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
