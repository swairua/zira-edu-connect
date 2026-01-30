import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { User, TrendingUp, TrendingDown } from 'lucide-react';

interface ClassStudentListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  photo_url?: string | null;
  gender?: string | null;
  status: string;
}

export function ClassStudentList({ open, onOpenChange, classId, className }: ClassStudentListProps) {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['class-students-list', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_number, photo_url, gender, status')
        .eq('class_id', classId)
        .is('deleted_at', null)
        .order('first_name');

      if (error) {
        console.error('Error fetching students:', error);
        return [];
      }

      return data as Student[];
    },
    enabled: open && !!classId,
  });

  // Get attendance stats for students
  const { data: attendanceStats } = useQuery({
    queryKey: ['class-attendance-stats', classId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', classId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (error || !data) return new Map();

      // Calculate attendance rate per student
      const statsMap = new Map<string, { present: number; total: number }>();
      data.forEach((record) => {
        const existing = statsMap.get(record.student_id) || { present: 0, total: 0 };
        existing.total++;
        if (record.status === 'present' || record.status === 'late') {
          existing.present++;
        }
        statsMap.set(record.student_id, existing);
      });

      return statsMap;
    },
    enabled: open && !!classId,
  });

  const getAttendanceRate = (studentId: string) => {
    const stats = attendanceStats?.get(studentId);
    if (!stats || stats.total === 0) return null;
    return Math.round((stats.present / stats.total) * 100);
  };

  const activeStudents = students.filter(s => s.status === 'active');
  const inactiveStudents = students.filter(s => s.status !== 'active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{className} - Students</DialogTitle>
          <DialogDescription>
            {activeStudents.length} active students in this class
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students in this class</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeStudents.map((student) => {
                const attendanceRate = getAttendanceRate(student.id);
                return (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={student.photo_url || undefined} />
                      <AvatarFallback>
                        {student.first_name[0]}{student.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {student.first_name} {student.last_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{student.admission_number}</span>
                        {student.gender && (
                          <Badge variant="outline" className="text-xs">
                            {student.gender}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {attendanceRate !== null && (
                      <div className="flex items-center gap-1 text-sm">
                        {attendanceRate >= 80 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={attendanceRate >= 80 ? 'text-green-600' : 'text-red-600'}>
                          {attendanceRate}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {inactiveStudents.length > 0 && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Inactive Students ({inactiveStudents.length})
                    </p>
                  </div>
                  {inactiveStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 rounded-lg border opacity-60"
                    >
                      <Avatar>
                        <AvatarImage src={student.photo_url || undefined} />
                        <AvatarFallback>
                          {student.first_name[0]}{student.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{student.admission_number}</p>
                      </div>
                      <Badge variant="secondary">{student.status}</Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
