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
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { downloadParentsForUpdate, type Parent } from '@/lib/bulk-export';
import { ImportColumnReference } from '@/components/imports/ImportColumnReference';

interface ParsedUpdate {
  phone: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  relationship_type?: string;
  occupation?: string;
  address?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ChangePreview {
  phone: string;
  field: string;
  oldValue: string;
  newValue: string;
}

interface BulkParentUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  parents: Parent[];
  institutionName?: string;
}

const VALID_RELATIONSHIPS = ['father', 'mother', 'guardian', 'parent', 'uncle', 'aunt', 'grandparent', 'other'];

export function BulkParentUpdateDialog({
  open,
  onOpenChange,
  institutionId,
  parents,
  institutionName,
}: BulkParentUpdateDialogProps) {
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

  // Build parent lookup map by phone
  const parentLookup = new Map<string, Parent>();
  parents.forEach(p => parentLookup.set(p.phone.toLowerCase().replace(/\s+/g, ''), p));

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
    downloadParentsForUpdate(parents, institutionName);
    setStep('upload');
  };

  const normalizePhone = (phone: string): string => {
    return phone.toLowerCase().replace(/\s+/g, '');
  };

  const detectChanges = useCallback((data: ParsedUpdate[]): ChangePreview[] => {
    const changesList: ChangePreview[] = [];

    data.forEach(row => {
      const existing = parentLookup.get(normalizePhone(row.phone));
      if (!existing) return;

      // Compare each field
      if (row.first_name && row.first_name !== existing.first_name) {
        changesList.push({
          phone: row.phone,
          field: 'first_name',
          oldValue: existing.first_name,
          newValue: row.first_name,
        });
      }
      if (row.last_name && row.last_name !== existing.last_name) {
        changesList.push({
          phone: row.phone,
          field: 'last_name',
          oldValue: existing.last_name,
          newValue: row.last_name,
        });
      }
      if (row.email !== undefined && row.email !== (existing.email || '')) {
        changesList.push({
          phone: row.phone,
          field: 'email',
          oldValue: existing.email || '',
          newValue: row.email,
        });
      }
      if (row.relationship_type && row.relationship_type.toLowerCase() !== (existing.relationship_type || '')) {
        changesList.push({
          phone: row.phone,
          field: 'relationship_type',
          oldValue: existing.relationship_type || '',
          newValue: row.relationship_type.toLowerCase(),
        });
      }
      if (row.occupation !== undefined && row.occupation !== (existing.occupation || '')) {
        changesList.push({
          phone: row.phone,
          field: 'occupation',
          oldValue: existing.occupation || '',
          newValue: row.occupation,
        });
      }
      if (row.address !== undefined && row.address !== (existing.address || '')) {
        changesList.push({
          phone: row.phone,
          field: 'address',
          oldValue: existing.address || '',
          newValue: row.address,
        });
      }
    });

    return changesList;
  }, [parentLookup]);

  const validateData = useCallback((data: ParsedUpdate[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;

      // Phone must exist
      if (!row.phone?.trim()) {
        errors.push({ row: rowNum, field: 'phone', message: 'Phone number is required' });
        return;
      }

      // Check if parent exists
      if (!parentLookup.has(normalizePhone(row.phone))) {
        errors.push({ row: rowNum, field: 'phone', message: `Parent not found: ${row.phone}` });
        return;
      }

      // Validate optional fields if provided
      if (row.email && !row.email.includes('@')) {
        errors.push({ row: rowNum, field: 'email', message: 'Invalid email format' });
      }

      if (row.relationship_type && !VALID_RELATIONSHIPS.includes(row.relationship_type.toLowerCase())) {
        errors.push({ row: rowNum, field: 'relationship_type', message: `Invalid relationship. Use: ${VALID_RELATIONSHIPS.join(', ')}` });
      }
    });

    return errors;
  }, [parentLookup]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const data: ParsedUpdate[] = results.data.map((row) => ({
          phone: row.phone?.trim() || '',
          first_name: row.first_name?.trim() || undefined,
          last_name: row.last_name?.trim() || undefined,
          email: row.email?.trim(),
          relationship_type: row.relationship_type?.trim() || undefined,
          occupation: row.occupation?.trim(),
          address: row.address?.trim(),
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

    // Group changes by parent
    const updatesByParent = new Map<string, Record<string, unknown>>();
    
    changes.forEach(change => {
      const key = normalizePhone(change.phone);
      if (!updatesByParent.has(key)) {
        updatesByParent.set(key, {});
      }
      const updates = updatesByParent.get(key)!;
      updates[change.field] = change.newValue;
    });

    const totalOperations = updatesByParent.size;
    let completedOperations = 0;

    for (const [phoneKey, updates] of updatesByParent) {
      const parent = parentLookup.get(phoneKey);
      if (!parent) {
        skippedCount++;
        completedOperations++;
        setUpdateProgress(Math.round((completedOperations / totalOperations) * 100));
        continue;
      }

      try {
        const { error } = await supabase
          .from('parents')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', parent.id);

        if (error) throw error;
        updatedCount++;
      } catch (error) {
        console.error('Update error:', phoneKey, error);
        failedCount++;
      }

      completedOperations++;
      setUpdateProgress(Math.round((completedOperations / totalOperations) * 100));
    }

    setUpdateResults({ updated: updatedCount, skipped: skippedCount, failed: failedCount });
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['parents', institutionId] });
    
    setStep('complete');
  };

  const rowsWithErrors = new Set(validationErrors.map((e) => e.row));
  const uniqueParentsWithChanges = new Set(changes.map(c => c.phone)).size;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Bulk Update Parents</DialogTitle>
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
                    Download a CSV with all {parents.length} parents. Modify the fields you want to update.
                  </p>
                </div>
              </div>

              <ImportColumnReference 
                importType="parent_update"
                compact={true}
              />

              <Button onClick={handleExport} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Export {parents.length} Parents to CSV
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
                <p className="text-xs text-muted-foreground">Only modified parents will be updated</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <ImportColumnReference 
                importType="parent_update"
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
                  <p className="text-2xl font-bold text-primary">{uniqueParentsWithChanges}</p>
                  <p className="text-xs text-muted-foreground">Parents to update</p>
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
                          <TableHead>Phone</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Current Value</TableHead>
                          <TableHead></TableHead>
                          <TableHead>New Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {changes.slice(0, 50).map((change, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-xs">{change.phone}</TableCell>
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
                <h3 className="text-lg font-semibold">Updating Parents...</h3>
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
