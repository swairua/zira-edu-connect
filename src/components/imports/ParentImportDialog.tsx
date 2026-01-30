import { useState, useCallback, useRef, useEffect } from 'react';
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
import { Upload, AlertCircle, CheckCircle2, X, Download, Link2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImportColumnReference } from '@/components/imports/ImportColumnReference';
import { formatValidationError } from '@/config/importColumnDefinitions';

interface ParsedParent {
  phone: string;
  first_name: string;
  last_name: string;
  email?: string;
  relationship?: string;
  student_admission_numbers?: string;
  id_number?: string;
  occupation?: string;
  address?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParentImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
}

const REQUIRED_COLUMNS = ['phone', 'first_name', 'last_name'];
const OPTIONAL_COLUMNS = ['email', 'relationship', 'student_admission_numbers', 'id_number', 'occupation', 'address'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

export function ParentImportDialog({
  open,
  onOpenChange,
  institutionId,
}: ParentImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [parsedData, setParsedData] = useState<ParsedParent[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ 
    parents: number; 
    studentLinks: number;
    duplicatesSkipped: number;
    failed: number;
  }>({ parents: 0, studentLinks: 0, duplicatesSkipped: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student lookup map for auto-linking
  const [studentLookup, setStudentLookup] = useState<Map<string, string>>(new Map());
  const [existingPhones, setExistingPhones] = useState<Set<string>>(new Set());

  // Load students and existing parents for validation
  useEffect(() => {
    if (open && institutionId) {
      // Load students for linking
      supabase
        .from('students')
        .select('id, admission_number')
        .eq('institution_id', institutionId)
        .eq('status', 'active')
        .then(({ data }) => {
          if (data) {
            const lookup = new Map<string, string>();
            data.forEach(s => lookup.set(s.admission_number.toLowerCase(), s.id));
            setStudentLookup(lookup);
          }
        });

      // Load existing parents to check for duplicates
      supabase
        .from('parents')
        .select('phone')
        .eq('institution_id', institutionId)
        .then(({ data }) => {
          if (data) {
            const phones = new Set(data.map(p => p.phone?.toLowerCase() || ''));
            setExistingPhones(phones);
          }
        });
    }
  }, [open, institutionId]);

  const resetState = () => {
    setStep('upload');
    setParsedData([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResults({ parents: 0, studentLinks: 0, duplicatesSkipped: 0, failed: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validateData = useCallback((data: ParsedParent[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const seenPhones = new Set<string>();

    data.forEach((row, index) => {
      const rowNum = index + 2;

      if (!row.phone?.trim()) {
        errors.push({ row: rowNum, field: 'phone', message: 'Phone number is required' });
      } else {
        const normalizedPhone = row.phone.trim().toLowerCase();
        if (seenPhones.has(normalizedPhone)) {
          errors.push({ row: rowNum, field: 'phone', message: 'Duplicate phone number in file' });
        }
        seenPhones.add(normalizedPhone);
      }

      if (!row.first_name?.trim()) {
        errors.push({ row: rowNum, field: 'first_name', message: 'First name is required' });
      }

      if (!row.last_name?.trim()) {
        errors.push({ row: rowNum, field: 'last_name', message: 'Last name is required' });
      }

      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push({ row: rowNum, field: 'email', message: 'Invalid email format' });
      }

      if (row.relationship && !['father', 'mother', 'guardian', 'parent', 'uncle', 'aunt', 'grandparent', 'other'].includes(row.relationship.toLowerCase())) {
        errors.push({ row: rowNum, field: 'relationship', message: formatValidationError('relationship', row.relationship, 'parents') });
      }

      // Validate student admission numbers if provided (warning only)
      if (row.student_admission_numbers) {
        const admNumbers = row.student_admission_numbers.split(/[;,]/).map(s => s.trim().toLowerCase()).filter(Boolean);
        const invalidAdmNumbers = admNumbers.filter(an => !studentLookup.has(an));
        if (invalidAdmNumbers.length > 0) {
          // This is a warning, not a blocking error - we'll still import but skip invalid links
        }
      }
    });

    return errors;
  }, [studentLookup]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const data = results.data.map((row) => ({
          phone: row.phone?.trim() || '',
          first_name: row.first_name?.trim() || '',
          last_name: row.last_name?.trim() || '',
          email: row.email?.trim() || undefined,
          relationship: row.relationship?.trim().toLowerCase() || undefined,
          student_admission_numbers: row.student_admission_numbers?.trim() || undefined,
          id_number: row.id_number?.trim() || undefined,
          occupation: row.occupation?.trim() || undefined,
          address: row.address?.trim() || undefined,
        }));

        const errors = validateData(data);
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
    let parentCount = 0;
    let studentLinkCount = 0;
    let duplicatesSkipped = 0;
    let failedCount = 0;

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      try {
        const normalizedPhone = row.phone.trim();
        
        // Check if parent already exists
        const existsAlready = existingPhones.has(normalizedPhone.toLowerCase());
        
        let parentId: string;

        if (existsAlready) {
          // Get existing parent ID for linking
          const { data: existingParent } = await supabase
            .from('parents')
            .select('id')
            .eq('institution_id', institutionId)
            .ilike('phone', normalizedPhone)
            .maybeSingle();
          
          if (existingParent) {
            parentId = existingParent.id;
            duplicatesSkipped++;
          } else {
            // Shouldn't happen, but create anyway
            const { data: newParent, error } = await supabase.from('parents').insert({
              institution_id: institutionId,
              phone: normalizedPhone,
              first_name: row.first_name.trim(),
              last_name: row.last_name.trim(),
              email: row.email || null,
              relationship: row.relationship || 'parent',
              id_number: row.id_number || null,
              occupation: row.occupation || null,
              address: row.address || null,
            }).select().single();

            if (error) throw error;
            parentId = newParent.id;
            parentCount++;
          }
        } else {
          // Create new parent
          const { data: newParent, error } = await supabase.from('parents').insert({
            institution_id: institutionId,
            phone: normalizedPhone,
            first_name: row.first_name.trim(),
            last_name: row.last_name.trim(),
            email: row.email || null,
            relationship: row.relationship || 'parent',
            id_number: row.id_number || null,
            occupation: row.occupation || null,
            address: row.address || null,
          }).select().single();

          if (error) throw error;
          parentId = newParent.id;
          parentCount++;
        }

        // Link to students if admission numbers provided
        if (row.student_admission_numbers && parentId) {
          const admNumbers = row.student_admission_numbers.split(/[;,]/).map(s => s.trim().toLowerCase()).filter(Boolean);
          
          for (const admNumber of admNumbers) {
            const studentId = studentLookup.get(admNumber);
            if (studentId) {
              // Check if link already exists
              const { data: existingLink } = await supabase
                .from('student_parents')
                .select('id')
                .eq('student_id', studentId)
                .eq('parent_id', parentId)
                .maybeSingle();

              if (!existingLink) {
                await supabase.from('student_parents').insert([{
                  institution_id: institutionId,
                  student_id: studentId,
                  parent_id: parentId,
                  relationship: row.relationship || 'parent',
                  is_primary: true,
                }]);
                studentLinkCount++;
              }
            }
          }
        }
      } catch (error) {
        console.error('Parent import error:', error);
        failedCount++;
      }
      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setImportResults({ 
      parents: parentCount, 
      studentLinks: studentLinkCount, 
      duplicatesSkipped,
      failed: failedCount 
    });
    setStep('complete');
    toast.success(`Imported ${parentCount} parents, linked ${studentLinkCount} students`);
  };

  const downloadTemplate = () => {
    const headers = ALL_COLUMNS.join(',');
    const sampleRow1 = '+254712345678,Jane,Doe,jane@email.com,mother,STU001;STU002,12345678,Teacher,123 Main St';
    const sampleRow2 = '+254723456789,James,Smith,james@email.com,father,STU003,,Engineer,456 Oak Ave';
    const csvContent = `${headers}\n${sampleRow1}\n${sampleRow2}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parent_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowsWithErrors = new Set(validationErrors.map((e) => e.row));
  const validRows = parsedData.filter((_, index) => !rowsWithErrors.has(index + 2));

  // Count rows with student links and duplicates
  const rowsWithLinks = parsedData.filter(r => r.student_admission_numbers).length;
  const rowsDuplicate = parsedData.filter(r => existingPhones.has(r.phone?.toLowerCase() || '')).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Enhanced Parent Import</DialogTitle>
          <DialogDescription>
            Import parents with automatic student linking by admission number
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
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

              <ImportColumnReference 
                importType="parents"
                dynamicData={{
                  students: Array.from(studentLookup.keys()).map(an => ({ admission_number: an.toUpperCase() })),
                }}
              />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{studentLookup.size} students available for linking</span>
              </div>

              <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {parsedData.length} parents
                </Badge>
                <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700">
                  <Link2 className="h-3 w-3" />
                  {rowsWithLinks} with student links
                </Badge>
                {rowsDuplicate > 0 && (
                  <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-700">
                    {rowsDuplicate} existing (will update links)
                  </Badge>
                )}
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
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">{validationErrors.length} validation errors found</span>
                  </div>
                  <ScrollArea className="h-24">
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {validationErrors.slice(0, 10).map((error, i) => (
                        <li key={i}>
                          Row {error.row}: {error.field} - {error.message}
                        </li>
                      ))}
                      {validationErrors.length > 10 && (
                        <li className="text-muted-foreground">...and {validationErrors.length - 10} more errors</li>
                      )}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              <ScrollArea className="h-64 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Student Links</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 50).map((row, index) => {
                      const hasError = rowsWithErrors.has(index + 2);
                      const isDuplicate = existingPhones.has(row.phone?.toLowerCase() || '');
                      const admNumbers = row.student_admission_numbers?.split(/[;,]/).map(s => s.trim()).filter(Boolean) || [];
                      const validAdmNumbers = admNumbers.filter(an => studentLookup.has(an.toLowerCase()));
                      
                      return (
                        <TableRow key={index} className={hasError ? 'bg-destructive/10' : ''}>
                          <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                          <TableCell>
                            {row.phone}
                            {isDuplicate && (
                              <Badge variant="outline" className="ml-2 text-xs bg-yellow-50">existing</Badge>
                            )}
                          </TableCell>
                          <TableCell>{row.first_name} {row.last_name}</TableCell>
                          <TableCell>
                            {admNumbers.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {admNumbers.map((an, i) => (
                                  <Badge 
                                    key={i}
                                    variant="outline" 
                                    className={studentLookup.has(an.toLowerCase()) 
                                      ? 'bg-green-50 text-green-700' 
                                      : 'bg-red-50 text-red-700'
                                    }
                                  >
                                    {an}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
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
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-lg font-medium">Importing parents...</p>
              <Progress value={importProgress} className="w-64" />
              <p className="mt-2 text-sm text-muted-foreground">{importProgress}% complete</p>
              <p className="mt-1 text-xs text-muted-foreground">Creating parents and linking students...</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-lg font-medium">Import Complete</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{importResults.parents}</p>
                  <p className="text-sm text-muted-foreground">Parents Created</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{importResults.studentLinks}</p>
                  <p className="text-sm text-muted-foreground">Student Links</p>
                </div>
                {importResults.duplicatesSkipped > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{importResults.duplicatesSkipped}</p>
                    <p className="text-sm text-muted-foreground">Existing Updated</p>
                  </div>
                )}
                {importResults.failed > 0 && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-2xl font-bold text-destructive">{importResults.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={resetState}>Upload Different File</Button>
              <Button onClick={handleImport} disabled={validationErrors.length > 0 || parsedData.length === 0}>
                Import {validRows.length} Parents
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
