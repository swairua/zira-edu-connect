import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  FileText, 
  Clock, 
  GraduationCap,
  Users,
  CheckCircle
} from 'lucide-react';
import { useTeacherClasses } from '@/hooks/useStaffProfile';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';

interface TeacherStatsWidgetProps {
  staffId?: string;
}

export function TeacherStatsWidget({ staffId }: TeacherStatsWidgetProps) {
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses();
  const { 
    pendingAssignments, 
    upcomingExams, 
    recentSubmissions,
    isLoadingPendingAssignments 
  } = useTeacherDashboard(staffId);

  const isLoading = classesLoading || isLoadingPendingAssignments;
  const classTeacherClasses = classes.filter(c => c.is_class_teacher);
  // Estimate students based on number of classes (average class size)
  const estimatedStudents = classes.length * 35; // Average class size estimate
  const ungradedCount = pendingAssignments.reduce((sum, a) => sum + a.ungradedCount, 0);
  const gradedToday = recentSubmissions.filter(s => s.status === 'graded').length;

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4 sm:pt-6">
              <Skeleton className="h-4 w-20 sm:w-24 mb-2" />
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'My Classes',
      value: classes.length,
      subtitle: `${classTeacherClasses.length} as class teacher`,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Est. Students',
      value: estimatedStudents.toLocaleString(),
      subtitle: 'across all classes',
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Pending Grading',
      value: ungradedCount,
      subtitle: ungradedCount > 0 ? 'assignments to grade' : 'all caught up!',
      icon: FileText,
      color: ungradedCount > 0 ? 'text-warning' : 'text-success',
      bgColor: ungradedCount > 0 ? 'bg-warning/10' : 'bg-success/10',
    },
    {
      title: 'Upcoming Exams',
      value: upcomingExams.length,
      subtitle: upcomingExams.length > 0 ? 'in next 2 weeks' : 'no exams scheduled',
      icon: Clock,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardContent className="p-3 sm:p-4 sm:pt-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg flex-shrink-0 ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{card.title}</p>
                  <p className="text-xl sm:text-2xl font-bold truncate">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
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
