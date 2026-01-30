import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

interface UpcomingExamsWidgetProps {
  staffId?: string;
}

function getDateLabel(dateStr: string): { label: string; variant: 'destructive' | 'warning' | 'secondary' } {
  const date = new Date(dateStr);
  if (isToday(date)) return { label: 'Today', variant: 'destructive' };
  if (isTomorrow(date)) return { label: 'Tomorrow', variant: 'warning' };
  const days = differenceInDays(date, new Date());
  if (days <= 3) return { label: `${days} days`, variant: 'warning' };
  return { label: format(date, 'MMM d'), variant: 'secondary' };
}

export function UpcomingExamsWidget({ staffId }: UpcomingExamsWidgetProps) {
  const { upcomingExams, isLoadingUpcomingExams } = useTeacherDashboard(staffId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Exams to Grade
          </CardTitle>
          <CardDescription>Upcoming exams requiring score entry</CardDescription>
        </div>
        <Link to="/portal/grades">
          <Badge variant="outline">View All</Badge>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoadingUpcomingExams ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : upcomingExams.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No upcoming exams</p>
            <p className="text-xs text-muted-foreground mt-1">Check back later for new exam schedules</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingExams.slice(0, 4).map((exam) => {
              const dateInfo = getDateLabel(exam.startDate);
              return (
                <div
                  key={exam.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                      <ClipboardCheck className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">{exam.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(exam.startDate), 'EEEE, MMM d')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={dateInfo.variant}>{dateInfo.label}</Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/portal/grades">
                        Enter
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
