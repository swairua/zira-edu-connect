import { format } from 'date-fns';
import { Calendar, Clock, BookOpen, User, CheckCircle, XCircle, Edit, Copy, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LessonPlanStatus, lessonPlanStatusLabels, lessonPlanStatusVariants } from '@/types/lesson-plans';
import { cn } from '@/lib/utils';

// Flexible type for lesson plan display - works with both raw DB rows and typed LessonPlan
interface LessonPlanDisplay {
  id: string;
  topic: string;
  sub_topic?: string | null;
  status: LessonPlanStatus;
  lesson_date: string;
  duration_minutes: number;
  week_number?: number | null;
  lesson_objectives?: unknown;
  rejection_reason?: string | null;
  subject?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
  strand?: { strand_number: number; name: string } | null;
  sub_strand?: { sub_strand_number: number; name: string } | null;
  teacher?: { first_name: string; last_name: string } | null;
}

interface LessonPlanCardProps {
  plan: LessonPlanDisplay;
  onEdit?: () => void;
  onClone?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onView?: () => void;
  showActions?: boolean;
  isTeacher?: boolean;
}

export function LessonPlanCard({
  plan,
  onEdit,
  onClone,
  onDelete,
  onSubmit,
  onView,
  showActions = true,
  isTeacher = true,
}: LessonPlanCardProps) {
  const canEdit = plan.status === 'draft' || plan.status === 'rejected' || plan.status === 'revised';
  const canSubmit = plan.status === 'draft' || plan.status === 'revised';

  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        plan.status === 'approved' && 'border-l-4 border-l-green-500',
        plan.status === 'rejected' && 'border-l-4 border-l-red-500',
        plan.status === 'submitted' && 'border-l-4 border-l-yellow-500'
      )}
      onClick={onView}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{plan.topic}</h3>
            {plan.sub_topic && (
              <p className="text-sm text-muted-foreground truncate">{plan.sub_topic}</p>
            )}
          </div>
          <Badge variant={lessonPlanStatusVariants[plan.status] as any}>
            {lessonPlanStatusLabels[plan.status]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(plan.lesson_date), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {plan.duration_minutes} min
          </span>
          {plan.week_number && (
            <span className="flex items-center gap-1">
              Week {plan.week_number}
            </span>
          )}
        </div>

        {/* Subject and Class */}
        <div className="flex flex-wrap gap-2">
          {plan.subject && (
            <Badge variant="outline" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              {plan.subject.name}
            </Badge>
          )}
          {plan.class && (
            <Badge variant="secondary" className="text-xs">
              {plan.class.name}
            </Badge>
          )}
        </div>

        {/* CBC Strand */}
        {plan.strand && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Strand:</span> {plan.strand.strand_number}. {plan.strand.name}
            {plan.sub_strand && (
              <span className="ml-1">
                → {plan.sub_strand.sub_strand_number}. {plan.sub_strand.name}
              </span>
            )}
          </div>
        )}

        {/* Objectives preview */}
        {plan.lesson_objectives && Array.isArray(plan.lesson_objectives) && (plan.lesson_objectives as string[]).length > 0 && (
          <div className="text-xs">
            <span className="font-medium text-muted-foreground">Objectives:</span>
            <ul className="list-disc list-inside mt-0.5 text-muted-foreground">
              {(plan.lesson_objectives as string[]).slice(0, 2).map((obj, i) => (
                <li key={i} className="truncate">{obj}</li>
              ))}
              {(plan.lesson_objectives as string[]).length > 2 && (
                <li className="italic">+{(plan.lesson_objectives as string[]).length - 2} more...</li>
              )}
            </ul>
          </div>
        )}

        {/* Teacher info (for admin view) */}
        {!isTeacher && plan.teacher && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t">
            <User className="h-3 w-3" />
            {plan.teacher.first_name} {plan.teacher.last_name}
          </div>
        )}

        {/* Rejection reason */}
        {plan.status === 'rejected' && plan.rejection_reason && (
          <div className="p-2 bg-destructive/10 rounded text-xs text-destructive">
            <XCircle className="h-3 w-3 inline mr-1" />
            {plan.rejection_reason}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
            {canSubmit && onSubmit && (
              <Button size="sm" variant="default" onClick={onSubmit} className="flex-1">
                <Send className="h-3.5 w-3.5 mr-1" />
                Submit
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onClone && (
                  <DropdownMenuItem onClick={onClone}>
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {canEdit && onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
