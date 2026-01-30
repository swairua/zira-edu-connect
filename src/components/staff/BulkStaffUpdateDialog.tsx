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
import { Upload, AlertCircle, CheckCircle2, Download, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { downloadStaffForUpdate, type StaffMember } from '@/lib/bulk-export';
import { ImportColumnReference } from '@/components/imports/ImportColumnReference';

interface ParsedUpdate {
  employee_number: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  employment_type?: string;
  date_joined?: string;
  is_active?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ChangePreview {
  employee_number: string;
  field: string;
  oldValue: string;
  newValue: string;
}

interface BulkStaffUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  staff: StaffMember[];
  institutionName?: string;
}

const VALID_DEPARTMENTS = ['Teaching', 'Administration', 'Finance', 'IT', 'Support', 'Library', 'Laboratory', 'Sports', 'Other'];
const VALID_EMPLOYMENT_TYPES = ['permanent', 'contract', 'temporary', 'intern'];

export function BulkStaffUpdateDialog({
  open,
  onOpenChange,
  institutionId,
  staff,
  institutionName,
}: BulkStaffUpdateDialogProps) {
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

  // Build staff lookup map by employee number
  const staffLookup = new Map<string, StaffMember>();
  staff.forEach(s => staffLookup.set(s.employee_number.toLowerCase(), s));

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
    downloadStaffForUpdate(staff, institutionName);
    setStep('upload');
  };

  const detectChanges = useCallback((data: ParsedUpdate[]): ChangePreview[] => {
    const changesList: ChangePreview[] = [];

    data.forEach(row => {
      const existing = staffLookup.get(row.employee_number.toLowerCase());
      if (!existing) return;

      // Compare each field
      if (row.first_name && row.first_name !== existing.first_name) {
        changesList.push({
          employee_number: row.employee_number,
          field: 'first_name',
          oldValue: existing.first_name,
          newValue: row.first_name,
        });
      }
      if (row.last_name && row.last_name !== existing.last_name) {
        changesList.push({
          employee_number: row.employee_number,
          field: 'last_name',
          oldValue: existing.last_name,
          newValue: row.last_name,
        });
      }
      if (row.middle_name !== undefined && row.middle_name !== (existing.middle_name || '')) {
        changesList.push({
          employee_number: row.employee_number,
          field: 'middle_name',
          oldValue: existing.middle_name || '',
          newValue: row.middle_name,
        });
      }
      if (row.email !== undefined && row.email !== (existing.email || '')) {
        changesList.push({
          employee_number: row.employee_number,
          field: 'email',
          oldValue: existing.email || '',
          newValue: row.email,
        });
      }
      if (row.phone !== undefined && row.phone !== (existing.phone || '')) {
        changesList.push({
          employee_number: row.employee_number,
          field: 'phone',
          oldValue: existing.phone || '',
          newValue: row.phone,
        });
      }
      if (row.department && row.department !== (existing.department || '')) {
        changesList.push({
          employee_number: row.employee_number,
          field: 'department',
          oldValue: existing.department || '',
          newValue: row.department,
        });
      }
      if (row.designation !== undefined && row.designation !== (existing.designation || '')) {
        changesList.push({
          employee_number: row.employee_number,
          field: 'designation',
          oldValue: existing.designation || '',
          newValue: row.designation,
        });
      }
      if (row.employment_type && row.employment_type.toLowerCase() !== (existing.employment_type || '')) {
        changesList.push({
          employee_number: row.employee_number,
          field: 'employment_type',
          oldValue: existing.employment_type || '',
          newValue: row.employment_type.toLowerCase(),
        });
      }
      if (row.date_joined && row.date_joined !== (existing.date_joined || '')) {
        changesList.push({
          employee_number: row.employee_number,
          field: 'date_joined',
          oldValue: existing.date_joined || '',
          newValue: row.date_joined,
        });
      }
      if (row.is_active !== undefined) {
        const newActive = row.is_active.toLowerCase() === 'true';
        const currentActive = existing.is_active !== false;
        if (newActive !== currentActive) {
          changesList.push({
            employee_number: row.employee_number,
            field: 'is_active',
            oldValue: currentActive ? 'true' : 'false',
            newValue: row.is_active.toLowerCase(),
          });
        }
      }
    });

    return changesList;
  }, [staffLookup]);

  const validateData = useCallback((data: ParsedUpdate[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;

      // Employee number must exist
      if (!row.employee_number?.trim()) {
        errors.push({ row: rowNum, field: 'employee_number', message: 'Employee number is required' });
        return;
      }

      // Check if staff exists
      if (!staffLookup.has(row.employee_number.toLowerCase())) {
        errors.push({ row: rowNum, field: 'employee_number', message: `Staff not found: ${row.employee_number}` });
        return;
      }

      // Validate optional fields if provided
      if (row.email && !row.email.includes('@')) {
        errors.push({ row: rowNum, field: 'email', message: 'Invalid email format' });
      }

      if (row.department && !VALID_DEPARTMENTS.includes(row.department)) {
        errors.push({ row: rowNum, field: 'department', message: `Invalid department. Use: ${VALID_DEPARTMENTS.join(', ')}` });
      }

      if (row.employment_type && !VALID_EMPLOYMENT_TYPES.includes(row.employment_type.toLowerCase())) {
        errors.push({ row: rowNum, field: 'employment_type', message: `Invalid employment type. Use: ${VALID_EMPLOYMENT_TYPES.join(', ')}` });
      }

      if (row.date_joined && isNaN(Date.parse(row.date_joined))) {
        errors.push({ row: rowNum, field: 'date_joined', message: 'Invalid date format. Use YYYY-MM-DD' });
      }

      if (row.is_active && !['true', 'false'].includes(row.is_active.toLowerCase())) {
        errors.push({ row: rowNum, field: 'is_active', message: 'Invalid value. Use: true, false' });
      }
    });

    return errors;
  }, [staffLookup]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const data: ParsedUpdate[] = results.data.map((row) => ({
          employee_number: row.employee_number?.trim() || '',
          first_name: row.first_name?.trim() || undefined,
          middle_name: row.middle_name?.trim(),
          last_name: row.last_name?.trim() || undefined,
          email: row.email?.trim(),
          phone: row.phone?.trim(),
          department: row.department?.trim() || undefined,
          designation: row.designation?.trim(),
          employment_type: row.employment_type?.trim() || undefined,
          date_joined: row.date_joined?.trim(),
          is_active: row.is_active?.trim(),
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

    // Group changes by staff
    const updatesByStaff = new Map<string, Record<string, unknown>>();
    
    changes.forEach(change => {
      const key = change.employee_number.toLowerCase();
      if (!updatesByStaff.has(key)) {
        updatesByStaff.set(key, {});
      }
      const updates = updatesByStaff.get(key)!;
      
      if (change.field === 'is_active') {
        updates[change.field] = change.newValue === 'true';
      } else {
        updates[change.field] = change.newValue;
      }
    });

    const totalOperations = updatesByStaff.size;
    let completedOperations = 0;

    for (const [empNum, updates] of updatesByStaff) {
      const staffMember = staffLookup.get(empNum);
      if (!staffMember) {
        skippedCount++;
        completedOperations++;
        setUpdateProgress(Math.round((completedOperations / totalOperations) * 100));
        continue;
      }

      try {
        const { error } = await supabase
          .from('staff')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', staffMember.id);

        if (error) throw error;
        updatedCount++;
      } catch (error) {
        console.error('Update error:', empNum, error);
        failedCount++;
      }

      completedOperations++;
      setUpdateProgress(Math.round((completedOperations / totalOperations) * 100));
    }

    setUpdateResults({ updated: updatedCount, skipped: skippedCount, failed: failedCount });
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['staff', institutionId] });
    queryClient.invalidateQueries({ queryKey: ['teachers', institutionId] });
    
    setStep('complete');
  };

  const uniqueStaffWithChanges = new Set(changes.map(c => c.employee_number)).size;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Bulk Update Staff</DialogTitle>
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
                    Download a CSV with all {staff.length} staff members. Modify the fields you want to update.
                  </p>
                </div>
              </div>

              <ImportColumnReference 
                importType="staff_update"
                compact={true}
              />

              <Button onClick={handleExport} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Export {staff.length} Staff to CSV
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
                <p className="text-xs text-muted-foreground">Only modified staff will be updated</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <ImportColumnReference 
                importType="staff_update"
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
                  <p className="text-2xl font-bold text-primary">{uniqueStaffWithChanges}</p>
                  <p className="text-xs text-muted-foreground">Staff to update</p>
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
              {changes.length > 0 && (
                <div className="rounded-lg border">
                  <div className="p-3 border-b bg-muted/30">
                    <h4 className="font-medium">Changes to Apply</h4>
                  </div>
                  <ScrollArea className="max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee #</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Current Value</TableHead>
                          <TableHead></TableHead>
                          <TableHead>New Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {changes.slice(0, 50).map((change, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-xs">{change.employee_number}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{change.field.replace('_', ' ')}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-32 truncate">
                              {change.oldValue || '(empty)'}
                            </TableCell>
                            <TableCell>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                            <TableCell className="font-medium max-w-32 truncate">
                              {change.newValue || '(empty)'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {changes.length > 50 && (
                      <p className="text-xs text-muted-foreground p-3 text-center">
                        Showing first 50 of {changes.length} changes
                      </p>
                    )}
                  </ScrollArea>
                </div>
              )}

              {changes.length === 0 && validationErrors.length === 0 && (
                <div className="rounded-lg border p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                  <p className="mt-2 font-medium">No changes detected</p>
                  <p className="text-sm text-muted-foreground">
                    The uploaded file matches the current data
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'updating' && (
            <div className="space-y-4 py-8">
              <div className="text-center space-y-2">
                <RefreshCw className="h-12 w-12 text-primary mx-auto animate-spin" />
                <h3 className="text-lg font-semibold">Updating Staff...</h3>
                <p className="text-sm text-muted-foreground">Please wait while we apply the changes</p>
              </div>
              <Progress value={updateProgress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">{updateProgress}% complete</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-4 py-8">
              <div className="text-center space-y-2">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold">Update Complete!</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center bg-green-50 dark:bg-green-950/20">
                  <p className="text-2xl font-bold text-green-600">{updateResults.updated}</p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
                <div className="rounded-lg border p-3 text-center bg-amber-50 dark:bg-amber-950/20">
                  <p className="text-2xl font-bold text-amber-600">{updateResults.skipped}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
                <div className="rounded-lg border p-3 text-center bg-red-50 dark:bg-red-950/20">
                  <p className="text-2xl font-bold text-red-600">{updateResults.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2">
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
                <CheckCircle2 className="h-4 w-4" />
                Apply {changes.length} Changes
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
