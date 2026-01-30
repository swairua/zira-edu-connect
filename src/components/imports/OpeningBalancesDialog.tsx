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
import { Upload, FileText, AlertCircle, CheckCircle2, X, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDataImports } from '@/hooks/useDataImports';

interface ParsedBalance {
  admission_number: string;
  balance_date: string;
  amount: string;
  description?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface OpeningBalancesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
}

const REQUIRED_COLUMNS = ['admission_number', 'balance_date', 'amount'];
const OPTIONAL_COLUMNS = ['description'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

export function OpeningBalancesDialog({
  open,
  onOpenChange,
  institutionId,
}: OpeningBalancesDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [parsedData, setParsedData] = useState<ParsedBalance[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [studentMap, setStudentMap] = useState<Map<string, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createImport, updateImport } = useDataImports();

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

  const validateData = useCallback(async (data: ParsedBalance[]): Promise<ValidationError[]> => {
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
      const rowNum = index + 2;

      if (!row.admission_number?.trim()) {
        errors.push({ row: rowNum, field: 'admission_number', message: 'Admission number is required' });
      } else if (!studentMapNew.has(row.admission_number.trim())) {
        errors.push({ row: rowNum, field: 'admission_number', message: 'Student not found with this admission number' });
      }

      if (!row.balance_date?.trim()) {
        errors.push({ row: rowNum, field: 'balance_date', message: 'Balance date is required' });
      } else if (isNaN(Date.parse(row.balance_date))) {
        errors.push({ row: rowNum, field: 'balance_date', message: 'Invalid date format (use YYYY-MM-DD)' });
      }

      if (!row.amount?.trim()) {
        errors.push({ row: rowNum, field: 'amount', message: 'Amount is required' });
      } else {
        const amount = parseFloat(row.amount);
        if (isNaN(amount) || amount < 0) {
          errors.push({ row: rowNum, field: 'amount', message: 'Amount must be a positive number' });
        }
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
          balance_date: row.balance_date?.trim() || '',
          amount: row.amount?.trim() || '',
          description: row.description?.trim() || undefined,
        }));

        const errors = await validateData(data);
        setParsedData(data);
        setValidationErrors(errors);
        setStep('preview');
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setValidationErrors([{ row: 0, field: 'file', message: 'Failed to parse CSV file' }]);
      },
    });
  }, [validateData]);

  const handleImport = async () => {
    if (validationErrors.length > 0) return;

    setStep('importing');
    
    // Create import record
    const importRecord = await createImport.mutateAsync({
      importType: 'opening_balances',
      fileName: 'opening_balances.csv',
      totalRows: parsedData.length,
    });

    let successCount = 0;
    let failedCount = 0;
    const importedIds: string[] = [];

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const studentId = studentMap.get(row.admission_number.trim());
      
      if (!studentId) {
        failedCount++;
        continue;
      }

      try {
        const { data, error } = await supabase.from('opening_balances').insert({
          institution_id: institutionId,
          import_id: importRecord.id,
          student_id: studentId,
          admission_number: row.admission_number.trim(),
          balance_date: row.balance_date.trim(),
          amount: Math.round(parseFloat(row.amount) * 100), // Store in cents
          description: row.description || 'Opening balance from previous system',
        }).select('id').single();

        if (error) throw error;
        successCount++;
        if (data) importedIds.push(data.id);
      } catch (error) {
        console.error('Opening balance insert error:', error);
        failedCount++;
      }
      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    // Update import record
    await updateImport.mutateAsync({
      importId: importRecord.id,
      updates: {
        status: 'completed',
        imported_rows: successCount,
        failed_rows: failedCount,
        imported_ids: importedIds,
      },
    });

    setImportResults({ success: successCount, failed: failedCount });
    setStep('complete');
    toast.success(`Imported ${successCount} opening balances`);
  };

  const downloadTemplate = () => {
    const headers = ALL_COLUMNS.join(',');
    const sampleRow = 'STU001,2024-01-01,15000,Previous system balance';
    const csvContent = `${headers}\n${sampleRow}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opening_balances_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowsWithErrors = new Set(validationErrors.map((e) => e.row));
  const validRows = parsedData.filter((_, index) => !rowsWithErrors.has(index + 2));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Opening Balances</DialogTitle>
          <DialogDescription>
            Upload fee balances from your previous system
          </DialogDescription>
        </DialogHeader>

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
                <p className="mb-2">Required columns: <strong>admission_number, balance_date, amount</strong></p>
                <p className="mb-2">Optional columns: description</p>
                <p className="text-xs text-muted-foreground">Amount should be a positive number. Students must already exist in the system.</p>
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
            <div className="flex items-center gap-4">
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
                    <TableHead>Balance Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 50).map((row, index) => {
                    const hasError = rowsWithErrors.has(index + 2);
                    return (
                      <TableRow key={index} className={hasError ? 'bg-destructive/10' : ''}>
                        <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                        <TableCell>{row.admission_number}</TableCell>
                        <TableCell>{row.balance_date}</TableCell>
                        <TableCell className="text-right font-mono">
                          {parseFloat(row.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="truncate max-w-[150px]">{row.description || '-'}</TableCell>
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
          </div>
        )}

        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-lg font-medium">Importing opening balances...</p>
            <Progress value={importProgress} className="w-64" />
            <p className="mt-2 text-sm text-muted-foreground">{importProgress}% complete</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="mt-4 text-lg font-medium">Import Complete</p>
            <div className="mt-2 flex gap-4">
              <Badge variant="default" className="text-sm">
                {importResults.success} imported
              </Badge>
              {importResults.failed > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {importResults.failed} failed
                </Badge>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={resetState}>Upload Different File</Button>
              <Button onClick={handleImport} disabled={validationErrors.length > 0 || parsedData.length === 0}>
                Import {validRows.length} Balances
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
