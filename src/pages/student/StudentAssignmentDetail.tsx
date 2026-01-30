import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudentLayout } from '@/components/student/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/parent/FileUploader';
import { SubmissionConfirmation } from '@/components/parent/SubmissionConfirmation';
import { useStudent } from '@/contexts/StudentContext';
import { useStudentAssignments } from '@/hooks/useStudentData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, BookOpen, Clock, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { format, isPast } from 'date-fns';

export default function StudentAssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { studentProfile } = useStudent();
  const { data: assignments = [], refetch } = useStudentAssignments();
  
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string>('');

  const assignment = assignments.find(a => a.id === id);

  if (!assignment) {
    return (
      <StudentLayout title="Assignment">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Assignment not found</h2>
          <Button onClick={() => navigate('/student/assignments')} className="mt-4">
            Back to Assignments
          </Button>
        </div>
      </StudentLayout>
    );
  }

  const isOverdue = isPast(new Date(assignment.due_date));
  const canSubmit = !assignment.submission || assignment.allow_resubmission;
  const canSubmitLate = assignment.allow_late_submission && isOverdue;

  const handleSubmit = async () => {
    if (!studentProfile) return;

    const isTextSubmission = assignment.submission_type === 'text' || assignment.submission_type === 'both';
    const isFileSubmission = assignment.submission_type === 'file' || assignment.submission_type === 'both';

    // Validate submission
    if (isTextSubmission && !isFileSubmission && !textContent.trim()) {
      toast({ variant: 'destructive', title: 'Please enter your response' });
      return;
    }
    if (isFileSubmission && !isTextSubmission && !selectedFile) {
      toast({ variant: 'destructive', title: 'Please upload a file' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use edge function for OTP students (no Supabase Auth session)
      const token = localStorage.getItem('student_session_token');
      
      if (token) {
        // OTP-authenticated student - use edge function
        const { data, error } = await supabase.functions.invoke('student-data-api', {
          headers: { Authorization: `Bearer ${token}` },
          body: {
            type: 'submit-assignment',
            params: {
              assignmentId: assignment.id,
              textContent: textContent || null,
              fileName: selectedFile?.name || null,
              fileSizeBytes: selectedFile?.size || null,
              isLate: isOverdue,
            },
          },
        });

        if (error || data?.error) {
          throw new Error(data?.error || error?.message || 'Submission failed');
        }

        setSubmittedAt(data.data.submittedAt);
      } else {
        // Supabase Auth student - direct query
        const now = new Date().toISOString();
        const submissionData = {
          assignment_id: assignment.id,
          student_id: studentProfile.id,
          institution_id: studentProfile.institution_id,
          submission_type: selectedFile ? 'file' : 'text',
          text_content: textContent || null,
          file_url: null,
          file_name: selectedFile?.name || null,
          file_size_bytes: selectedFile?.size || null,
          is_late: isOverdue,
          submitted_by_type: 'student',
          submitted_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'submitted',
          submitted_at: now,
        };

        if (assignment.submission) {
          const { error } = await supabase
            .from('assignment_submissions')
            .update(submissionData)
            .eq('id', assignment.submission.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('assignment_submissions')
            .insert(submissionData);
          if (error) throw error;
        }

        setSubmittedAt(now);
      }

      setShowConfirmation(true);
      refetch();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <StudentLayout title="Submission Confirmed">
        <SubmissionConfirmation
          submittedAt={submittedAt}
          submittedByType="student"
          fileName={selectedFile?.name}
          isLate={isOverdue}
          onViewAssignments={() => navigate('/student/assignments')}
        />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Assignment Details">
      <div className="space-y-4 p-4">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/student/assignments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>

        {/* Assignment Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <CardDescription className="mt-1">
                  {assignment.subject?.name}
                </CardDescription>
              </div>
              {assignment.submission ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Submitted
                </Badge>
              ) : isOverdue ? (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              ) : (
                <Badge variant="outline">Pending</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Due Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Due: {format(new Date(assignment.due_date), 'EEEE, dd MMMM yyyy')}</span>
            </div>

            {/* Description */}
            {assignment.description && (
              <div className="rounded-lg bg-muted p-4">
                <h4 className="text-sm font-medium mb-2">Instructions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            )}

            {/* Submission Type Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>
                Submission: {assignment.submission_type === 'text' ? 'Text response' : 
                  assignment.submission_type === 'file' ? 'File upload' : 'Text or file'}
              </span>
            </div>

            {/* Previous Submission */}
            {assignment.submission && (
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Previous Submission
                </h4>
                <p className="text-xs text-muted-foreground">
                  Submitted {format(new Date(assignment.submission.submitted_at!), 'dd MMM yyyy HH:mm')}
                  {assignment.submission.is_late && ' (Late)'}
                </p>
                {assignment.submission.file_name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    File: {assignment.submission.file_name}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Form */}
        {canSubmit && (isOverdue ? canSubmitLate : true) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {assignment.submission ? 'Resubmit Assignment' : 'Submit Assignment'}
              </CardTitle>
              {isOverdue && canSubmitLate && (
                <CardDescription className="text-destructive">
                  ⚠️ This submission will be marked as late
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Text Input */}
              {(assignment.submission_type === 'text' || assignment.submission_type === 'both') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Response</label>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={6}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* File Upload */}
              {(assignment.submission_type === 'file' || assignment.submission_type === 'both') && (
                <FileUploader
                  allowedTypes={(assignment.allowed_file_types || ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']).map(t => t.replace('.', ''))}
                  maxSizeMb={assignment.max_file_size_mb || 10}
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                  disabled={isSubmitting}
                />
              )}

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : assignment.submission ? (
                  'Resubmit Assignment'
                ) : (
                  'Submit Assignment'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cannot Submit Message */}
        {!canSubmit && (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
              <h3 className="mt-4 font-semibold">Assignment Submitted</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Resubmission is not allowed for this assignment
              </p>
            </CardContent>
          </Card>
        )}

        {isOverdue && !canSubmitLate && !assignment.submission && (
          <Card className="border-destructive">
            <CardContent className="py-8 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <h3 className="mt-4 font-semibold text-destructive">Deadline Passed</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Late submissions are not allowed for this assignment
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
