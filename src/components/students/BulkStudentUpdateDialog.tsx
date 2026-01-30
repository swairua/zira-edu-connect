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
import { Upload, AlertCircle, CheckCircle2, X, Download, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useClasses } from '@/hooks/useClasses';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { downloadStudentsForUpdate } from '@/lib/bulk-export';
import { ImportColumnReference } from '@/components/imports/ImportColumnReference';
import type { Student } from '@/hooks/useStudents';

interface ParsedUpdate {
  admission_number: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  nationality?: string;
  class_name?: string;
  boarding_status?: string;
  status?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ChangePreview {
  admission_number: string;
  field: string;
  oldValue: string;
  newValue: string;
}

interface BulkStudentUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  students: Student[];
  institutionName?: string;
}

const VALID_GENDERS = ['male', 'female', 'other'];
const VALID_STATUSES = ['active', 'graduated', 'transferred', 'suspended', 'withdrawn'];
const VALID_BOARDING = ['day', 'boarding', 'day_boarding'];

export function BulkStudentUpdateDialog({
  open,
  onOpenChange,
  institutionId,
  students,
  institutionName,
}: BulkStudentUpdateDialogProps) {
  const [step, setStep] = useState<'export' | 'upload' | 'preview' | 'updating' | 'complete'>('export');
  const [parsedData, setParsedData] = useState<ParsedUpdate[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [changes, setChanges] = useState<ChangePreview[]>([]);
  const [updateResults, setUpdateResults] = useState<{ updated: number; skipped: number; failed: number }>({
    updated: 0,
    skipped: 0,
    failed: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: classes } = useClasses(institutionId);

  // Build student lookup map by admission number
  const studentLookup = new Map<string, Student>();
  students.forEach(s => studentLookup.set(s.admission_number.toLowerCase(), s));

  // Build class lookup map
  const classLookup = new Map<string, string>();
  classes?.forEach(c => {
    classLookup.set(c.name.toLowerCase(), c.id);
    if (c.stream) {
      classLookup.set(`${c.level} ${c.stream}`.toLowerCase(), c.id);
    }
    classLookup.set(c.level.toLowerCase(), c.id);
  });

  const resetState = () => {
    setStep('export');
    setParsedData([]);
    setValidationErrors([]);
    setUpdateProgress(0);
    setChanges([]);
    setUpdateResults({ updated: 0, skipped: 0, failed: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleExport = () => {
    downloadStudentsForUpdate(students, institutionName);
    setStep('upload');
  };

  const detectChanges = useCallback((data: ParsedUpdate[]): ChangePreview[] => {
    const changesList: ChangePreview[] = [];

    data.forEach(row => {
      const existing = studentLookup.get(row.admission_number.toLowerCase());
      if (!existing) return;

      // Compare each field
      if (row.first_name && row.first_name !== existing.first_name) {
        changesList.push({
          admission_number: row.admission_number,
          field: 'first_name',
          oldValue: existing.first_name,
          newValue: row.first_name,
        });
      }
      if (row.last_name && row.last_name !== existing.last_name) {
        changesList.push({
          admission_number: row.admission_number,
          field: 'last_name',
          oldValue: existing.last_name,
          newValue: row.last_name,
        });
      }
      if (row.middle_name !== undefined && row.middle_name !== (existing.middle_name || '')) {
        changesList.push({
          admission_number: row.admission_number,
          field: 'middle_name',
          oldValue: existing.middle_name || '',
          newValue: row.middle_name,
        });
      }
      if (row.gender && row.gender.toLowerCase() !== (existing.gender || '')) {
        changesList.push({
          admission_number: row.admission_number,
          field: 'gender',
          oldValue: existing.gender || '',
          newValue: row.gender.toLowerCase(),
        });
      }
      if (row.date_of_birth && row.date_of_birth !== (existing.date_of_birth || '')) {
        changesList.push({
          admission_number: row.admission_number,
          field: 'date_of_birth',
          oldValue: existing.date_of_birth || '',
          newValue: row.date_of_birth,
        });
      }
      if (row.nationality && row.nationality !== (existing.nationality || '')) {
        changesList.push({
          admission_number: row.admission_number,
          field: 'nationality',
          oldValue: existing.nationality || '',
          newValue: row.nationality,
        });
      }
      if (row.boarding_status && row.boarding_status.toLowerCase() !== (existing.boarding_status || '')) {
        changesList.push({
          admission_number: row.admission_number,
          field: 'boarding_status',
          oldValue: existing.boarding_status || '',
          newValue: row.boarding_status.toLowerCase(),
        });
      }
      if (row.status && row.status.toLowerCase() !== (existing.status || 'active')) {
        changesList.push({
          admission_number: row.admission_number,
          field: 'status',
          oldValue: existing.status || 'active',
          newValue: row.status.toLowerCase(),
        });
      }
      // Class change detection
      if (row.class_name) {
        const newClassId = classLookup.get(row.class_name.toLowerCase());
        if (newClassId && newClassId !== existing.class_id) {
          changesList.push({
            admission_number: row.admission_number,
            field: 'class',
            oldValue: existing.class?.name || '',
            newValue: row.class_name,
          });
        }
      }
    });

    return changesList;
  }, [studentLookup, classLookup]);

  const validateData = useCallback((data: ParsedUpdate[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;

      // Admission number must exist
      if (!row.admission_number?.trim()) {
        errors.push({ row: rowNum, field: 'admission_number', message: 'Admission number is required' });
        return;
      }

      // Check if student exists
      if (!studentLookup.has(row.admission_number.toLowerCase())) {
        errors.push({ row: rowNum, field: 'admission_number', message: `Student not found: ${row.admission_number}` });
        return;
      }

      // Validate optional fields if provided
      if (row.gender && !VALID_GENDERS.includes(row.gender.toLowerCase())) {
        errors.push({ row: rowNum, field: 'gender', message: `Invalid gender. Use: ${VALID_GENDERS.join(', ')}` });
      }

      if (row.date_of_birth && isNaN(Date.parse(row.date_of_birth))) {
        errors.push({ row: rowNum, field: 'date_of_birth', message: 'Invalid date format. Use YYYY-MM-DD' });
      }

      if (row.status && !VALID_STATUSES.includes(row.status.toLowerCase())) {
        errors.push({ row: rowNum, field: 'status', message: `Invalid status. Use: ${VALID_STATUSES.join(', ')}` });
      }

      if (row.boarding_status && !VALID_BOARDING.includes(row.boarding_status.toLowerCase())) {
        errors.push({ row: rowNum, field: 'boarding_status', message: `Invalid boarding status. Use: ${VALID_BOARDING.join(', ')}` });
      }

      // Validate class exists
      if (row.class_name && !classLookup.has(row.class_name.toLowerCase())) {
        errors.push({ row: rowNum, field: 'class_name', message: `Class not found: ${row.class_name}` });
      }
    });

    return errors;
  }, [studentLookup, classLookup]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const data: ParsedUpdate[] = results.data.map((row) => ({
          admission_number: row.admission_number?.trim() || '',
          first_name: row.first_name?.trim() || undefined,
          middle_name: row.middle_name?.trim(),
          last_name: row.last_name?.trim() || undefined,
          gender: row.gender?.trim() || undefined,
          date_of_birth: row.date_of_birth?.trim() || undefined,
          nationality: row.nationality?.trim() || undefined,
          class_name: row.class_name?.trim() || undefined,
          boarding_status: row.boarding_status?.trim() || undefined,
          status: row.status?.trim() || undefined,
        }));

        const errors = validateData(data);
        const detectedChanges = detectChanges(data);
        
        setParsedData(data);
        setValidationErrors(errors);
        setChanges(detectedChanges);
        setStep('preview');
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setValidationErrors([{ row: 0, field: 'file', message: 'Failed to parse CSV file' }]);
      },
    });
  }, [validateData, detectChanges]);

  const handleUpdate = async () => {
    if (validationErrors.length > 0 || changes.length === 0) return;

    setStep('updating');

    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Group changes by student
    const updatesByStudent = new Map<string, Record<string, unknown>>();
    
    changes.forEach(change => {
      const key = change.admission_number.toLowerCase();
      if (!updatesByStudent.has(key)) {
        updatesByStudent.set(key, {});
      }
      const updates = updatesByStudent.get(key)!;
      
      if (change.field === 'class') {
        updates.class_id = classLookup.get(change.newValue.toLowerCase());
      } else {
        updates[change.field] = change.newValue;
      }
    });

    const totalOperations = updatesByStudent.size;
    let completedOperations = 0;

    for (const [admissionNum, updates] of updatesByStudent) {
      const student = studentLookup.get(admissionNum);
      if (!student) {
        skippedCount++;
        completedOperations++;
        setUpdateProgress(Math.round((completedOperations / totalOperations) * 100));
        continue;
      }

      try {
        const { error } = await supabase
          .from('students')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', student.id);

        if (error) throw error;
        updatedCount++;
      } catch (error) {
        console.error('Update error:', admissionNum, error);
        failedCount++;
      }

      completedOperations++;
      setUpdateProgress(Math.round((completedOperations / totalOperations) * 100));
    }

    setUpdateResults({ updated: updatedCount, skipped: skippedCount, failed: failedCount });
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['students', institutionId] });
    queryClient.invalidateQueries({ queryKey: ['student-stats', institutionId] });
    
    setStep('complete');
  };

  const rowsWithErrors = new Set(validationErrors.map((e) => e.row));
  const validRows = parsedData.filter((_, index) => !rowsWithErrors.has(index + 2));
  const uniqueStudentsWithChanges = new Set(changes.map(c => c.admission_number)).size;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Bulk Update Students</DialogTitle>
          <DialogDescription>
            Export current data, modify in Excel/Sheets, then re-import to update
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 'export' && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Step 1: Export Current Data</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Download a CSV with all {students.length} students. Modify the fields you want to update.
                  </p>
                </div>
              </div>

              <ImportColumnReference 
                importType="student_update"
                dynamicData={{
                  classes: classes?.map(c => ({ 
                    name: c.name, 
                    level: c.level, 
                    stream: c.stream || undefined 
                  })) || [],
                }}
                compact={true}
              />

              <Button onClick={handleExport} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Export {students.length} Students to CSV
              </Button>
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-4 py-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Step 2: Upload Modified CSV</h3>
                <p className="text-sm text-muted-foreground">
                  After editing the CSV, upload it here to preview changes
                </p>
              </div>

              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm font-medium">Click to upload modified CSV</p>
                <p className="text-xs text-muted-foreground">Only modified students will be updated</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <ImportColumnReference 
                importType="student_update"
                dynamicData={{
                  classes: classes?.map(c => ({ 
                    name: c.name, 
                    level: c.level, 
                    stream: c.stream || undefined 
                  })) || [],
                }}
              />
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{parsedData.length}</p>
                  <p className="text-xs text-muted-foreground">Rows in file</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{uniqueStudentsWithChanges}</p>
                  <p className="text-xs text-muted-foreground">Students to update</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{changes.length}</p>
                  <p className="text-xs text-muted-foreground">Field changes</p>
                </div>
              </div>

              {/* Errors */}
              {validationErrors.length > 0 && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">{validationErrors.length} validation error(s)</span>
                  </div>
                  <ScrollArea className="max-h-24">
                    <ul className="text-sm space-y-1">
                      {validationErrors.slice(0, 10).map((err, i) => (
                        <li key={i}>Row {err.row}: {err.field} - {err.message}</li>
                      ))}
                      {validationErrors.length > 10 && (
                        <li className="text-muted-foreground">...and {validationErrors.length - 10} more</li>
                      )}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              {/* Changes Preview */}
              {changes.length > 0 ? (
                <div className="rounded-lg border">
                  <div className="p-3 border-b bg-muted/30">
                    <h4 className="font-medium">Changes to be Applied</h4>
                  </div>
                  <ScrollArea className="max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Admission No.</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Current Value</TableHead>
                          <TableHead></TableHead>
                          <TableHead>New Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {changes.slice(0, 50).map((change, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-sm">{change.admission_number}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{change.field}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {change.oldValue || <span className="italic">empty</span>}
                            </TableCell>
                            <TableCell>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                            <TableCell className="font-medium text-primary">
                              {change.newValue}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {changes.length > 50 && (
                      <p className="p-3 text-sm text-muted-foreground text-center">
                        ...and {changes.length - 50} more changes
                      </p>
                    )}
                  </ScrollArea>
                </div>
              ) : validationErrors.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">No changes detected</p>
                  <p className="text-sm text-muted-foreground">All values match existing records</p>
                </div>
              ) : null}
            </div>
          )}

          {step === 'updating' && (
            <div className="py-8 space-y-4">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 mx-auto text-primary animate-spin" />
                <p className="mt-4 font-medium">Updating students...</p>
              </div>
              <Progress value={updateProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">{updateProgress}% complete</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="py-8 space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Update Complete!</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-4 text-center bg-success/5">
                  <p className="text-2xl font-bold text-success">{updateResults.updated}</p>
                  <p className="text-sm text-muted-foreground">Updated</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">{updateResults.skipped}</p>
                  <p className="text-sm text-muted-foreground">Skipped</p>
                </div>
                <div className="rounded-lg border p-4 text-center bg-destructive/5">
                  <p className="text-2xl font-bold text-destructive">{updateResults.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {step === 'export' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={() => setStep('export')}>
                Back
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={validationErrors.length > 0 || changes.length === 0}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Update {uniqueStudentsWithChanges} Students
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
