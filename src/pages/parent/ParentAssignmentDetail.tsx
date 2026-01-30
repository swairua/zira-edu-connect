import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, FileText, Send, AlertCircle } from 'lucide-react';
import { ParentLayout } from '@/components/parent/ParentLayout';
import { useParent } from '@/contexts/ParentContext';
import { useAssignment } from '@/hooks/useAssignments';
import { useStudentSubmission, useSubmitAssignment } from '@/hooks/useAssignmentSubmissions';
import { useAssignmentSettings } from '@/hooks/useInstitutionSettings';
import { NoStudentLinked } from '@/components/parent/NoStudentLinked';
import { ErrorCard } from '@/components/parent/ErrorCard';
import { FileUploader } from '@/components/parent/FileUploader';
import { SubmissionConfirmation } from '@/components/parent/SubmissionConfirmation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, isPast } from 'date-fns';

export default function ParentAssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedStudent, isLoading: parentLoading, parentProfile, isParent } = useParent();
  
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: assignment, isLoading: assignmentLoading, error: assignmentError, refetch } = useAssignment(id);
  const { data: submission, isLoading: submissionLoading } = useStudentSubmission(id, selectedStudent?.id);
  const { data: assignmentSettings } = useAssignmentSettings(parentProfile?.institution_id);
  const submitMutation = useSubmitAssignment();

  const isLoading = parentLoading || assignmentLoading || submissionLoading;
  const dueDate = assignment ? new Date(assignment.due_date) : null;
  const isOverdue = dueDate ? isPast(dueDate) : false;
  const canSubmit = assignment && 
    assignment.status === 'published' && 
    (!isOverdue || assignment.allow_late_submission) &&
    (!submission || (assignment.allow_resubmission && submission.status !== 'graded'));

  // Check if parent can submit (based on institution settings)
  const parentCanSubmit = isParent && assignmentSettings?.allow_parent_submission;

  const handleSubmit = async () => {
    if (!assignment || !selectedStudent || !parentProfile?.institution_id) return;

    // Determine submission type based on what's provided
    const submissionType = selectedFile ? 'file' : 'text';
    
    if (submissionType === 'text' && !textContent.trim()) {
      return;
    }
    if (submissionType === 'file' && !selectedFile) {
      return;
    }

    await submitMutation.mutateAsync({
      assignment_id: assignment.id,
      student_id: selectedStudent.id,
      institution_id: parentProfile.institution_id,
      submission_type: submissionType,
      text_content: textContent || undefined,
      file: selectedFile || undefined,
      is_parent_submission: isParent,
      parent_id: isParent ? parentProfile.id : undefined,
    });

    setShowConfirmation(true);
  };

  if (isLoading) {
    return (
      <ParentLayout title="Assignment Details">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </ParentLayout>
    );
  }

  if (!selectedStudent) {
    return (
      <ParentLayout title="Assignment Details">
        <div className="p-4">
          <NoStudentLinked />
        </div>
      </ParentLayout>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <ParentLayout title="Assignment Details">
        <div className="p-4">
          <ErrorCard 
            title="Failed to load assignment" 
            message="We couldn't fetch this assignment. Please try again."
            onRetry={refetch}
          />
        </div>
      </ParentLayout>
    );
  }

  // Show confirmation if just submitted
  if (showConfirmation && submission) {
    return (
      <ParentLayout title="Assignment Details">
        <div className="p-4">
          <SubmissionConfirmation
            submittedAt={submission.submitted_at || submission.created_at}
            submittedByType={submission.submitted_by_type}
            fileName={submission.file_name}
            isLate={submission.is_late}
            onViewAssignments={() => navigate('/parent/assignments')}
          />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout title="Assignment Details">
      <div className="p-4 space-y-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/parent/assignments')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>

        {/* Assignment Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <CardDescription className="mt-1">
                  {assignment.subject?.name} • {assignment.class?.name}
                </CardDescription>
              </div>
              {submission ? (
                <Badge variant={submission.is_late ? 'secondary' : 'default'} className={submission.is_late ? 'bg-orange-500' : ''}>
                  {submission.is_late ? 'Submitted Late' : 'Submitted'}
                </Badge>
              ) : isOverdue ? (
                <Badge variant="destructive">Overdue</Badge>
              ) : (
                <Badge variant="outline">Pending</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Due Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={isOverdue ? 'text-destructive' : ''}>
                Due: {dueDate ? format(dueDate, 'EEEE, MMMM d, yyyy h:mm a') : 'N/A'}
              </span>
            </div>

            {/* Description */}
            {assignment.description && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Instructions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            )}

            {/* Submission Info */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {assignment.submission_type === 'both' 
                  ? 'File or Text' 
                  : assignment.submission_type === 'file' 
                    ? 'File Upload' 
                    : 'Text Only'}
              </span>
              {assignment.allowed_file_types && (
                <span>
                  Allowed: {assignment.allowed_file_types.join(', ').toUpperCase()}
                </span>
              )}
              <span>Max: {assignment.max_file_size_mb}MB</span>
            </div>
          </CardContent>
        </Card>

        {/* Existing Submission */}
        {submission && (
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Your Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                Submitted: {submission.submitted_at ? format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a') : 'N/A'}
              </p>
              {submission.file_name && (
                <p>File: {submission.file_name}</p>
              )}
              {submission.text_content && (
                <div>
                  <p className="font-medium">Response:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{submission.text_content}</p>
                </div>
              )}
              {submission.submitted_by_type === 'parent' && (
                <p className="text-xs italic text-muted-foreground">
                  Submitted by Parent/Guardian
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submission Form */}
        {canSubmit && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {submission ? 'Resubmit Assignment' : 'Submit Assignment'}
              </CardTitle>
              {isParent && (
                <CardDescription className="text-xs">
                  Submitting on behalf of {selectedStudent.first_name} {selectedStudent.last_name}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parent Submission Notice */}
              {isParent && parentCanSubmit && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This submission will be marked as "Submitted by Parent/Guardian" and visible to the teacher.
                  </AlertDescription>
                </Alert>
              )}

              {/* Parent Cannot Submit Warning */}
              {isParent && !parentCanSubmit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Parent/guardian submissions are not enabled for this school. Only the student can submit assignments.
                  </AlertDescription>
                </Alert>
              )}

              {/* Late Submission Warning */}
              {isOverdue && assignment.allow_late_submission && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This assignment is past due. Your submission will be marked as late.
                  </AlertDescription>
                </Alert>
              )}

              {/* File Upload */}
              {(assignment.submission_type === 'file' || assignment.submission_type === 'both') && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Upload File</label>
                  <FileUploader
                    allowedTypes={assignment.allowed_file_types || ['pdf', 'docx']}
                    maxSizeMb={assignment.max_file_size_mb || 10}
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                    disabled={isParent && !parentCanSubmit}
                  />
                </div>
              )}

              {/* Text Input */}
              {(assignment.submission_type === 'text' || assignment.submission_type === 'both') && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Written Response</label>
                  <Textarea
                    placeholder="Type your response here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={6}
                    disabled={isParent && !parentCanSubmit}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={
                  submitMutation.isPending || 
                  (isParent && !parentCanSubmit) ||
                  (!selectedFile && !textContent.trim())
                }
              >
                {submitMutation.isPending ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cannot Submit Message */}
        {!canSubmit && !submission && (
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {isOverdue && !assignment.allow_late_submission
                  ? 'This assignment is past due and no longer accepting submissions.'
                  : 'This assignment is not accepting submissions.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentLayout>
  );
}
