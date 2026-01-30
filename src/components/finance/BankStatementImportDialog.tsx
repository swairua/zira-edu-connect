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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Download, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParsedTransaction {
  date: string;
  amount: string;
  reference: string;
  description: string;
}

interface ColumnMapping {
  date: string;
  amount: string;
  reference: string;
  description: string;
}

interface BankStatementImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  onSuccess?: () => void;
}

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export function BankStatementImportDialog({
  open,
  onOpenChange,
  institutionId,
  onSuccess,
}: BankStatementImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: '',
    amount: '',
    reference: '',
    description: '',
  });
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; duplicates: number }>({ 
    success: 0, 
    duplicates: 0 
  });
  const [source, setSource] = useState<'bank' | 'mpesa'>('bank');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('upload');
    setRawData([]);
    setHeaders([]);
    setColumnMapping({ date: '', amount: '', reference: '', description: '' });
    setParsedData([]);
    setImportProgress(0);
    setImportResults({ success: 0, duplicates: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          toast.error('No data found in file');
          return;
        }
        
        const detectedHeaders = Object.keys(results.data[0] || {});
        setHeaders(detectedHeaders);
        setRawData(results.data);
        
        // Auto-detect common column names
        const autoMapping: ColumnMapping = { date: '', amount: '', reference: '', description: '' };
        detectedHeaders.forEach(header => {
          const h = header.toLowerCase();
          if (h.includes('date') || h.includes('time')) autoMapping.date = header;
          if (h.includes('amount') || h.includes('value') || h.includes('credit')) autoMapping.amount = header;
          if (h.includes('ref') || h.includes('receipt') || h.includes('trans')) autoMapping.reference = header;
          if (h.includes('desc') || h.includes('narration') || h.includes('detail')) autoMapping.description = header;
        });
        setColumnMapping(autoMapping);
        
        setStep('mapping');
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast.error('Failed to parse file');
      },
    });
  }, []);

  const applyMapping = () => {
    if (!columnMapping.date || !columnMapping.amount) {
      toast.error('Please map at least Date and Amount columns');
      return;
    }

    const mapped = rawData.map(row => ({
      date: row[columnMapping.date] || '',
      amount: row[columnMapping.amount] || '',
      reference: row[columnMapping.reference] || '',
      description: row[columnMapping.description] || '',
    })).filter(row => row.date && row.amount);

    setParsedData(mapped);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    let successCount = 0;
    let duplicateCount = 0;

    // Generate batch ID
    const batchId = crypto.randomUUID();

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const externalRef = row.reference?.trim() || `${row.date}-${row.amount}`;
      
      // Check for duplicates
      const { data: existing } = await supabase
        .from('reconciliation_records')
        .select('id')
        .eq('institution_id', institutionId)
        .eq('external_reference', externalRef)
        .maybeSingle();

      if (existing) {
        duplicateCount++;
        setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
        continue;
      }

      try {
        // Parse amount - handle negative/credit amounts
        let amount = parseFloat(row.amount.replace(/[^0-9.-]/g, ''));
        if (isNaN(amount)) {
          continue;
        }
        amount = Math.abs(amount);

        // Parse date
        const parsedDate = new Date(row.date);
        if (isNaN(parsedDate.getTime())) {
          continue;
        }

        const dateStr = parsedDate.toISOString().split('T')[0];

        const { error } = await supabase.from('reconciliation_records').insert({
          institution_id: institutionId,
          source,
          external_reference: externalRef,
          external_date: dateStr,
          reconciliation_date: dateStr,
          external_amount: Math.round(amount),
          external_description: row.description || null,
          status: 'unmatched',
          batch_id: batchId,
        });

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error('Insert error:', error);
      }
      
      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setImportResults({ success: successCount, duplicates: duplicateCount });
    setStep('complete');
    
    if (successCount > 0) {
      toast.success(`Imported ${successCount} transactions`);
      onSuccess?.();
    }
  };

  const downloadTemplate = () => {
    const headers = 'date,amount,reference,description';
    const sampleRows = [
      '2024-01-15,15000,TRF123456,School fees payment',
      '2024-01-16,25000,CHQ789012,Fees - John Doe',
      '2024-01-17,10000,MPESA-ABC,Mobile payment',
    ];
    const csvContent = `${headers}\n${sampleRows.join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bank_statement_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = parsedData.reduce((sum, row) => {
    const amount = parseFloat(row.amount.replace(/[^0-9.-]/g, ''));
    return sum + (isNaN(amount) ? 0 : Math.abs(amount));
  }, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Bank Statement</DialogTitle>
          <DialogDescription>
            Upload a bank or M-Pesa statement to create reconciliation records
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Statement Source</Label>
                <Select value={source} onValueChange={(v: 'bank' | 'mpesa') => setSource(v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Statement</SelectItem>
                    <SelectItem value="mpesa">M-Pesa Statement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <AlertTitle>Supported Formats</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Upload any CSV with columns for date, amount, and reference.</p>
                  <p className="text-xs text-muted-foreground">
                    Column mapping will be available on the next step.
                  </p>
                </AlertDescription>
              </Alert>

              <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <Alert>
                <Settings2 className="h-4 w-4" />
                <AlertTitle>Map Your Columns</AlertTitle>
                <AlertDescription>
                  Match your CSV columns to the required fields. Date and Amount are required.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date Column *</Label>
                  <Select 
                    value={columnMapping.date} 
                    onValueChange={(v) => setColumnMapping({ ...columnMapping, date: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount Column *</Label>
                  <Select 
                    value={columnMapping.amount} 
                    onValueChange={(v) => setColumnMapping({ ...columnMapping, amount: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reference Column</Label>
                  <Select 
                    value={columnMapping.reference} 
                    onValueChange={(v) => setColumnMapping({ ...columnMapping, reference: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description Column</Label>
                  <Select 
                    value={columnMapping.description} 
                    onValueChange={(v) => setColumnMapping({ ...columnMapping, description: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview (first 3 rows):</p>
                <ScrollArea className="h-32 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.slice(0, 6).map(h => (
                          <TableHead key={h} className="text-xs">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rawData.slice(0, 3).map((row, i) => (
                        <TableRow key={i}>
                          {headers.slice(0, 6).map(h => (
                            <TableCell key={h} className="text-xs truncate max-w-[100px]">
                              {row[h] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  {parsedData.length} transactions
                </Badge>
                <Badge variant="secondary">
                  Total: KES {totalAmount.toLocaleString()}
                </Badge>
                <Badge variant="outline" className="capitalize">{source}</Badge>
              </div>

              <ScrollArea className="h-64 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 100).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="text-right font-mono">{row.amount}</TableCell>
                        <TableCell className="truncate max-w-[120px]">{row.reference || '-'}</TableCell>
                        <TableCell className="truncate max-w-[150px]">{row.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium">Importing transactions...</p>
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
                {importResults.duplicates > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {importResults.duplicates} duplicates skipped
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={resetState}>Back</Button>
              <Button onClick={applyMapping} disabled={!columnMapping.date || !columnMapping.amount}>
                Continue
              </Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
              <Button onClick={handleImport} disabled={parsedData.length === 0}>
                Import {parsedData.length} Transactions
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
