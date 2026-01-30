import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle2, XCircle, Timer, AlertCircle } from 'lucide-react';
import { type DeadlineStatus, type ExamPhase } from '@/hooks/useExamDeadlines';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExamDeadlineIndicatorProps {
  status: DeadlineStatus;
  compact?: boolean;
}

const phaseColors: Record<ExamPhase, string> = {
  before_exam: 'bg-muted text-muted-foreground',
  exam_ongoing: 'bg-blue-500/10 text-blue-600',
  draft: 'bg-yellow-500/10 text-yellow-600',
  correction: 'bg-orange-500/10 text-orange-600',
  final: 'bg-primary/10 text-primary',
  closed: 'bg-muted text-muted-foreground',
};

const phaseIcons: Record<ExamPhase, React.ReactNode> = {
  before_exam: <Clock className="h-3.5 w-3.5" />,
  exam_ongoing: <Timer className="h-3.5 w-3.5" />,
  draft: <AlertCircle className="h-3.5 w-3.5" />,
  correction: <AlertTriangle className="h-3.5 w-3.5" />,
  final: <CheckCircle2 className="h-3.5 w-3.5" />,
  closed: <XCircle className="h-3.5 w-3.5" />,
};

export function ExamDeadlineIndicator({ status, compact = false }: ExamDeadlineIndicatorProps) {
  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={cn('gap-1', phaseColors[status.currentPhase])}
      >
        {phaseIcons[status.currentPhase]}
        {status.phaseLabel}
        {status.nextDeadline && (
          <span className="ml-1 text-xs opacity-75">
            ({status.timeRemainingShort})
          </span>
        )}
      </Badge>
    );
  }

  return (
    <div className="space-y-3">
      {/* Phase Badge and Time Remaining */}
      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className={cn('gap-1', phaseColors[status.currentPhase])}
        >
          {phaseIcons[status.currentPhase]}
          {status.phaseLabel}
        </Badge>
        {status.nextDeadline && (
          <span className="text-sm text-muted-foreground">
            {status.timeRemaining}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <Progress value={status.phaseProgress} className="h-2" />

      {/* Deadline Details */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className={cn(
          'p-2 rounded-md text-center',
          status.currentPhase === 'draft' ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted'
        )}>
          <div className="font-medium">Draft</div>
          <div className="text-muted-foreground">
            {status.draftDeadline 
              ? format(status.draftDeadline, 'MMM d, HH:mm')
              : '—'}
          </div>
        </div>
        <div className={cn(
          'p-2 rounded-md text-center',
          status.currentPhase === 'correction' ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted'
        )}>
          <div className="font-medium">Correction</div>
          <div className="text-muted-foreground">
            {status.correctionDeadline 
              ? format(status.correctionDeadline, 'MMM d, HH:mm')
              : '—'}
          </div>
        </div>
        <div className={cn(
          'p-2 rounded-md text-center',
          status.currentPhase === 'final' ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted'
        )}>
          <div className="font-medium">Final</div>
          <div className="text-muted-foreground">
            {status.finalDeadline 
              ? format(status.finalDeadline, 'MMM d, HH:mm')
              : '—'}
          </div>
        </div>
      </div>

      {/* Late Submission Alert */}
      {status.isLateSubmission && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Late submission 
            {status.latePenaltyPercent > 0 && (
              <span> — {status.latePenaltyPercent}% penalty will be applied</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Closed Phase Alert */}
      {status.currentPhase === 'closed' && !status.lateSubmissionAllowed && (
        <Alert className="py-2">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Grading period has ended. Contact admin to reopen if needed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
