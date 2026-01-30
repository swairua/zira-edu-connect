import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useAssignmentForGrading, 
  useSubmissionsToGrade, 
  useGradeSubmission,
  useBulkGradeSubmissions
} from '@/hooks/useTeacherGrading';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { getGradeFromMarks, getCBCRubricFallback, useDefaultGradingScale } from '@/hooks/useGradingScales';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, Send, CheckCircle2, Clock, AlertCircle, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface GradeEntry {
  submissionId: string;
  studentId: string;
  marks: string;
  feedback: string;
  isDirty: boolean;
}

export default function TeacherAssignmentGrading() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: staffProfile } = useStaffProfile();
  const { data: assignment, isLoading: loadingAssignment } = useAssignmentForGrading(id!);
  const { data: submissions = [], isLoading: loadingSubmissions } = useSubmissionsToGrade(id!);
  const gradeSubmission = useGradeSubmission();
  const bulkGrade = useBulkGradeSubmissions(staffProfile?.institution_id ?? null);
  
  // Fetch configurable grading scale
  const { data: gradingScale } = useDefaultGradingScale(staffProfile?.institution_id || null);
  
  // Fetch institution for curriculum type
  const { data: institution } = useQuery({
    queryKey: ['institution-curriculum', staffProfile?.institution_id],
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

  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [activeTab, setActiveTab] = useState('pending');
  const [saving, setSaving] = useState(false);

  // Initialize grades from submissions
  useEffect(() => {
    if (submissions.length > 0) {
      const initialGrades: Record<string, GradeEntry> = {};
      submissions.forEach(sub => {
        initialGrades[sub.id] = {
          submissionId: sub.id,
          studentId: sub.student_id,
          marks: sub.marks?.toString() ?? '',
          feedback: sub.feedback ?? '',
          isDirty: false,
        };
      });
      setGrades(initialGrades);
    }
  }, [submissions]);

  const calculateGrade = useCallback((marks: number, maxMarks: number) => {
    if (!assignment?.institution_id) return '';
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
  }, [assignment, gradingScale, institution]);

  const handleMarksChange = (submissionId: string, value: string) => {
    const maxMarks = assignment?.total_marks ?? 100;
    const numValue = parseFloat(value);
    
    // Validate marks don't exceed maximum
    if (!isNaN(numValue) && numValue > maxMarks) {
      toast.error(`Marks cannot exceed ${maxMarks}`);
      return;
    }

    setGrades(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        marks: value,
        isDirty: true,
      }
    }));
  };

  const handleFeedbackChange = (submissionId: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        feedback: value,
        isDirty: true,
      }
    }));
  };

  const handleSaveGrade = async (submissionId: string, status: 'draft' | 'submitted' = 'draft') => {
    const grade = grades[submissionId];
    if (!grade) return;

    const marks = parseFloat(grade.marks);
    if (isNaN(marks)) {
      toast.error('Please enter valid marks');
      return;
    }

    const maxMarks = assignment?.total_marks ?? 100;
    const calculatedGrade = calculateGrade(marks, maxMarks);

    try {
      await gradeSubmission.mutateAsync({
        submissionId,
        marks,
        feedback: grade.feedback || undefined,
        isDraft: status === 'draft',
      });

      setGrades(prev => ({
        ...prev,
        [submissionId]: { ...prev[submissionId], isDirty: false }
      }));

      toast.success(status === 'submitted' ? 'Grade submitted' : 'Grade saved as draft');
    } catch (error) {
      toast.error('Failed to save grade');
    }
  };

  const handleBulkSubmit = async () => {
    const dirtyGrades = Object.values(grades).filter(g => g.marks !== '');
    if (dirtyGrades.length === 0) {
      toast.error('No grades to submit');
      return;
    }

    setSaving(true);
    try {
      const maxMarks = assignment?.total_marks ?? 100;
      const gradesToSubmit = dirtyGrades.map(g => ({
        submissionId: g.submissionId,
        studentId: g.studentId,
        marks: parseFloat(g.marks),
        feedback: g.feedback || undefined,
      }));

      await bulkGrade.mutateAsync({
        assignmentId: id!,
        grades: gradesToSubmit,
        submitForApproval: true,
      });
      toast.success(`${gradesToSubmit.length} grades submitted for approval`);
    } catch (error) {
      toast.error('Failed to submit grades');
    } finally {
      setSaving(false);
    }
  };

  const pendingSubmissions = submissions.filter(s => 
    s.grading_status === 'pending' || !s.grading_status
  );
  const draftSubmissions = submissions.filter(s => s.grading_status === 'draft');
  const gradedSubmissions = submissions.filter(s => 
    s.grading_status === 'submitted' || s.grading_status === 'approved'
  );

  const isLoading = loadingAssignment || loadingSubmissions;

  if (isLoading) {
    return (
      <PortalLayout title="Loading..." subtitle="">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PortalLayout>
    );
  }

  if (!assignment) {
    return (
      <PortalLayout title="Assignment Not Found" subtitle="">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">This assignment doesn't exist or you don't have access.</p>
            <Button onClick={() => navigate('/portal/assignments')} className="mt-4">
              Back to Assignments
            </Button>
          </CardContent>
        </Card>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout 
      title={assignment.title} 
      subtitle={`${assignment.class?.name} • ${assignment.subject?.name}`}
    >
      <div className="space-y-6">
        {/* Back Button & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={() => navigate('/portal/assignments')} className="gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </Button>
          <Button 
            onClick={handleBulkSubmit} 
            disabled={saving || Object.values(grades).every(g => !g.marks)}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Submit All for Approval
          </Button>
        </div>

        {/* Assignment Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Due Date:</span>
                <span>{format(new Date(assignment.due_date), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Max Marks:</span>
                <span>{assignment.total_marks ?? 100}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Submissions:</span>
                <span>{submissions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Weight:</span>
                <span>{assignment.weight_percentage ?? 0}%</span>
              </div>
            </div>
            {assignment.description && (
              <p className="mt-4 text-sm text-muted-foreground">{assignment.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Grading Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending ({pendingSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2">
              <Clock className="h-4 w-4" />
              Drafts ({draftSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="graded" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Graded ({gradedSubmissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <GradingList 
              submissions={pendingSubmissions}
              grades={grades}
              maxMarks={assignment.total_marks ?? 100}
              onMarksChange={handleMarksChange}
              onFeedbackChange={handleFeedbackChange}
              onSave={handleSaveGrade}
              calculateGrade={calculateGrade}
            />
          </TabsContent>

          <TabsContent value="drafts" className="mt-4">
            <GradingList 
              submissions={draftSubmissions}
              grades={grades}
              maxMarks={assignment.total_marks ?? 100}
              onMarksChange={handleMarksChange}
              onFeedbackChange={handleFeedbackChange}
              onSave={handleSaveGrade}
              calculateGrade={calculateGrade}
            />
          </TabsContent>

          <TabsContent value="graded" className="mt-4">
            <GradingList 
              submissions={gradedSubmissions}
              grades={grades}
              maxMarks={assignment.total_marks ?? 100}
              onMarksChange={handleMarksChange}
              onFeedbackChange={handleFeedbackChange}
              onSave={handleSaveGrade}
              calculateGrade={calculateGrade}
              readOnly
            />
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}

interface GradingListProps {
  submissions: any[];
  grades: Record<string, GradeEntry>;
  maxMarks: number;
  onMarksChange: (id: string, value: string) => void;
  onFeedbackChange: (id: string, value: string) => void;
  onSave: (id: string, status?: 'draft' | 'submitted') => void;
  calculateGrade: (marks: number, maxMarks: number) => string;
  readOnly?: boolean;
}

function GradingList({ 
  submissions, 
  grades, 
  maxMarks, 
  onMarksChange, 
  onFeedbackChange, 
  onSave,
  calculateGrade,
  readOnly = false 
}: GradingListProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No submissions in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map(submission => {
        const grade = grades[submission.id];
        const currentMarks = parseFloat(grade?.marks ?? '');
        const calculatedGrade = !isNaN(currentMarks) ? calculateGrade(currentMarks, maxMarks) : '';

        return (
          <Card key={submission.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                {/* Student Info */}
                <div className="flex items-center gap-3 lg:w-48">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {submission.student?.first_name} {submission.student?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.student?.admission_number}
                    </p>
                  </div>
                </div>

                {/* Submission Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>Submitted: {submission.submitted_at 
                      ? format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')
                      : 'Not submitted'
                    }</span>
                    {submission.is_late && <Badge variant="destructive">Late</Badge>}
                    {submission.file_url && (
                      <a 
                        href={submission.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View File
                      </a>
                    )}
                  </div>
                  {submission.text_content && (
                    <p className="text-sm rounded-md bg-muted p-3">{submission.text_content}</p>
                  )}
                </div>

                {/* Grading Input */}
                <div className="flex flex-col gap-3 lg:w-64">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Marks"
                      value={grade?.marks ?? ''}
                      onChange={(e) => onMarksChange(submission.id, e.target.value)}
                      className="w-24"
                      disabled={readOnly}
                      min={0}
                      max={maxMarks}
                    />
                    <span className="text-sm text-muted-foreground">/ {maxMarks}</span>
                    {calculatedGrade && (
                      <Badge variant="outline" className="ml-2">{calculatedGrade}</Badge>
                    )}
                  </div>
                  <Textarea
                    placeholder="Feedback (optional)"
                    value={grade?.feedback ?? ''}
                    onChange={(e) => onFeedbackChange(submission.id, e.target.value)}
                    className="min-h-[60px]"
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSave(submission.id, 'draft')}
                        disabled={!grade?.isDirty}
                        className="flex-1"
                      >
                        <Save className="mr-1 h-3 w-3" />
                        Save Draft
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onSave(submission.id, 'submitted')}
                        disabled={!grade?.marks}
                        className="flex-1"
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Submit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
