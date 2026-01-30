import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ClipboardCheck,
  FileText, 
  Users, 
  Calendar,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function TeacherQuickActionsWidget() {
  const actions = [
    { to: '/portal/grades', icon: ClipboardCheck, label: 'Enter Exam Grades' },
    { to: '/portal/assignments', icon: FileText, label: 'Grade Assignments' },
    { to: '/portal/classes', icon: Users, label: 'View Students' },
    { to: '/portal/timetable', icon: Calendar, label: 'My Timetable' },
    { to: '/portal/attendance', icon: BookOpen, label: 'Mark Attendance' },
    { to: '/portal/profile', icon: GraduationCap, label: 'My Profile' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
