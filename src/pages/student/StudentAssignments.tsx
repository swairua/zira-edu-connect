import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentLayout } from '@/components/student/StudentLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentAssignments } from '@/hooks/useStudentData';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';

export default function StudentAssignments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: assignments = [], isLoading } = useStudentAssignments();
  const [activeTab, setActiveTab] = useState('pending');

  const pendingAssignments = assignments.filter(a => !a.submission && !isPast(new Date(a.due_date)));
  const overdueAssignments = assignments.filter(a => !a.submission && isPast(new Date(a.due_date)));
  const submittedAssignments = assignments.filter(a => a.submission);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'pending': return pendingAssignments.length;
      case 'overdue': return overdueAssignments.length;
      case 'submitted': return submittedAssignments.length;
      default: return 0;
    }
  };

  const AssignmentCard = ({ assignment }: { assignment: typeof assignments[0] }) => {
    const isOverdue = isPast(new Date(assignment.due_date)) && !assignment.submission;
    const daysLeft = differenceInDays(new Date(assignment.due_date), new Date());

    return (
      <Card 
        className="cursor-pointer transition-all hover:shadow-md"
        onClick={() => navigate(`/student/assignments/${assignment.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight truncate">{assignment.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {assignment.subject?.name}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Due {format(new Date(assignment.due_date), 'dd MMM yyyy')}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
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
                <Badge variant="outline">
                  {daysLeft === 0 ? 'Due Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days`}
                </Badge>
              )}
              {assignment.submission?.is_late && (
                <Badge variant="secondary" className="text-xs">Late</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <StudentLayout title="Assignments" onRefresh={handleRefresh}>
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pending" className="text-xs">
              Pending ({getTabCount('pending')})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs">
              Overdue ({getTabCount('overdue')})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="text-xs">
              Submitted ({getTabCount('submitted')})
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="pending" className="space-y-3 mt-0">
                {pendingAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
                      <h3 className="mt-4 font-semibold">No pending assignments</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You're all caught up!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingAssignments.map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="overdue" className="space-y-3 mt-0">
                {overdueAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
                      <h3 className="mt-4 font-semibold">No overdue assignments</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Keep up the good work!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  overdueAssignments.map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="submitted" className="space-y-3 mt-0">
                {submittedAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 font-semibold">No submissions yet</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your submitted assignments will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  submittedAssignments.map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </StudentLayout>
  );
}
