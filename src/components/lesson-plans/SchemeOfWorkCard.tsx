import { format } from 'date-fns';
import { Calendar, BookOpen, User, Edit, Copy, Trash2, Eye, MoreHorizontal } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SchemeOfWorkDisplay {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  total_weeks: number;
  created_at: string;
  subject?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
  term?: { id: string; name: string } | null;
  teacher?: { first_name: string; last_name: string } | null;
  entries?: any[];
}

interface SchemeOfWorkCardProps {
  scheme: SchemeOfWorkDisplay;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  isTeacher?: boolean;
}

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

export function SchemeOfWorkCard({
  scheme,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  isTeacher = true,
}: SchemeOfWorkCardProps) {
  const canEdit = scheme.status === 'draft';
  const entriesCount = scheme.entries?.length || 0;
  const completedEntries = scheme.entries?.filter((e: any) => e.topic && e.topic.trim() !== '').length || 0;
  const completionPercent = scheme.total_weeks > 0 ? (completedEntries / scheme.total_weeks) * 100 : 0;

  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        scheme.status === 'active' && 'border-l-4 border-l-green-500',
        scheme.status === 'draft' && 'border-l-4 border-l-yellow-500'
      )}
      onClick={onView}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{scheme.title}</h3>
            {scheme.description && (
              <p className="text-sm text-muted-foreground truncate">{scheme.description}</p>
            )}
          </div>
          <Badge className={cn('shrink-0', statusColors[scheme.status])}>
            {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Subject, Class, Term */}
        <div className="flex flex-wrap gap-2">
          {scheme.subject && (
            <Badge variant="outline" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              {scheme.subject.name}
            </Badge>
          )}
          {scheme.class && (
            <Badge variant="secondary" className="text-xs">
              {scheme.class.name}
            </Badge>
          )}
          {scheme.term && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {scheme.term.name}
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Week entries completed</span>
            <span>{completedEntries} / {scheme.total_weeks}</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </div>

        {/* Teacher info (for admin view) */}
        {!isTeacher && scheme.teacher && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t">
            <User className="h-3 w-3" />
            {scheme.teacher.first_name} {scheme.teacher.last_name}
          </div>
        )}

        {/* Created date */}
        <div className="text-xs text-muted-foreground">
          Created {format(new Date(scheme.created_at), 'MMM d, yyyy')}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="outline" onClick={onView} className="flex-1">
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
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
