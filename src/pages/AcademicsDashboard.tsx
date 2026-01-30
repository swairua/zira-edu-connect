import { useInstitution } from '@/contexts/InstitutionContext';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useExams } from '@/hooks/useExams';
import { useInstitutionDashboard } from '@/hooks/useInstitutionDashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Calendar,
  Award,
  ClipboardList,
  ChevronRight,
  UserCheck,
  GraduationCap,
  Settings
} from 'lucide-react';

export default function AcademicsDashboard() {
  const { institution } = useInstitution();
  const { data: classes, isLoading: loadingClasses } = useClasses(institution?.id || null);
  const { data: students, isLoading: loadingStudents } = useStudents(institution?.id || null);
  const { data: exams, isLoading: loadingExams } = useExams(institution?.id || null);
  const { stats: dashboardData } = useInstitutionDashboard();

  const stats = {
    totalClasses: classes?.length || 0,
    totalStudents: students?.length || 0,
    activeExams: exams?.filter(e => e.status === 'published' || e.status === 'grading')?.length || 0,
    upcomingExams: exams?.filter(e => e.status === 'draft')?.length || 0,
  };

  const quickActions = [
    { label: 'Manage Classes', href: '/classes', icon: BookOpen, description: 'View and configure classes' },
    { label: 'View Students', href: '/students', icon: Users, description: 'Student directory and profiles' },
    { label: 'Exams', href: '/exams', icon: FileText, description: 'Create and manage exams' },
    { label: 'Attendance', href: '/attendance', icon: UserCheck, description: 'Record daily attendance' },
    { label: 'Results', href: '/results', icon: Award, description: 'View academic results' },
    { label: 'Grade Approvals', href: '/grade-approvals', icon: ClipboardList, description: 'Approve submitted grades' },
    { label: 'Report Cards', href: '/reports/report-cards', icon: GraduationCap, description: 'Generate report cards' },
    { label: 'Academic Setup', href: '/academic-setup', icon: Settings, description: 'Configure academic structure' },
  ];

  return (
    <DashboardLayout title="Academics" subtitle="Academic management and oversight">
      <div className="space-y-6">
        {/* Current Term Info */}
        {dashboardData?.currentTermName && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Current Term: {dashboardData.currentTermName}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/academic-setup">Manage Terms</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Total Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingClasses ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalClasses}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStudents ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                Active Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingExams ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-green-600">{stats.activeExams}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-yellow-600" />
                Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingExams ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-yellow-600">{stats.upcomingExams}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common academic management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Classes */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Classes Overview</CardTitle>
                  <CardDescription>Your institution's class structure</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/classes">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingClasses ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !classes?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No classes configured</p>
                  <Button variant="link" asChild>
                    <Link to="/classes">Add your first class</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {classes.slice(0, 5).map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{cls.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cls.level ? (typeof cls.level === 'object' ? String((cls.level as Record<string, unknown>).name || 'No level') : String(cls.level)) : 'No level'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/classes?id=${cls.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Exams</CardTitle>
                  <CardDescription>Latest examination activity</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/exams">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingExams ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !exams?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No exams scheduled</p>
                  <Button variant="link" asChild>
                    <Link to="/exams">Create your first exam</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {exams.slice(0, 5).map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{exam.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {exam.status} • {exam.exam_type}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/exams`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
