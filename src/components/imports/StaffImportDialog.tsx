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
import { Upload, AlertCircle, CheckCircle2, X, Download, BookOpen, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImportColumnReference } from '@/components/imports/ImportColumnReference';
import { formatValidationError } from '@/config/importColumnDefinitions';

interface ParsedStaff {
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  date_joined?: string;
  gender?: string;
  id_number?: string;
  // Enhanced fields
  subjects?: string;         // Semicolon-separated subject codes
  class_teacher_of?: string; // Class name if class teacher
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface StaffImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
}

const REQUIRED_COLUMNS = ['employee_number', 'first_name', 'last_name', 'email'];
const OPTIONAL_COLUMNS = ['phone', 'department', 'designation', 'date_joined', 'gender', 'id_number', 'subjects', 'class_teacher_of'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

export function StaffImportDialog({
  open,
  onOpenChange,
  institutionId,
}: StaffImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [parsedData, setParsedData] = useState<ParsedStaff[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ 
    staff: number; 
    subjectAssignments: number;
    classTeacherAssignments: number;
    failed: number;
  }>({ staff: 0, subjectAssignments: 0, classTeacherAssignments: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lookups for subjects and classes
  const [subjectLookup, setSubjectLookup] = useState<Map<string, string>>(new Map());
  const [classLookup, setClassLookup] = useState<Map<string, string>>(new Map());
  const [subjectData, setSubjectData] = useState<Array<{ code: string; name: string }>>([]);
  const [classData, setClassData] = useState<Array<{ name: string; level: string; stream?: string }>>([]);

  // Load subjects and classes for validation
  useEffect(() => {
    if (open && institutionId) {
      // Load subjects
      supabase
        .from('subjects')
        .select('id, code, name')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .then(({ data }) => {
          if (data) {
            const lookup = new Map<string, string>();
            const subjectList: Array<{ code: string; name: string }> = [];
            data.forEach(s => {
              lookup.set(s.code?.toLowerCase() || '', s.id);
              lookup.set(s.name.toLowerCase(), s.id);
              if (s.code) {
                subjectList.push({ code: s.code, name: s.name });
              }
            });
            setSubjectLookup(lookup);
            setSubjectData(subjectList);
          }
        });

      // Load classes
      supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .then(({ data }) => {
          if (data) {
            const lookup = new Map<string, string>();
            const classList: Array<{ name: string; level: string; stream?: string }> = [];
            data.forEach(c => {
              lookup.set(c.name.toLowerCase(), c.id);
              if (c.stream) {
                lookup.set(`${c.level} ${c.stream}`.toLowerCase(), c.id);
              }
              lookup.set(c.level.toLowerCase(), c.id);
              classList.push({ name: c.name, level: c.level, stream: c.stream || undefined });
            });
            setClassLookup(lookup);
            setClassData(classList);
          }
        });
    }
  }, [open, institutionId]);

  const resetState = () => {
    setStep('upload');
    setParsedData([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResults({ staff: 0, subjectAssignments: 0, classTeacherAssignments: 0, failed: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validateData = useCallback((data: ParsedStaff[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const seenStaffNumbers = new Set<string>();
    const seenEmails = new Set<string>();

    data.forEach((row, index) => {
      const rowNum = index + 2;

      if (!row.employee_number?.trim()) {
        errors.push({ row: rowNum, field: 'employee_number', message: 'Employee number is required' });
      } else {
        if (seenStaffNumbers.has(row.employee_number.trim())) {
          errors.push({ row: rowNum, field: 'employee_number', message: 'Duplicate employee number in file' });
        }
        seenStaffNumbers.add(row.employee_number.trim());
      }

      if (!row.first_name?.trim()) {
        errors.push({ row: rowNum, field: 'first_name', message: 'First name is required' });
      }

      if (!row.last_name?.trim()) {
        errors.push({ row: rowNum, field: 'last_name', message: 'Last name is required' });
      }

      if (!row.email?.trim()) {
        errors.push({ row: rowNum, field: 'email', message: 'Email is required' });
      } else {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          errors.push({ row: rowNum, field: 'email', message: 'Invalid email format' });
        }
        if (seenEmails.has(row.email.trim().toLowerCase())) {
          errors.push({ row: rowNum, field: 'email', message: 'Duplicate email in file' });
        }
        seenEmails.add(row.email.trim().toLowerCase());
      }

      if (row.date_joined && isNaN(Date.parse(row.date_joined))) {
        errors.push({ row: rowNum, field: 'date_joined', message: formatValidationError('date_joined', row.date_joined, 'staff') });
      }

      if (row.gender && !['male', 'female', 'other'].includes(row.gender.toLowerCase())) {
        errors.push({ row: rowNum, field: 'gender', message: formatValidationError('gender', row.gender, 'staff') });
      }
    });

    return errors;
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const data = results.data.map((row) => ({
          employee_number: row.employee_number?.trim() || '',
          first_name: row.first_name?.trim() || '',
          last_name: row.last_name?.trim() || '',
          email: row.email?.trim() || '',
          phone: row.phone?.trim() || undefined,
          department: row.department?.trim() || undefined,
          designation: row.designation?.trim() || undefined,
          date_joined: row.date_joined?.trim() || undefined,
          gender: row.gender?.trim()?.toLowerCase() || undefined,
          id_number: row.id_number?.trim() || undefined,
          // Enhanced fields
          subjects: row.subjects?.trim() || undefined,
          class_teacher_of: row.class_teacher_of?.trim() || undefined,
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
    let staffCount = 0;
    let subjectAssignmentCount = 0;
    let classTeacherCount = 0;
    let failedCount = 0;

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      try {
        // Create staff record
        const { data: staff, error } = await supabase.from('staff').insert({
          institution_id: institutionId,
          employee_number: row.employee_number.trim(),
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          email: row.email.trim(),
          phone: row.phone || null,
          department: row.department || null,
          designation: row.designation || 'Teacher',
          date_joined: row.date_joined || new Date().toISOString().split('T')[0],
          gender: row.gender || null,
          id_number: row.id_number || null,
          is_active: true,
        }).select().single();

        if (error) throw error;
        staffCount++;

        // Handle subject assignments
        if (row.subjects && staff) {
          const subjectCodes = row.subjects.split(/[;,]/).map(s => s.trim().toLowerCase()).filter(Boolean);
          
          for (const code of subjectCodes) {
            const subjectId = subjectLookup.get(code);
            if (subjectId) {
              // Get all classes that have this subject
              const { data: classSubjects } = await supabase
                .from('class_subjects')
                .select('id, class_id')
                .eq('institution_id', institutionId)
                .eq('subject_id', subjectId)
                .is('teacher_id', null);

              if (classSubjects && classSubjects.length > 0) {
                // Assign this teacher to class-subject combinations
                for (const cs of classSubjects) {
                  await supabase
                    .from('class_subjects')
                    .update({ teacher_id: staff.id })
                    .eq('id', cs.id);
                  subjectAssignmentCount++;
                }
              }

              // Also create class_teachers record for tracking
              const { data: allClassesWithSubject } = await supabase
                .from('class_subjects')
                .select('class_id')
                .eq('institution_id', institutionId)
                .eq('subject_id', subjectId);

              if (allClassesWithSubject) {
                for (const cs of allClassesWithSubject) {
                  // Check if assignment already exists
                  const { data: existing } = await supabase
                    .from('class_teachers')
                    .select('id')
                    .eq('class_id', cs.class_id)
                    .eq('staff_id', staff.id)
                    .eq('subject_id', subjectId)
                    .maybeSingle();

                  if (!existing) {
                    await supabase.from('class_teachers').insert({
                      institution_id: institutionId,
                      class_id: cs.class_id,
                      staff_id: staff.id,
                      subject_id: subjectId,
                      is_class_teacher: false,
                    });
                  }
                }
              }
            }
          }
        }

        // Handle class teacher assignment
        if (row.class_teacher_of && staff) {
          const classId = classLookup.get(row.class_teacher_of.toLowerCase());
          if (classId) {
            // Update class with class_teacher_id
            await supabase
              .from('classes')
              .update({ class_teacher_id: staff.id })
              .eq('id', classId);

            // Also create class_teachers record
            const { data: existing } = await supabase
              .from('class_teachers')
              .select('id')
              .eq('class_id', classId)
              .eq('staff_id', staff.id)
              .eq('is_class_teacher', true)
              .maybeSingle();

            if (!existing) {
              await supabase.from('class_teachers').insert({
                institution_id: institutionId,
                class_id: classId,
                staff_id: staff.id,
                is_class_teacher: true,
              });
            }

            classTeacherCount++;
          }
        }

      } catch (error) {
        console.error('Staff insert error:', error);
        failedCount++;
      }
      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setImportResults({ 
      staff: staffCount, 
      subjectAssignments: subjectAssignmentCount, 
      classTeacherAssignments: classTeacherCount,
      failed: failedCount 
    });
    setStep('complete');
    toast.success(`Imported ${staffCount} staff members`);
  };

  const downloadTemplate = () => {
    const headers = ALL_COLUMNS.join(',');
    const sampleRow1 = 'EMP001,John,Smith,john.smith@school.edu,+254712345678,Mathematics,Teacher,2024-01-15,male,12345678,MATH;ENG,Grade 1 A';
    const sampleRow2 = 'EMP002,Mary,Wanjiku,mary.w@school.edu,+254723456789,Science,Senior Teacher,2023-06-01,female,23456789,SCI;BIO,';
    const csvContent = `${headers}\n${sampleRow1}\n${sampleRow2}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowsWithErrors = new Set(validationErrors.map((e) => e.row));
  const validRows = parsedData.filter((_, index) => !rowsWithErrors.has(index + 2));

  // Count enhanced data
  const rowsWithSubjects = parsedData.filter(r => r.subjects).length;
  const rowsWithClassTeacher = parsedData.filter(r => r.class_teacher_of).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Enhanced Staff Import</DialogTitle>
          <DialogDescription>
            Import staff with automatic subject and class teacher assignments
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
                importType="staff"
                dynamicData={{
                  subjects: subjectData,
                  classes: classData,
                }}
              />

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{subjectData.length} subjects available</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{classData.length} classes available</span>
                </div>
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
                  <GraduationCap className="h-3 w-3" />
                  {parsedData.length} staff
                </Badge>
                <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700">
                  <BookOpen className="h-3 w-3" />
                  {rowsWithSubjects} with subjects
                </Badge>
                <Badge variant="outline" className="gap-1 bg-purple-50 text-purple-700">
                  <GraduationCap className="h-3 w-3" />
                  {rowsWithClassTeacher} class teachers
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
                      <TableHead>Emp. No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Class Teacher</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 50).map((row, index) => {
                      const hasError = rowsWithErrors.has(index + 2);
                      const subjectCodes = row.subjects?.split(/[;,]/).map(s => s.trim()).filter(Boolean) || [];
                      const validSubjects = subjectCodes.filter(s => subjectLookup.has(s.toLowerCase()));
                      const hasValidClass = row.class_teacher_of && classLookup.has(row.class_teacher_of.toLowerCase());
                      
                      return (
                        <TableRow key={index} className={hasError ? 'bg-destructive/10' : ''}>
                          <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                          <TableCell>{row.employee_number}</TableCell>
                          <TableCell>{row.first_name} {row.last_name}</TableCell>
                          <TableCell>
                            {subjectCodes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {subjectCodes.map((code, i) => (
                                  <Badge 
                                    key={i}
                                    variant="outline" 
                                    className={subjectLookup.has(code.toLowerCase()) 
                                      ? 'bg-blue-50 text-blue-700' 
                                      : 'bg-yellow-50 text-yellow-700'
                                    }
                                  >
                                    {code}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.class_teacher_of ? (
                              <Badge 
                                variant="outline"
                                className={hasValidClass 
                                  ? 'bg-purple-50 text-purple-700' 
                                  : 'bg-yellow-50 text-yellow-700'
                                }
                              >
                                {row.class_teacher_of}
                              </Badge>
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
              <p className="mb-4 text-lg font-medium">Importing staff...</p>
              <Progress value={importProgress} className="w-64" />
              <p className="mt-2 text-sm text-muted-foreground">{importProgress}% complete</p>
              <p className="mt-1 text-xs text-muted-foreground">Creating staff and assigning subjects/classes...</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-lg font-medium">Import Complete</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{importResults.staff}</p>
                  <p className="text-sm text-muted-foreground">Staff Created</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{importResults.subjectAssignments}</p>
                  <p className="text-sm text-muted-foreground">Subject Assignments</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{importResults.classTeacherAssignments}</p>
                  <p className="text-sm text-muted-foreground">Class Teachers</p>
                </div>
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
                Import {validRows.length} Staff
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
