import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast, differenceInDays } from 'date-fns';

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    description: string | null;
    due_date: string;
    status: string;
    submission_type: string;
    class?: { id: string; name: string; level: string };
    subject?: { id: string; name: string; code: string };
    submission: {
      id: string;
      status: string;
      submitted_by_type: string;
      is_late: boolean;
      file_name: string | null;
      submitted_at: string | null;
    } | null;
  };
  onClick: () => void;
}

export function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
  const dueDate = new Date(assignment.due_date);
  const isOverdue = isPast(dueDate) && !assignment.submission;
  const daysUntilDue = differenceInDays(dueDate, new Date());
  const hasSubmission = !!assignment.submission;

  const getStatusBadge = () => {
    if (assignment.submission?.status === 'graded') {
      return <Badge variant="default" className="bg-green-500">Graded</Badge>;
    }
    if (assignment.submission?.status === 'late') {
      return <Badge variant="secondary" className="bg-orange-500 text-white">Submitted Late</Badge>;
    }
    if (assignment.submission?.status === 'submitted') {
      return <Badge variant="default">Submitted</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (daysUntilDue <= 2 && daysUntilDue >= 0) {
      return <Badge variant="secondary" className="bg-yellow-500 text-white">Due Soon</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const getIcon = () => {
    if (hasSubmission) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (isOverdue) {
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
    return <ClipboardList className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      role="button"
      aria-label={`View assignment: ${assignment.title}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm truncate">{assignment.title}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {assignment.subject?.name} • {assignment.class?.name}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {isOverdue && !hasSubmission
                  ? `Was due ${format(dueDate, 'MMM d, yyyy')}`
                  : `Due ${format(dueDate, 'MMM d, yyyy h:mm a')}`}
              </span>
            </div>
            {assignment.submission?.submitted_by_type === 'parent' && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                Submitted by Parent/Guardian
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
