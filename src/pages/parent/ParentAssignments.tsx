import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, FileText, Clock, Filter } from 'lucide-react';
import { ParentLayout } from '@/components/parent/ParentLayout';
import { useParent } from '@/contexts/ParentContext';
import { useStudentAssignmentsWithSubmissions } from '@/hooks/useAssignmentSubmissions';
import { useAssignmentSettings } from '@/hooks/useInstitutionSettings';
import { NoStudentLinked } from '@/components/parent/NoStudentLinked';
import { ErrorCard } from '@/components/parent/ErrorCard';
import { AssignmentCard } from '@/components/parent/AssignmentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { isPast } from 'date-fns';


export default function ParentAssignments() {
  const navigate = useNavigate();
  const { selectedStudent, isLoading: parentLoading, parentProfile } = useParent();
  const [activeTab, setActiveTab] = useState('pending');
  
  const { 
    data: assignments, 
    isLoading, 
    error, 
    refetch 
  } = useStudentAssignmentsWithSubmissions(
    selectedStudent?.id, 
    selectedStudent?.class_id
  );

  const { data: assignmentSettings } = useAssignmentSettings(parentProfile?.institution_id);

  // Filter assignments by status
  const pendingAssignments = assignments?.filter(a => 
    !a.submission && !isPast(new Date(a.due_date))
  ) || [];
  
  const overdueAssignments = assignments?.filter(a => 
    !a.submission && isPast(new Date(a.due_date))
  ) || [];
  
  const submittedAssignments = assignments?.filter(a => 
    a.submission
  ) || [];

  if (parentLoading) {
    return (
      <ParentLayout title="Assignments">
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </ParentLayout>
    );
  }

  if (!selectedStudent) {
    return (
      <ParentLayout title="Assignments">
        <div className="p-4">
          <NoStudentLinked />
        </div>
      </ParentLayout>
    );
  }

  // Check if assignment module is enabled
  if (!assignmentSettings?.enabled) {
    return (
      <ParentLayout title="Assignments">
        <div className="p-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Assignments Not Available</h3>
              <p className="text-sm text-muted-foreground">
                The assignment module is not enabled for this school.
              </p>
            </CardContent>
          </Card>
        </div>
      </ParentLayout>
    );
  }

  if (error) {
    return (
      <ParentLayout title="Assignments">
        <div className="p-4">
          <ErrorCard 
            title="Failed to load assignments" 
            message="We couldn't fetch the assignments. Please try again."
            onRetry={refetch}
          />
        </div>
      </ParentLayout>
    );
  }

  const handleAssignmentClick = (assignmentId: string) => {
    navigate(`/parent/assignments/${assignmentId}`);
  };

  return (
    <ParentLayout 
      title="Assignments" 
      onRefresh={refetch}
      showStudentSelector
    >
      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-primary">{pendingAssignments.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-destructive">{overdueAssignments.length}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-green-600">{submittedAssignments.length}</p>
              <p className="text-xs text-muted-foreground">Submitted</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="text-xs">
              Pending ({pendingAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs">
              Overdue ({overdueAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="text-xs">
              Submitted ({submittedAssignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : pendingAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No pending assignments</p>
                </CardContent>
              </Card>
            ) : (
              pendingAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onClick={() => handleAssignmentClick(assignment.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="overdue" className="mt-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : overdueAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No overdue assignments</p>
                </CardContent>
              </Card>
            ) : (
              overdueAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onClick={() => handleAssignmentClick(assignment.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="submitted" className="mt-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : submittedAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No submitted assignments yet</p>
                </CardContent>
              </Card>
            ) : (
              submittedAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onClick={() => handleAssignmentClick(assignment.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ParentLayout>
  );
}
