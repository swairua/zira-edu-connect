import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { ImportColumnReference } from '@/components/imports/ImportColumnReference';
import { IMPORT_DEFINITIONS, generateTemplateCSV } from '@/config/importColumnDefinitions';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { QuestionType, DifficultyLevel, CognitiveLevel, MCQOption } from '@/types/question-bank';

interface BulkQuestionImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParsedQuestion {
  subject_code: string;
  topic: string;
  question_type: QuestionType;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  marks: number;
  difficulty: DifficultyLevel;
  cognitive_level?: CognitiveLevel;
  explanation?: string;
  tags?: string;
}

interface ValidationResult {
  row: number;
  data: ParsedQuestion;
  errors: string[];
  warnings: string[];
}

export function BulkQuestionImportDialog({ open, onOpenChange, onSuccess }: BulkQuestionImportDialogProps) {
  const { institution } = useInstitution();
  const { data: profile } = useStaffProfile();
  const { data: subjects = [] } = useSubjects(institution?.id || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });

  const subjectCodeMap = new Map(subjects.map(s => [s.code?.toUpperCase(), s.id]));

  const validateRow = (row: Record<string, string>, rowIndex: number): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!row.subject_code) errors.push('Subject code is required');
    if (!row.topic) errors.push('Topic is required');
    if (!row.question_type) errors.push('Question type is required');
    if (!row.question_text) errors.push('Question text is required');
    if (!row.marks) errors.push('Marks is required');
    if (!row.difficulty) errors.push('Difficulty is required');

    // Validate subject code exists
    const subjectCode = row.subject_code?.toUpperCase();
    if (subjectCode && !subjectCodeMap.has(subjectCode)) {
      errors.push(`Subject code "${row.subject_code}" not found. Valid: ${subjects.map(s => s.code).join(', ')}`);
    }

    // Validate question type
    const validTypes = ['multiple_choice', 'short_answer', 'long_answer', 'fill_blank', 'true_false', 'matching'];
    if (row.question_type && !validTypes.includes(row.question_type)) {
      errors.push(`Invalid question type. Valid: ${validTypes.join(', ')}`);
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (row.difficulty && !validDifficulties.includes(row.difficulty)) {
      errors.push(`Invalid difficulty. Valid: ${validDifficulties.join(', ')}`);
    }

    // Validate cognitive level if provided
    const validCognitive = ['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'];
    if (row.cognitive_level && !validCognitive.includes(row.cognitive_level)) {
      warnings.push(`Invalid cognitive level. Using default.`);
    }

    // Validate MCQ has options
    if (row.question_type === 'multiple_choice') {
      if (!row.option_a || !row.option_b) {
        errors.push('MCQ requires at least options A and B');
      }
      if (!row.correct_answer || !['A', 'B', 'C', 'D'].includes(row.correct_answer.toUpperCase())) {
        errors.push('MCQ correct answer must be A, B, C, or D');
      }
    }

    // Validate marks is a number
    const marks = parseInt(row.marks);
    if (isNaN(marks) || marks < 1) {
      errors.push('Marks must be a positive number');
    }

    return {
      row: rowIndex + 2, // +2 for 1-indexed and header row
      data: {
        subject_code: row.subject_code || '',
        topic: row.topic || '',
        question_type: row.question_type as QuestionType,
        question_text: row.question_text || '',
        option_a: row.option_a,
        option_b: row.option_b,
        option_c: row.option_c,
        option_d: row.option_d,
        correct_answer: row.correct_answer || '',
        marks: parseInt(row.marks) || 1,
        difficulty: (row.difficulty as DifficultyLevel) || 'medium',
        cognitive_level: validCognitive.includes(row.cognitive_level) ? row.cognitive_level as CognitiveLevel : 'knowledge',
        explanation: row.explanation,
        tags: row.tags,
      },
      errors,
      warnings,
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validated = results.data.map((row, index) => 
          validateRow(row as Record<string, string>, index)
        );
        setValidationResults(validated);
        setStep('preview');
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (!institution?.id || !profile?.id) return;

    const validRows = validationResults.filter(r => r.errors.length === 0);
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setStep('importing');
    let success = 0;
    let failed = 0;

    for (let i = 0; i < validRows.length; i++) {
      const result = validRows[i];
      const subjectId = subjectCodeMap.get(result.data.subject_code.toUpperCase());

      if (!subjectId) {
        failed++;
        continue;
      }

      // Build options for MCQ
      let options: MCQOption[] | null = null;
      let correctAnswer: string | null = null;

      if (result.data.question_type === 'multiple_choice') {
        const optionLabels = ['A', 'B', 'C', 'D'];
        const optionValues = [result.data.option_a, result.data.option_b, result.data.option_c, result.data.option_d];
        options = optionLabels
          .map((label, idx) => ({
            label,
            text: optionValues[idx] || '',
            is_correct: result.data.correct_answer.toUpperCase() === label,
          }))
          .filter(opt => opt.text);
      } else {
        correctAnswer = result.data.correct_answer;
      }

      // Parse tags
      const tags = result.data.tags?.split(';').map(t => t.trim()).filter(Boolean) || [];

      const { error } = await supabase.from('question_bank').insert({
        institution_id: institution.id,
        subject_id: subjectId,
        topic: result.data.topic,
        question_type: result.data.question_type,
        question_text: result.data.question_text,
        options: options as unknown as null,
        correct_answer: correctAnswer,
        marks: result.data.marks,
        difficulty: result.data.difficulty,
        cognitive_level: result.data.cognitive_level || 'knowledge',
        explanation: result.data.explanation || null,
        tags,
        created_by: profile.id,
        is_active: true,
      });

      if (error) {
        console.error('Insert error:', error);
        failed++;
      } else {
        success++;
      }

      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImportStats({ success, failed });
    setStep('complete');
  };

  const handleDownloadTemplate = () => {
    const csv = generateTemplateCSV('questions');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_bank_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStep('upload');
    setValidationResults([]);
    setImportProgress(0);
    setImportStats({ success: 0, failed: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
    onOpenChange(false);
    if (step === 'complete' && importStats.success > 0) {
      onSuccess();
    }
  };

  const validCount = validationResults.filter(r => r.errors.length === 0).length;
  const errorCount = validationResults.filter(r => r.errors.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Import Questions from CSV'}
            {step === 'preview' && 'Preview Import'}
            {step === 'importing' && 'Importing Questions...'}
            {step === 'complete' && 'Import Complete'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {step === 'upload' && (
            <div className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Upload a CSV file with questions. Download the template for the correct format.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium">Click to upload CSV file</p>
                <p className="text-sm text-muted-foreground">or drag and drop</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />

              <ImportColumnReference importType="questions" />
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Badge variant="secondary" className="text-base">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                  {validCount} valid
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive" className="text-base">
                    <XCircle className="h-4 w-4 mr-1" />
                    {errorCount} with errors
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-2">
                  {validationResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-sm ${
                        result.errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="font-medium">Row {result.row}:</span>{' '}
                          <span className="text-muted-foreground truncate">
                            {result.data.question_text?.slice(0, 60)}...
                          </span>
                        </div>
                        {result.errors.length > 0 ? (
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      {result.errors.length > 0 && (
                        <ul className="mt-1 text-red-600 text-xs list-disc list-inside">
                          {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                      )}
                      {result.warnings.length > 0 && (
                        <ul className="mt-1 text-yellow-600 text-xs list-disc list-inside">
                          {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {step === 'importing' && (
            <div className="space-y-4 py-8">
              <Progress value={importProgress} className="w-full" />
              <p className="text-center text-muted-foreground">
                Importing questions... {importProgress}%
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="py-8 text-center space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <div>
                <p className="text-lg font-semibold">Import Complete!</p>
                <p className="text-muted-foreground">
                  Successfully imported {importStats.success} question(s)
                </p>
                {importStats.failed > 0 && (
                  <p className="text-red-500">
                    {importStats.failed} question(s) failed to import
                  </p>
                )}
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
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Import {validCount} Question(s)
              </Button>
            </>
          )}
          {step === 'complete' && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}