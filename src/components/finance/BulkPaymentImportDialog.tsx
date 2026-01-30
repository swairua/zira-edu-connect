import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle2, X, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ParsedPayment {
  admission_number: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  transaction_reference: string;
  notes: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface BulkPaymentImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  onSuccess?: () => void;
}

const REQUIRED_COLUMNS = ['admission_number', 'amount', 'payment_date', 'payment_method'];
const OPTIONAL_COLUMNS = ['transaction_reference', 'notes'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];
const VALID_METHODS = ['cash', 'mpesa', 'bank', 'cheque'];

export function BulkPaymentImportDialog({
  open,
  onOpenChange,
  institutionId,
  onSuccess,
}: BulkPaymentImportDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [parsedData, setParsedData] = useState<ParsedPayment[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [studentMap, setStudentMap] = useState<Map<string, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('upload');
    setParsedData([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0 });
    setStudentMap(new Map());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validateData = useCallback(async (data: ParsedPayment[]): Promise<ValidationError[]> => {
    const errors: ValidationError[] = [];
    const admissionNumbers = data.map(r => r.admission_number?.trim()).filter(Boolean);

    // Fetch students by admission number
    const { data: students } = await supabase
      .from('students')
      .select('id, admission_number')
      .eq('institution_id', institutionId)
      .in('admission_number', admissionNumbers);

    const studentMapNew = new Map<string, string>();
    students?.forEach(s => studentMapNew.set(s.admission_number, s.id));
    setStudentMap(studentMapNew);

    data.forEach((row, index) => {
      const rowNum = index + 2; // Account for header row

      // Admission number validation
      if (!row.admission_number?.trim()) {
        errors.push({ row: rowNum, field: 'admission_number', message: 'Admission number is required' });
      } else if (!studentMapNew.has(row.admission_number.trim())) {
        errors.push({ row: rowNum, field: 'admission_number', message: 'Student not found' });
      }

      // Amount validation
      if (!row.amount?.trim()) {
        errors.push({ row: rowNum, field: 'amount', message: 'Amount is required' });
      } else {
        const amount = parseFloat(row.amount);
        if (isNaN(amount) || amount <= 0) {
          errors.push({ row: rowNum, field: 'amount', message: 'Amount must be a positive number' });
        }
      }

      // Payment date validation
      if (!row.payment_date?.trim()) {
        errors.push({ row: rowNum, field: 'payment_date', message: 'Payment date is required' });
      } else if (isNaN(Date.parse(row.payment_date))) {
        errors.push({ row: rowNum, field: 'payment_date', message: 'Invalid date format (use YYYY-MM-DD)' });
      }

      // Payment method validation
      if (!row.payment_method?.trim()) {
        errors.push({ row: rowNum, field: 'payment_method', message: 'Payment method is required' });
      } else if (!VALID_METHODS.includes(row.payment_method.trim().toLowerCase())) {
        errors.push({ row: rowNum, field: 'payment_method', message: `Must be one of: ${VALID_METHODS.join(', ')}` });
      }
    });

    return errors;
  }, [institutionId]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: async (results) => {
        const data = results.data.map((row) => ({
          admission_number: row.admission_number?.trim() || '',
          amount: row.amount?.trim() || '',
          payment_date: row.payment_date?.trim() || '',
          payment_method: row.payment_method?.trim().toLowerCase() || '',
          transaction_reference: row.transaction_reference?.trim() || '',
          notes: row.notes?.trim() || '',
        }));

        const errors = await validateData(data);
        setParsedData(data);
        setValidationErrors(errors);
        setStep('preview');
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast.error('Failed to parse CSV file');
      },
    });
  }, [validateData]);

  const handleImport = async () => {
    if (validationErrors.length > 0) return;

    setStep('importing');
    let successCount = 0;
    let failedCount = 0;

    // Get current payment count for receipt numbering
    const { count } = await supabase
      .from('student_payments')
      .select('*', { count: 'exact', head: true })
      .eq('institution_id', institutionId);

    let receiptCounter = (count || 0) + 1;

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const studentId = studentMap.get(row.admission_number.trim());
      
      if (!studentId) {
        failedCount++;
        continue;
      }

      try {
        const receiptNumber = `RCP-${String(receiptCounter).padStart(6, '0')}`;
        
        const { error } = await supabase.from('student_payments').insert({
          institution_id: institutionId,
          student_id: studentId,
          receipt_number: receiptNumber,
          amount: Math.round(parseFloat(row.amount)),
          currency: 'KES',
          payment_method: row.payment_method,
          payment_date: row.payment_date,
          transaction_reference: row.transaction_reference || null,
          notes: row.notes || 'Bulk import',
          received_by: user?.id,
          status: 'confirmed',
        });

        if (error) throw error;
        successCount++;
        receiptCounter++;
      } catch (error) {
        console.error('Payment insert error:', error);
        failedCount++;
      }
      
      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setImportResults({ success: successCount, failed: failedCount });
    setStep('complete');
    
    if (successCount > 0) {
      toast.success(`Imported ${successCount} payments`);
      onSuccess?.();
    }
  };

  const downloadTemplate = () => {
    const headers = ALL_COLUMNS.join(',');
    const sampleRows = [
      'STU001,15000,2024-01-15,mpesa,QWE123XYZ,Term 1 fees',
      'STU002,25000,2024-01-16,bank,TRF-456789,Full payment',
      'STU003,10000,2024-01-17,cash,,Partial payment',
    ];
    const csvContent = `${headers}\n${sampleRows.join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowsWithErrors = new Set(validationErrors.map((e) => e.row));
  const validRows = parsedData.filter((_, index) => !rowsWithErrors.has(index + 2));
  const totalAmount = validRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Payments</DialogTitle>
          <DialogDescription>
            Upload bulk payments from a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>CSV Format Requirements</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Required: <strong>admission_number, amount, payment_date, payment_method</strong>
                  </p>
                  <p className="mb-2">Optional: transaction_reference, notes</p>
                  <p className="text-xs text-muted-foreground">
                    Payment methods: cash, mpesa, bank, cheque. Date format: YYYY-MM-DD
                  </p>
                </AlertDescription>
              </Alert>

              <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  {parsedData.length} rows
                </Badge>
                {validationErrors.length > 0 ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.length} errors
                  </Badge>
                ) : (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    All valid
                  </Badge>
                )}
                <Badge variant="secondary">
                  Total: KES {totalAmount.toLocaleString()}
                </Badge>
              </div>

              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <ScrollArea className="h-24">
                      <ul className="list-disc pl-4 text-sm">
                        {validationErrors.slice(0, 10).map((error, i) => (
                          <li key={i}>
                            Row {error.row}: {error.field} - {error.message}
                          </li>
                        ))}
                        {validationErrors.length > 10 && (
                          <li>...and {validationErrors.length - 10} more errors</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-64 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Adm. No.</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 100).map((row, index) => {
                      const hasError = rowsWithErrors.has(index + 2);
                      return (
                        <TableRow key={index} className={hasError ? 'bg-destructive/10' : ''}>
                          <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                          <TableCell>{row.admission_number}</TableCell>
                          <TableCell className="text-right font-mono">
                            {parseFloat(row.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>{row.payment_date}</TableCell>
                          <TableCell className="capitalize">{row.payment_method}</TableCell>
                          <TableCell className="truncate max-w-[100px]">
                            {row.transaction_reference || '-'}
                          </TableCell>
                          <TableCell>
                            {hasError ? (
                              <Badge variant="destructive" className="gap-1">
                                <X className="h-3 w-3" />
                                Error
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Valid
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
              {parsedData.length > 100 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing first 100 of {parsedData.length} rows
                </p>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium">Importing payments...</p>
              <Progress value={importProgress} className="w-64 mt-4" />
              <p className="mt-2 text-sm text-muted-foreground">{importProgress}% complete</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-16 w-16 text-success" />
              <p className="mt-4 text-lg font-medium">Import Complete</p>
              <div className="mt-4 flex gap-4">
                <Badge variant="default" className="text-sm">
                  {importResults.success} imported
                </Badge>
                {importResults.failed > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    {importResults.failed} failed
                  </Badge>
                )}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Total imported: KES {totalAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={resetState}>
                Upload Different File
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={validationErrors.length > 0 || parsedData.length === 0}
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
