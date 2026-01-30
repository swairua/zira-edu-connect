import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { useTeacherClasses } from '@/hooks/useStaffProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookOpen, Users, GraduationCap, MoreVertical, ClipboardList, PenLine, UserCheck } from 'lucide-react';
import { ClassStudentList } from '@/components/portal/ClassStudentList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function TeacherClasses() {
  const navigate = useNavigate();
  const { data: classes = [], isLoading } = useTeacherClasses();
  const [selectedClass, setSelectedClass] = useState<{ id: string; name: string } | null>(null);

  // Get unique class IDs for student count query
  const uniqueClassIds = [...new Set(classes.map(c => c.class_id))];

  // Fetch student counts for all classes
  const { data: studentCounts = {} } = useQuery({
    queryKey: ['class-student-counts', uniqueClassIds],
    queryFn: async () => {
      if (uniqueClassIds.length === 0) return {};

      const counts: Record<string, number> = {};

      for (const classId of uniqueClassIds) {
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classId)
          .eq('status', 'active')
          .is('deleted_at', null);
        
        counts[classId] = count || 0;
      }

      return counts;
    },
    enabled: uniqueClassIds.length > 0,
  });

  const classTeacherClasses = classes.filter(c => c.is_class_teacher);
  const subjectClasses = classes.filter(c => !c.is_class_teacher);

  const handleViewStudents = (classId: string, className: string) => {
    setSelectedClass({ id: classId, name: className });
  };

  return (
    <PortalLayout title="My Classes" subtitle="Classes and subjects assigned to you">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">{uniqueClassIds.length}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class Teacher</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">{classTeacherClasses.length}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Users className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {Object.values(studentCounts).reduce((a, b) => a + b, 0)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Teacher Classes */}
        {classTeacherClasses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Classes I Manage
              </CardTitle>
              <CardDescription>Classes where you are the class teacher</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classTeacherClasses.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.class?.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{item.class?.level} {item.class?.stream && `- ${item.class.stream}`}</span>
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {studentCounts[item.class_id] || 0} students
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Class Teacher</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewStudents(item.class_id, item.class?.name || 'Class')}>
                            <Users className="h-4 w-4 mr-2" />
                            View Students
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/portal/attendance')}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Take Attendance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/portal/assignments')}>
                            <ClipboardList className="h-4 w-4 mr-2" />
                            View Assignments
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/portal/grades')}>
                            <PenLine className="h-4 w-4 mr-2" />
                            Enter Grades
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subject Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Subject Assignments
            </CardTitle>
            <CardDescription>Subjects assigned to you by class</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No classes assigned</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Contact your administrator to get assigned to classes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.class?.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{item.subject?.name || 'All Subjects'}{item.subject?.code && ` (${item.subject.code})`}</span>
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {studentCounts[item.class_id] || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.is_class_teacher && (
                        <Badge variant="outline">Class Teacher</Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewStudents(item.class_id, item.class?.name || 'Class')}>
                            <Users className="h-4 w-4 mr-2" />
                            View Students
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/portal/assignments')}>
                            <ClipboardList className="h-4 w-4 mr-2" />
                            View Assignments
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/portal/grades')}>
                            <PenLine className="h-4 w-4 mr-2" />
                            Enter Grades
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student List Dialog */}
      {selectedClass && (
        <ClassStudentList
          open={!!selectedClass}
          onOpenChange={(open) => !open && setSelectedClass(null)}
          classId={selectedClass.id}
          className={selectedClass.name}
        />
      )}
    </PortalLayout>
  );
}
