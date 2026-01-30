import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useExamSubmissionProgress, ExamSubmissionProgress as ProgressData } from '@/hooks/useExamSubmissionProgress';
import { useExamDeadlines, type ExamPhase } from '@/hooks/useExamDeadlines';
import { Bell, ChevronDown, ChevronUp, Clock, CheckCircle2, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExamSubmissionProgressProps {
  institutionId: string;
}

function DeadlineBadge({ deadline, label }: { deadline: string | null; label: string }) {
  if (!deadline) return null;

  const date = parseISO(deadline);
  const isOverdue = isPast(date);
  const timeRemaining = formatDistanceToNow(date, { addSuffix: true });

  return (
    <Badge variant={isOverdue ? 'destructive' : 'outline'} className="text-xs">
      {label}: {timeRemaining}
    </Badge>
  );
}

function PhaseBadge({ phase }: { phase: ExamPhase }) {
  const config: Record<ExamPhase, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    before_exam: { label: 'Upcoming', variant: 'secondary' },
    exam_ongoing: { label: 'Exam In Progress', variant: 'default' },
    draft: { label: 'Draft Phase', variant: 'default' },
    correction: { label: 'Correction Phase', variant: 'secondary' },
    final: { label: 'Final Submission', variant: 'outline' },
    closed: { label: 'Closed', variant: 'destructive' },
  };

  const { label, variant } = config[phase];
  return <Badge variant={variant}>{label}</Badge>;
}

function ExamProgressCard({ exam }: { exam: ProgressData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const deadlineStatus = useExamDeadlines({
    end_date: null,
    draft_deadline: exam.draftDeadline,
    correction_deadline: exam.correctionDeadline,
    final_deadline: exam.finalDeadline,
    allow_late_submission: false,
    late_submission_penalty_percent: null,
  });

  const pendingTeachers = exam.subjects.filter(s => !s.hasSubmitted);

  const handleSendReminders = async () => {
    setSendingReminder(true);
    try {
      const { error } = await supabase.functions.invoke('process-exam-deadline-reminders', {
        body: { examId: exam.examId },
      });

      if (error) throw error;

      toast.success(`Reminders sent to ${pendingTeachers.length} teacher(s)`);
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast.error('Failed to send reminders');
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                {exam.examName}
                <PhaseBadge phase={deadlineStatus.currentPhase} />
              </CardTitle>
              <CardDescription>{exam.termName || 'No term'}</CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <DeadlineBadge deadline={exam.draftDeadline} label="Draft" />
            <DeadlineBadge deadline={exam.correctionDeadline} label="Correction" />
            <DeadlineBadge deadline={exam.finalDeadline} label="Final" />
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Submission Progress</span>
              <span className="font-medium">
                {exam.completedSubjects}/{exam.totalSubjects} subjects
              </span>
            </div>
            <Progress value={exam.overallProgress} className="h-2" />
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Subject Details</span>
              {pendingTeachers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendReminders}
                  disabled={sendingReminder}
                >
                  {sendingReminder ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  Send Reminders ({pendingTeachers.length})
                </Button>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Scores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exam.subjects.map((subject) => (
                  <TableRow key={subject.subjectId}>
                    <TableCell className="font-medium">{subject.subjectName}</TableCell>
                    <TableCell>{subject.teacherName || 'Not assigned'}</TableCell>
                    <TableCell className="text-center">
                      {subject.hasSubmitted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {subject.submittedScores}/{subject.totalStudents}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function ExamSubmissionProgress({ institutionId }: ExamSubmissionProgressProps) {
  const { data: exams, isLoading } = useExamSubmissionProgress(institutionId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Exam Submission Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No exams with configured deadlines found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const examsWithPending = exams.filter(e => e.completedSubjects < e.totalSubjects);
  const completedExams = exams.filter(e => e.completedSubjects === e.totalSubjects);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Exam Submission Progress
              </CardTitle>
              <CardDescription>
                Monitor teacher score submissions and send reminders
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {examsWithPending.length} pending
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {examsWithPending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Pending Submissions
          </h3>
          {examsWithPending.map((exam) => (
            <ExamProgressCard key={exam.examId} exam={exam} />
          ))}
        </div>
      )}

      {completedExams.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Completed
          </h3>
          {completedExams.map((exam) => (
            <ExamProgressCard key={exam.examId} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}
