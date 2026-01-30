import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useDefaultGradingScale, getGradeFromMarks, getCBCRubricFallback } from '@/hooks/useGradingScales';
import { useExamDeadlines, type ExamDeadlines } from '@/hooks/useExamDeadlines';
import { ExamDeadlineIndicator } from '@/components/exams/ExamDeadlineIndicator';
import { ArrowLeft, Save, Send, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
}

interface Score {
  id?: string;
  student_id: string;
  marks: number | null;
  grade: string | null;
  remarks: string | null;
  status: string;
}

export default function TeacherExamGrading() {
  const { examId, subjectId, classId } = useParams<{ examId: string; subjectId: string; classId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: staffProfile } = useStaffProfile();
  
  // Fetch configurable grading scale
  const { data: gradingScale } = useDefaultGradingScale(staffProfile?.institution_id || null);
  
  // Fetch institution for curriculum type
  const { data: institution } = useQuery({
    queryKey: ['institution', staffProfile?.institution_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('curriculum')
        .eq('id', staffProfile!.institution_id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!staffProfile?.institution_id,
  });

  const [scores, setScores] = useState<Record<string, Score>>({});
  const [saving, setSaving] = useState(false);

  // Fetch exam details
  const { data: exam, isLoading: loadingExam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId!)
        .single();
      if (error) throw error;
      return data as ExamDeadlines & { 
        id: string; 
        name: string; 
        exam_type: string; 
        max_marks: number | null;
      };
    },
    enabled: !!examId,
  });

  // Calculate deadline status
  const deadlineStatus = useExamDeadlines(exam);

  // Fetch subject details
  const { data: subject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!subjectId,
  });

  // Fetch class details
  const { data: classData } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  // Fetch students in class
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_number')
        .eq('class_id', classId!)
        .eq('status', 'active')
        .order('last_name');
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!classId,
  });

  // Fetch existing scores
  const { data: existingScores = [] } = useQuery({
    queryKey: ['exam-scores', examId, subjectId, classId],
    queryFn: async () => {
      const studentIds = students.map(s => s.id);
      if (studentIds.length === 0) return [];

      const { data, error } = await supabase
        .from('student_scores')
        .select('*')
        .eq('exam_id', examId!)
        .eq('subject_id', subjectId!)
        .in('student_id', studentIds);
      if (error) throw error;
      return data;
    },
    enabled: !!examId && !!subjectId && students.length > 0,
  });

  // Initialize scores from existing data
  useEffect(() => {
    if (students.length > 0) {
      const initialScores: Record<string, Score> = {};
      students.forEach(student => {
        const existing = existingScores.find(s => s.student_id === student.id);
        initialScores[student.id] = {
          id: existing?.id,
          student_id: student.id,
          marks: existing?.marks ?? null,
          grade: existing?.grade ?? null,
          remarks: existing?.remarks ?? null,
          status: existing?.status ?? 'draft',
        };
      });
      setScores(initialScores);
    }
  }, [students, existingScores]);

  // Use configurable grading scale, curriculum fallback, or letter grades
  const calculateGrade = (marks: number, maxMarks: number = 100): string => {
    const percentage = (marks / maxMarks) * 100;
    
    // Priority 1: Use configurable grading scale if available
    if (gradingScale?.grade_levels && gradingScale.grade_levels.length > 0) {
      const result = getGradeFromMarks(percentage, gradingScale.grade_levels);
      return result?.grade || 'N/A';
    }
    
    // Priority 2: CBC rubric fallback for ke_cbc curriculum
    if (institution?.curriculum === 'ke_cbc') {
      const result = getGradeFromMarks(percentage, getCBCRubricFallback());
      return result?.grade || 'BE2';
    }
    
    // Priority 3: Traditional Kenya letter grading
    if (percentage >= 80) return 'A';
    if (percentage >= 75) return 'A-';
    if (percentage >= 70) return 'B+';
    if (percentage >= 65) return 'B';
    if (percentage >= 60) return 'B-';
    if (percentage >= 55) return 'C+';
    if (percentage >= 50) return 'C';
    if (percentage >= 45) return 'C-';
    if (percentage >= 40) return 'D+';
    if (percentage >= 35) return 'D';
    if (percentage >= 30) return 'D-';
    return 'E';
  };

  const handleMarksChange = (studentId: string, value: string) => {
    const maxMarks = exam?.max_marks ?? 100;
    const numValue = value === '' ? null : parseFloat(value);

    if (numValue !== null && numValue > maxMarks) {
      toast.error(`Marks cannot exceed ${maxMarks}`);
      return;
    }

    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: numValue,
        grade: numValue !== null ? calculateGrade(numValue, maxMarks) : null,
      }
    }));
  };

  const saveScores = useMutation({
    mutationFn: async (status: 'draft' | 'submitted') => {
      if (!staffProfile?.institution_id) throw new Error('No institution');

      const scoresToSave = Object.values(scores).filter(s => s.marks !== null);
      
      for (const score of scoresToSave) {
        const scoreData = {
          institution_id: staffProfile.institution_id,
          exam_id: examId!,
          subject_id: subjectId!,
          student_id: score.student_id,
          marks: score.marks,
          grade: score.grade,
          remarks: score.remarks,
          status,
          entered_by: staffProfile.id,
        };

        if (score.id) {
          const { error } = await supabase
            .from('student_scores')
            .update(scoreData)
            .eq('id', score.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('student_scores')
            .insert(scoreData);
          if (error) throw error;
        }
      }
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['exam-scores'] });
      toast.success(status === 'submitted' ? 'Scores submitted for approval' : 'Scores saved as draft');
    },
    onError: () => {
      toast.error('Failed to save scores');
    },
  });

  const handleSave = (status: 'draft' | 'submitted') => {
    // Enforce deadline restrictions
    if (status === 'draft' && !deadlineStatus.canSaveDraft && !deadlineStatus.lateSubmissionAllowed) {
      toast.error('Draft submission period has ended');
      return;
    }
    if (status === 'submitted' && !deadlineStatus.canSubmitFinal && !deadlineStatus.isLateSubmission) {
      toast.error('Submission deadline has passed');
      return;
    }
    
    setSaving(true);
    saveScores.mutate(status, {
      onSettled: () => setSaving(false),
    });
  };

  const isLoading = loadingExam || loadingStudents;
  const enteredCount = Object.values(scores).filter(s => s.marks !== null).length;
  const maxMarks = exam?.max_marks ?? 100;

  if (isLoading) {
    return (
      <PortalLayout title="Loading..." subtitle="">
        <Skeleton className="h-64 w-full" />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout 
      title={`${exam?.name ?? 'Exam'} - Score Entry`}
      subtitle={`${classData?.name ?? 'Class'} • ${subject?.name ?? 'Subject'}`}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={() => navigate('/portal/grades')} className="gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Grades
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={saving || enteredCount === 0 || (!deadlineStatus.canSaveDraft && !deadlineStatus.lateSubmissionAllowed)}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSave('submitted')}
              disabled={saving || enteredCount === 0 || (!deadlineStatus.canSubmitFinal && !deadlineStatus.isLateSubmission)}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Submit for Approval
            </Button>
          </div>
        </div>

        {/* Deadline Status Card */}
        {(exam?.draft_deadline || exam?.correction_deadline || exam?.final_deadline) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Grading Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExamDeadlineIndicator status={deadlineStatus} />
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-medium">Max Marks:</span> {maxMarks}
              </div>
              <div>
                <span className="font-medium">Students:</span> {students.length}
              </div>
              <div>
                <span className="font-medium">Entered:</span> {enteredCount} / {students.length}
              </div>
              <div>
                <span className="font-medium">Exam Type:</span>{' '}
                <Badge variant="outline">{exam?.exam_type}</Badge>
              </div>
              <div>
                <span className="font-medium">Grading Scale:</span>{' '}
                <Badge variant="secondary">{gradingScale?.name || 'Kenya Standard'}</Badge>
              </div>
              {/* Show deadline phase */}
              {(exam?.draft_deadline || exam?.correction_deadline || exam?.final_deadline) && (
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <ExamDeadlineIndicator status={deadlineStatus} compact />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Entry Table */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Scores</CardTitle>
            <CardDescription>
              Enter marks for each student. Use Tab to move between fields quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No students found in this class</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-32">Marks</TableHead>
                    <TableHead className="w-20">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const score = scores[student.id];
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{student.admission_number}</TableCell>
                        <TableCell>{student.first_name} {student.last_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={score?.marks ?? ''}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            min={0}
                            max={maxMarks}
                            className="w-24"
                            placeholder="—"
                          />
                        </TableCell>
                        <TableCell>
                          {score?.grade && (
                            <Badge variant="outline">{score.grade}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
