import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, UserMinus } from 'lucide-react';
import { useActivityEnrollments } from '@/hooks/useActivityEnrollments';
import { useActivities } from '@/hooks/useActivities';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import EnrollStudentDialog from '@/components/activities/EnrollStudentDialog';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  withdrawn: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function ManageEnrollments() {
  const { activities } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  
  const { enrollments, isLoading, withdrawStudent } = useActivityEnrollments(
    selectedActivity !== 'all' ? selectedActivity : undefined
  );

  const filteredEnrollments = selectedActivity === 'all' 
    ? enrollments 
    : enrollments.filter(e => e.activity_id === selectedActivity);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Enrollments" subtitle="Manage student participation in activities">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
          <p className="text-muted-foreground">
            Manage student participation in activities
          </p>
        </div>
        <Button onClick={() => setEnrollDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Enroll Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Enrollments</CardTitle>
            <Select value={selectedActivity} onValueChange={setSelectedActivity}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {activities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {enrollment.student?.first_name} {enrollment.student?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.student?.admission_number}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{enrollment.activity?.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {enrollment.activity?.activity_type} • {enrollment.activity?.category}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[enrollment.status]}>
                      {enrollment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(enrollment.enrolled_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {enrollment.notes || '-'}
                  </TableCell>
                  <TableCell>
                    {enrollment.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => withdrawStudent.mutate(enrollment.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredEnrollments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No enrollments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

        <EnrollStudentDialog
          open={enrollDialogOpen}
          onOpenChange={setEnrollDialogOpen}
          activities={activities}
        />
      </div>
    </DashboardLayout>
  );
}
