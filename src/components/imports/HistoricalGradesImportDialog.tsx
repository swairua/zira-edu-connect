import { useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudents } from '@/hooks/useStudents';
import { useActiveSubjects } from '@/hooks/useSubjects';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useDataImports } from '@/hooks/useDataImports';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Download, Upload, History, FileUp } from 'lucide-react';
import { isExampleRow } from '@/lib/date-utils';
import { ImportColumnReference } from '@/components/imports/ImportColumnReference';
import { formatValidationError } from '@/config/importColumnDefinitions';

interface ParsedGrade {
  admission_number: string;
  academic_year: string;
  term: string;
  exam_name: string;
  subject_code: string;
  marks: string;
  grade?: string;
  remarks?: string;
  rowIndex: number;
  errors: string[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface HistoricalGradesImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
}

export function HistoricalGradesImportDialog({
  open,
  onOpenChange,
  institutionId,
}: HistoricalGradesImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [parsedData, setParsedData] = useState<ParsedGrade[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: students = [] } = useStudents(institutionId);
  const { data: subjects = [] } = useActiveSubjects(institutionId);
  const { data: academicYears = [] } = useAcademicYears(institutionId);
  const { createImport, updateImport } = useDataImports();

  // Create lookup maps
  const studentMap = new Map(students.map(s => [s.admission_number?.toLowerCase(), s]));
  const subjectMap = new Map(subjects.map(s => [s.code?.toLowerCase(), s]));
  const yearMap = new Map(academicYears.map(y => [y.name?.toLowerCase(), y]));

  const resetState = () => {
    setStep('upload');
    setParsedData([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0 });
    setSelectedFile(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validateData = useCallback((data: ParsedGrade[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      // Required fields
      if (!row.admission_number) {
        errors.push({ row: index + 2, field: 'admission_number', message: 'Admission number is required' });
      } else if (!studentMap.has(row.admission_number.toLowerCase())) {
        errors.push({ row: index + 2, field: 'admission_number', message: `Student not found: ${row.admission_number}` });
      }

      if (!row.academic_year) {
        errors.push({ row: index + 2, field: 'academic_year', message: 'Academic year is required' });
      }

      if (!row.term) {
        errors.push({ row: index + 2, field: 'term', message: 'Term is required' });
      }

      if (!row.exam_name) {
        errors.push({ row: index + 2, field: 'exam_name', message: 'Exam name is required' });
      }

      if (!row.subject_code) {
        errors.push({ row: index + 2, field: 'subject_code', message: 'Subject code is required' });
      } else if (!subjectMap.has(row.subject_code.toLowerCase())) {
        errors.push({ row: index + 2, field: 'subject_code', message: `Subject not found: ${row.subject_code}` });
      }

      if (!row.marks) {
        errors.push({ row: index + 2, field: 'marks', message: 'Marks is required' });
      } else {
        const marks = parseFloat(row.marks);
        if (isNaN(marks) || marks < 0 || marks > 100) {
          errors.push({ row: index + 2, field: 'marks', message: 'Marks must be a number between 0 and 100' });
        }
      }
    });

    return errors;
  }, [studentMap, subjectMap]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: ParsedGrade[] = results.data
          .filter((row: any) => !isExampleRow(row, ['admission_number', 'academic_year']))
          .map((row: any, index: number) => ({
            admission_number: row.admission_number?.trim() || '',
            academic_year: row.academic_year?.trim() || '',
            term: row.term?.trim() || '',
            exam_name: row.exam_name?.trim() || '',
            subject_code: row.subject_code?.trim() || '',
            marks: row.marks?.trim() || '',
            grade: row.grade?.trim() || '',
            remarks: row.remarks?.trim() || '',
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

    try {
      // Create import record
      const importRecord = await createImport.mutateAsync({
        importType: 'historical_grades',
        fileName: selectedFile?.name || 'historical_grades.csv',
        totalRows: parsedData.length,
      });

      // Filter valid rows
      const validRows = parsedData.filter((row, index) => 
        !validationErrors.some(e => e.row === index + 2)
      );

      // Group by academic year, term, and exam for batch processing
      const examGroups = new Map<string, ParsedGrade[]>();
      
      for (const row of validRows) {
        const key = `${row.academic_year}|${row.term}|${row.exam_name}`;
        if (!examGroups.has(key)) {
          examGroups.set(key, []);
        }
        examGroups.get(key)!.push(row);
      }

      let processed = 0;

      for (const [key, rows] of examGroups) {
        const [yearName, termName, examName] = key.split('|');
        
        // Find or create academic year
        let academicYear = yearMap.get(yearName.toLowerCase());
        if (!academicYear) {
          // Create academic year
          const { data: newYear, error: yearError } = await supabase
            .from('academic_years')
            .insert({
              institution_id: institutionId,
              name: yearName,
              start_date: `${yearName.split('-')[0] || yearName}-01-01`,
              end_date: `${yearName.split('-')[1] || parseInt(yearName) + 1}-12-31`,
              is_current: false,
            })
            .select()
            .single();
          
          if (yearError) {
            console.error('Failed to create academic year:', yearError);
            failedCount += rows.length;
            continue;
          }
          academicYear = newYear;
        }

        // Find or create term
        let term = academicYear.terms?.find((t: any) => 
          t.name.toLowerCase() === termName.toLowerCase()
        );
        
        if (!term) {
          const { data: newTerm, error: termError } = await supabase
            .from('terms')
            .insert({
              institution_id: institutionId,
              academic_year_id: academicYear.id,
              name: termName,
              start_date: academicYear.start_date,
              end_date: academicYear.end_date,
              sequence_order: 1,
              is_current: false,
            })
            .select()
            .single();
          
          if (termError) {
            console.error('Failed to create term:', termError);
            failedCount += rows.length;
            continue;
          }
          term = newTerm;
        }

        // Find or create exam
        const { data: existingExams } = await supabase
          .from('exams')
          .select('id')
          .eq('institution_id', institutionId)
          .eq('name', examName)
          .eq('term_id', term.id)
          .limit(1);

        let examId: string;
        
        if (existingExams && existingExams.length > 0) {
          examId = existingExams[0].id;
        } else {
          const { data: newExam, error: examError } = await supabase
            .from('exams')
            .insert({
              institution_id: institutionId,
              academic_year_id: academicYear.id,
              term_id: term.id,
              name: examName,
              exam_type: 'historical',
              start_date: term.start_date,
              end_date: term.end_date,
              status: 'completed',
              max_marks: 100,
            })
            .select()
            .single();
          
          if (examError) {
            console.error('Failed to create exam:', examError);
            failedCount += rows.length;
            continue;
          }
          examId = newExam.id;
        }

        // Insert scores
        for (const row of rows) {
          const student = studentMap.get(row.admission_number.toLowerCase());
          const subject = subjectMap.get(row.subject_code.toLowerCase());

          if (!student || !subject) {
            failedCount++;
            continue;
          }

          const { error: scoreError } = await supabase
            .from('student_scores')
            .insert({
              institution_id: institutionId,
              exam_id: examId,
              student_id: student.id,
              subject_id: subject.id,
              marks: parseFloat(row.marks),
              grade: row.grade || null,
              remarks: row.remarks || null,
              is_historical: true,
              imported_at: new Date().toISOString(),
              source_system: 'csv_import',
            });

          if (scoreError) {
            console.error('Failed to insert score:', scoreError);
            failedCount++;
          } else {
            successCount++;
          }

          processed++;
          setImportProgress(Math.round((processed / validRows.length) * 100));
        }
      }

      // Update import record
      await updateImport.mutateAsync({
        importId: importRecord.id,
        updates: {
          status: failedCount === 0 ? 'completed' : 'completed',
          imported_rows: successCount,
          failed_rows: failedCount,
          imported_at: new Date().toISOString(),
        },
      });

      setImportResults({ success: successCount, failed: failedCount });
      setStep('complete');
      toast.success(`Imported ${successCount} historical grades`);

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Import failed', { description: error.message });
      setStep('preview');
    }
  };

  const downloadTemplate = () => {
    const template = `admission_number,academic_year,term,exam_name,subject_code,marks,grade,remarks
STU001,2024,Term 1,Mid-Term Exam,MATH,85,A,Excellent performance
STU001,2024,Term 1,Mid-Term Exam,ENG,78,B+,Good progress
STU002,2024,Term 1,Mid-Term Exam,MATH,72,B,Needs improvement in algebra`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historical_grades_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowsWithErrors = new Set(validationErrors.map(e => e.row));
  const validRows = parsedData.filter((_, i) => !rowsWithErrors.has(i + 2));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Import Historical Grades
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file containing historical exam results. This allows you to import grades from previous academic years for continuity.
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

              <ImportColumnReference 
                importType="historical_grades"
                dynamicData={{
                  subjects: subjects.map(s => ({ code: s.code || '', name: s.name })),
                }}
              />
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
                <span className="text-green-600">{validRows.length} valid rows will be imported</span>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission #</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 20).map((row, i) => (
                      <TableRow 
                        key={i}
                        className={rowsWithErrors.has(i + 2) ? 'bg-destructive/10' : ''}
                      >
                        <TableCell>{row.admission_number}</TableCell>
                        <TableCell>{row.academic_year}</TableCell>
                        <TableCell>{row.term}</TableCell>
                        <TableCell>{row.exam_name}</TableCell>
                        <TableCell>{row.subject_code}</TableCell>
                        <TableCell>{row.marks}</TableCell>
                        <TableCell>{row.grade || '-'}</TableCell>
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
                Importing historical grades... {importProgress}%
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-4 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="text-lg font-medium">Import Complete</p>
                <p className="text-sm text-muted-foreground">
                  Successfully imported {importResults.success} grades
                  {importResults.failed > 0 && ` (${importResults.failed} failed)`}
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
                Import {validRows.length} Grades
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
