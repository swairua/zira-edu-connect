import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, CheckCircle, XCircle, Download, RefreshCw } from 'lucide-react';
import { ImportColumnReference } from '@/components/imports/ImportColumnReference';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Question, DifficultyLevel, CognitiveLevel } from '@/types/question-bank';

interface BulkQuestionUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: Question[];
  onSuccess: () => void;
}

interface UpdateRow {
  id: string;
  topic?: string;
  question_text?: string;
  marks?: number;
  difficulty?: DifficultyLevel;
  cognitive_level?: CognitiveLevel;
  explanation?: string;
  is_active?: boolean;
}

interface ValidationResult {
  row: number;
  data: UpdateRow;
  errors: string[];
  originalQuestion?: Question;
}

export function BulkQuestionUpdateDialog({ open, onOpenChange, questions, onSuccess }: BulkQuestionUpdateDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'export' | 'upload' | 'preview' | 'updating' | 'complete'>('export');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStats, setUpdateStats] = useState({ success: 0, failed: 0 });

  const questionMap = new Map(questions.map(q => [q.id, q]));

  const handleExport = () => {
    const exportData = questions.map(q => ({
      id: q.id,
      subject_code: q.subject?.code || '',
      topic: q.topic || '',
      question_type: q.question_type,
      question_text: q.question_text,
      marks: q.marks,
      difficulty: q.difficulty,
      cognitive_level: q.cognitive_level,
      explanation: q.explanation || '',
      is_active: q.is_active ? 'true' : 'false',
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Questions exported! Modify the file and upload to update.');
    setStep('upload');
  };

  const validateRow = (row: Record<string, string>, rowIndex: number): ValidationResult => {
    const errors: string[] = [];

    if (!row.id) {
      errors.push('Question ID is required');
      return { row: rowIndex + 2, data: { id: '' }, errors };
    }

    const originalQuestion = questionMap.get(row.id);
    if (!originalQuestion) {
      errors.push(`Question with ID "${row.id}" not found`);
    }

    // Validate difficulty if provided
    if (row.difficulty && !['easy', 'medium', 'hard'].includes(row.difficulty)) {
      errors.push('Invalid difficulty. Must be: easy, medium, hard');
    }

    // Validate cognitive level if provided
    const validCognitive = ['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'];
    if (row.cognitive_level && !validCognitive.includes(row.cognitive_level)) {
      errors.push('Invalid cognitive level');
    }

    // Validate marks if provided
    if (row.marks && (isNaN(parseInt(row.marks)) || parseInt(row.marks) < 1)) {
      errors.push('Marks must be a positive number');
    }

    return {
      row: rowIndex + 2,
      data: {
        id: row.id,
        topic: row.topic || undefined,
        question_text: row.question_text || undefined,
        marks: row.marks ? parseInt(row.marks) : undefined,
        difficulty: row.difficulty as DifficultyLevel | undefined,
        cognitive_level: row.cognitive_level as CognitiveLevel | undefined,
        explanation: row.explanation || undefined,
        is_active: row.is_active ? row.is_active === 'true' : undefined,
      },
      errors,
      originalQuestion,
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

  const handleUpdate = async () => {
    const validRows = validationResults.filter(r => r.errors.length === 0);
    if (validRows.length === 0) {
      toast.error('No valid rows to update');
      return;
    }

    setStep('updating');
    let success = 0;
    let failed = 0;

    for (let i = 0; i < validRows.length; i++) {
      const result = validRows[i];
      
      // Build update object with only defined values
      const updates: Record<string, unknown> = {};
      if (result.data.topic !== undefined) updates.topic = result.data.topic;
      if (result.data.question_text !== undefined) updates.question_text = result.data.question_text;
      if (result.data.marks !== undefined) updates.marks = result.data.marks;
      if (result.data.difficulty !== undefined) updates.difficulty = result.data.difficulty;
      if (result.data.cognitive_level !== undefined) updates.cognitive_level = result.data.cognitive_level;
      if (result.data.explanation !== undefined) updates.explanation = result.data.explanation;
      if (result.data.is_active !== undefined) updates.is_active = result.data.is_active;

      if (Object.keys(updates).length === 0) {
        // No changes to make
        success++;
        continue;
      }

      const { error } = await supabase
        .from('question_bank')
        .update(updates)
        .eq('id', result.data.id);

      if (error) {
        console.error('Update error:', error);
        failed++;
      } else {
        success++;
      }

      setUpdateProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setUpdateStats({ success, failed });
    setStep('complete');
  };

  const handleClose = () => {
    setStep('export');
    setValidationResults([]);
    setUpdateProgress(0);
    setUpdateStats({ success: 0, failed: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
    onOpenChange(false);
    if (step === 'complete' && updateStats.success > 0) {
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
            {step === 'export' && 'Bulk Update Questions'}
            {step === 'upload' && 'Upload Modified CSV'}
            {step === 'preview' && 'Preview Updates'}
            {step === 'updating' && 'Updating Questions...'}
            {step === 'complete' && 'Update Complete'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {step === 'export' && (
            <div className="space-y-4">
              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  Export your questions to CSV, modify them in a spreadsheet, then reimport to update.
                </AlertDescription>
              </Alert>

              <div className="p-6 border rounded-lg text-center space-y-4">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">{questions.length} questions available for export</p>
                  <p className="text-sm text-muted-foreground">
                    Modify marks, difficulty, topics, and more in your spreadsheet
                  </p>
                </div>
                <Button onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Questions to CSV
                </Button>
              </div>

              <ImportColumnReference importType="question_update" />
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Upload the modified CSV file. Only columns you change will be updated.
                </AlertDescription>
              </Alert>

              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium">Click to upload modified CSV</p>
                <p className="text-sm text-muted-foreground">or drag and drop</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
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
                            {result.originalQuestion?.question_text?.slice(0, 50) || result.data.id}...
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
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {step === 'updating' && (
            <div className="space-y-4 py-8">
              <Progress value={updateProgress} className="w-full" />
              <p className="text-center text-muted-foreground">
                Updating questions... {updateProgress}%
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="py-8 text-center space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <div>
                <p className="text-lg font-semibold">Update Complete!</p>
                <p className="text-muted-foreground">
                  Successfully updated {updateStats.success} question(s)
                </p>
                {updateStats.failed > 0 && (
                  <p className="text-red-500">
                    {updateStats.failed} question(s) failed to update
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          {step === 'export' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={() => setStep('export')}>Back</Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={handleUpdate} disabled={validCount === 0}>
                Update {validCount} Question(s)
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