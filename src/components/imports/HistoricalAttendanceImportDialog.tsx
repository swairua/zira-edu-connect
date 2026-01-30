import React, { useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Upload, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { useDataImports } from '@/hooks/useDataImports';
import { useToast } from '@/hooks/use-toast';
import { parseFlexibleDate, isExampleRow } from '@/lib/date-utils';
import { ImportColumnReference } from '@/components/imports/ImportColumnReference';
import { formatValidationError } from '@/config/importColumnDefinitions';

interface ParsedAttendance {
  admission_number: string;
  date: string;
  status: string;
  notes?: string;
  errors?: string[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface HistoricalAttendanceImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
}

const VALID_STATUSES = ['present', 'absent', 'late', 'excused'];

export function HistoricalAttendanceImportDialog({
  open,
  onOpenChange,
  institutionId,
}: HistoricalAttendanceImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [parsedData, setParsedData] = useState<ParsedAttendance[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0, skipped: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { toast } = useToast();
  const { data: students } = useStudents(institutionId);
  const { data: classes } = useClasses(institutionId);
  const { createImport, updateImport } = useDataImports();

  // Create lookup maps
  const studentMap = useMemo(() => {
    const map = new Map<string, { id: string; class_id: string | null }>();
    students?.forEach(s => {
      if (s.admission_number) {
        map.set(s.admission_number.toUpperCase(), { id: s.id, class_id: s.class_id });
      }
    });
    return map;
  }, [students]);

  const resetState = () => {
    setStep('upload');
    setParsedData([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, skipped: 0 });
    setSelectedFile(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validateData = useCallback((data: ParsedAttendance[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const seenRecords = new Set<string>();
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    data.forEach((row, index) => {
      const rowNum = index + 2; // Account for header row

      // Required field validation
      if (!row.admission_number?.trim()) {
        errors.push({ row: rowNum, field: 'admission_number', message: 'Admission number is required' });
      } else if (!studentMap.has(row.admission_number.toUpperCase())) {
        errors.push({ row: rowNum, field: 'admission_number', message: `Student "${row.admission_number}" not found` });
      }

      if (!row.date?.trim()) {
        errors.push({ row: rowNum, field: 'date', message: 'Date is required' });
      } else {
        const parsedDate = parseFlexibleDate(row.date);
        if (!parsedDate) {
          errors.push({ row: rowNum, field: 'date', message: 'Invalid date format' });
        } else {
          const dateObj = new Date(parsedDate);
          if (dateObj > today) {
            errors.push({ row: rowNum, field: 'date', message: 'Date cannot be in the future' });
          }
        }
      }

      if (!row.status?.trim()) {
        errors.push({ row: rowNum, field: 'status', message: 'Status is required' });
      } else if (!VALID_STATUSES.includes(row.status.toLowerCase())) {
        errors.push({ 
          row: rowNum, 
          field: 'status', 
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
        });
      }

      // Duplicate check (same student + date)
      if (row.admission_number && row.date) {
        const parsedDate = parseFlexibleDate(row.date);
        if (parsedDate) {
          const key = `${row.admission_number.toUpperCase()}-${parsedDate}`;
          if (seenRecords.has(key)) {
            errors.push({ row: rowNum, field: 'admission_number', message: 'Duplicate attendance record for this date' });
          }
          seenRecords.add(key);
        }
      }
    });

    return errors;
  }, [studentMap]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Filter out example rows
        const filteredData = (results.data as ParsedAttendance[]).filter(
          row => !isExampleRow(row as unknown as Record<string, string>, ['admission_number', 'date'])
        );

        const errors = validateData(filteredData);
        
        // Mark rows with errors
        const dataWithErrors = filteredData.map((row, index) => {
          const rowErrors = errors.filter(e => e.row === index + 2);
          return {
            ...row,
            errors: rowErrors.map(e => `${e.field}: ${e.message}`),
          };
        });

        setParsedData(dataWithErrors);
        setValidationErrors(errors);
        setStep('preview');
      },
      error: (error) => {
        toast({
          title: 'Parse Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  }, [validateData, toast]);

  const handleImport = async () => {
    if (!institutionId) return;

    setStep('importing');
    setImportProgress(0);

    const validData = parsedData.filter(row => !row.errors?.length);
    let success = 0;
    let failed = 0;
    const importedIds: string[] = [];

    try {
      // Create import record
      const importRecord = await createImport.mutateAsync({
        importType: 'historical_attendance',
        fileName: selectedFile?.name || 'historical_attendance.csv',
        totalRows: validData.length,
      });

      // Process in batches
      const batchSize = 50;
      for (let i = 0; i < validData.length; i += batchSize) {
        const batch = validData.slice(i, i + batchSize);
        
        const insertData = batch.map(row => {
          const student = studentMap.get(row.admission_number.toUpperCase());
          const parsedDate = parseFlexibleDate(row.date);
          
          return {
            institution_id: institutionId,
            student_id: student!.id,
            class_id: student!.class_id || classes?.[0]?.id, // Use student's class or first class
            date: parsedDate,
            status: row.status.toLowerCase(),
            notes: row.notes || null,
            is_historical: true,
          };
        }).filter(d => d.class_id); // Filter out records without valid class_id

        if (insertData.length > 0) {
          const { data, error } = await supabase
            .from('attendance')
            .insert(insertData)
            .select('id');

          if (error) {
            console.error('Batch insert error:', error);
            failed += batch.length;
          } else {
            success += data.length;
            importedIds.push(...data.map(d => d.id));
          }
        }

        setImportProgress(Math.round(((i + batch.length) / validData.length) * 100));
      }

      // Update import record
      await updateImport.mutateAsync({
        importId: importRecord.id,
        updates: {
          status: 'completed',
          imported_rows: success,
          failed_rows: failed,
          imported_ids: importedIds,
          imported_at: new Date().toISOString(),
        },
      });

      setImportResults({ success, failed, skipped: parsedData.length - validData.length });
      setStep('complete');

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${success} attendance records`,
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive',
      });
      setStep('preview');
    }
  };

  const downloadTemplate = () => {
    const headers = ['admission_number', 'date', 'status', 'notes'];
    const sampleData = [
      ['STU001', '2024-01-15', 'present', ''],
      ['STU001', '2024-01-16', 'absent', 'Sick leave - parent notified'],
      ['STU002', '2024-01-15', 'late', 'Arrived 15 minutes late'],
      ['STU003', '2024-01-15', 'excused', 'Medical appointment'],
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historical_attendance_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedData.filter(r => !r.errors?.length).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Import Historical Attendance
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <ImportColumnReference importType="historical_attendance" />

            <div className="flex justify-center">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="attendance-file-upload"
              />
              <label
                htmlFor="attendance-file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="font-medium">Click to upload CSV file</span>
                <span className="text-sm text-muted-foreground">
                  or drag and drop
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Found {validationErrors.length} errors. {parsedData.length - validCount} rows will be skipped.</span>
                </div>
              </div>
            )}

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{validCount} valid records</span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span>{invalidCount} invalid records</span>
                </div>
              )}
            </div>

            <div className="border rounded-lg max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Validation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 100).map((row, index) => (
                    <TableRow key={index} className={row.errors?.length ? 'bg-destructive/10' : ''}>
                      <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                      <TableCell>{row.admission_number}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Badge variant={
                          row.status?.toLowerCase() === 'present' ? 'default' :
                          row.status?.toLowerCase() === 'absent' ? 'destructive' :
                          row.status?.toLowerCase() === 'late' ? 'secondary' :
                          'outline'
                        }>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{row.notes}</TableCell>
                      <TableCell>
                        {row.errors?.length ? (
                          <span className="text-xs text-destructive">{row.errors[0]}</span>
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {parsedData.length > 100 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing first 100 of {parsedData.length} records
              </p>
            )}
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <p className="text-lg font-medium">Importing attendance records...</p>
              <p className="text-sm text-muted-foreground">Please wait while we process your data</p>
            </div>
            <Progress value={importProgress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">{importProgress}%</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Import Complete!</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">{importResults.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{importResults.skipped}</p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={resetState}>
                Upload Different File
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Import {validCount} Records
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
