import { StudentLayout } from '@/components/student/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudent } from '@/contexts/StudentContext';
import { useStudentAssignments, useStudentFees, useStudentResults } from '@/hooks/useStudentData';
import { BookOpen, Award, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { studentProfile } = useStudent();
  const { data: assignments = [] } = useStudentAssignments();
  const { data: fees } = useStudentFees();
  const { data: results = [] } = useStudentResults();

  const pendingAssignments = assignments.filter(a => !a.submission && !isPast(new Date(a.due_date)));
  const overdueAssignments = assignments.filter(a => !a.submission && isPast(new Date(a.due_date)));
  const submittedCount = assignments.filter(a => a.submission).length;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
    queryClient.invalidateQueries({ queryKey: ['student-fees'] });
    queryClient.invalidateQueries({ queryKey: ['student-results'] });
  };

  return (
    <StudentLayout title="Dashboard" onRefresh={handleRefresh}>
      <div className="space-y-6 p-4">
        {/* Welcome Message */}
        <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <h2 className="text-xl font-bold">
            Welcome back, {studentProfile?.first_name}! 👋
          </h2>
          <p className="mt-1 text-sm text-white/80">
            {studentProfile?.class_name || 'No class assigned'} • {studentProfile?.admission_number}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer transition-shadow hover:shadow-md" 
            onClick={() => navigate('/student/assignments')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingAssignments.length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-shadow hover:shadow-md" 
            onClick={() => navigate('/student/results')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{results.length}</p>
                  <p className="text-xs text-muted-foreground">Results</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-shadow hover:shadow-md" 
            onClick={() => navigate('/student/fees')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  (fees?.balance || 0) > 0 
                    ? 'bg-red-100 dark:bg-red-900/30' 
                    : 'bg-green-100 dark:bg-green-900/30'
                }`}>
                  <Wallet className={`h-5 w-5 ${
                    (fees?.balance || 0) > 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`} />
                </div>
                <div>
                  <p className="text-lg font-bold">
                    KES {(fees?.balance || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{submittedCount}</p>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Assignments Alert */}
        {overdueAssignments.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive">
                <Clock className="h-4 w-4" />
                Overdue Assignments ({overdueAssignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueAssignments.slice(0, 3).map(assignment => (
                  <div 
                    key={assignment.id}
                    className="flex items-center justify-between rounded-lg bg-background p-3 cursor-pointer"
                    onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                  >
                    <div>
                      <p className="font-medium text-sm">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.subject?.name} • Due {format(new Date(assignment.due_date), 'dd MMM')}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">Overdue</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Assignments */}
        {pendingAssignments.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingAssignments.slice(0, 5).map(assignment => {
                  const daysLeft = differenceInDays(new Date(assignment.due_date), new Date());
                  return (
                    <div 
                      key={assignment.id}
                      className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                    >
                      <div>
                        <p className="font-medium text-sm">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.subject?.name}
                        </p>
                      </div>
                      <Badge 
                        variant={daysLeft <= 1 ? 'destructive' : daysLeft <= 3 ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {pendingAssignments.length === 0 && overdueAssignments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You have no pending assignments
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
