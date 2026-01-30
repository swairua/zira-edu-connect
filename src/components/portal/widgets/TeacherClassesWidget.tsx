import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTeacherClasses } from '@/hooks/useStaffProfile';

export function TeacherClassesWidget() {
  const { data: classes = [], isLoading } = useTeacherClasses();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Classes
          </CardTitle>
          <CardDescription>Classes and subjects assigned to you</CardDescription>
        </div>
        <Link to="/portal/classes">
          <Badge variant="outline">View All</Badge>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No classes assigned yet</p>
            <p className="text-xs text-muted-foreground mt-1">Contact your administrator</p>
          </div>
        ) : (
          <div className="space-y-2">
            {classes.slice(0, 5).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {item.class?.name || 'Unknown Class'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.subject?.name || 'All Subjects'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.is_class_teacher && (
                    <Badge>Class Teacher</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
