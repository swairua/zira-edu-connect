import { useState } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
import { useTeacherClasses, useStaffProfile } from '@/hooks/useStaffProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentAcademicYear } from '@/hooks/useAcademicYears';
import { ClipboardCheck, BookOpen, ArrowRight, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface ExamWithProgress {
  id: string;
  name: string;
  exam_type: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  max_marks: number | null;
  gradingProgress: {
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    totalStudents: number;
    gradedCount: number;
  }[];
}

export default function TeacherGrades() {
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses();
  const { data: profile } = useStaffProfile();
  const { data: currentYear } = useCurrentAcademicYear(profile?.institution_id || null);
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  // Fetch exams for the current academic year with grading progress
  const { data: examsWithProgress = [], isLoading: examsLoading } = useQuery({
    queryKey: ['teacher-exams-progress', profile?.id, currentYear?.id],
    queryFn: async (): Promise<ExamWithProgress[]> => {
      if (!profile?.id || !currentYear?.id || !profile?.institution_id) return [];

      // Get teacher's class-subject assignments
      const { data: classTeachers } = await supabase
        .from('class_teachers')
        .select('class_id, subject_id, is_class_teacher, classes(id, name), subjects(id, name)')
        .eq('staff_id', profile.id);

      if (!classTeachers || classTeachers.length === 0) return [];

      // Get all subjects for institution (needed for class teachers without subject assignment)
      const { data: allSubjects } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('institution_id', profile.institution_id)
        .eq('is_active', true);

      // Get exams for the current academic year
      const { data: exams, error } = await supabase
        .from('exams')
        .select('id, name, exam_type, start_date, end_date, status, max_marks')
        .eq('institution_id', profile.institution_id)
        .eq('academic_year_id', currentYear.id)
        .in('status', ['scheduled', 'active', 'draft'])
        .order('start_date', { ascending: false });

      if (error || !exams) return [];

      // Get grading progress for each exam
      const examsWithGradingProgress: ExamWithProgress[] = [];

      for (const exam of exams) {
        const gradingProgress: ExamWithProgress['gradingProgress'] = [];

        for (const ct of classTeachers) {
          if (!ct.class_id) continue;

          const classData = ct.classes as { id: string; name: string } | null;
          const subjectData = ct.subjects as { id: string; name: string } | null;

          // If class teacher without subject assignment, show ALL subjects for this class
          if (ct.is_class_teacher && !ct.subject_id && allSubjects) {
            for (const subject of allSubjects) {
              // Get total students in class
              const { count: totalStudents } = await supabase
                .from('students')
                .select('id', { count: 'exact', head: true })
                .eq('class_id', ct.class_id)
                .eq('status', 'active');

              // Get graded scores count
              const { count: gradedCount } = await supabase
                .from('student_scores')
                .select('id', { count: 'exact', head: true })
                .eq('exam_id', exam.id)
                .eq('subject_id', subject.id)
                .not('marks', 'is', null);

              gradingProgress.push({
                classId: ct.class_id,
                className: classData?.name || 'Unknown',
                subjectId: subject.id,
                subjectName: subject.name,
                totalStudents: totalStudents || 0,
                gradedCount: gradedCount || 0,
              });
            }
          } else if (ct.subject_id) {
            // Regular subject teacher - show only assigned subject
            // Get total students in class
            const { count: totalStudents } = await supabase
              .from('students')
              .select('id', { count: 'exact', head: true })
              .eq('class_id', ct.class_id)
              .eq('status', 'active');

            // Get graded scores count from student_scores table
            const { count: gradedCount } = await supabase
              .from('student_scores')
              .select('id', { count: 'exact', head: true })
              .eq('exam_id', exam.id)
              .eq('subject_id', ct.subject_id)
              .not('marks', 'is', null);

            gradingProgress.push({
              classId: ct.class_id,
              className: classData?.name || 'Unknown',
              subjectId: ct.subject_id,
              subjectName: subjectData?.name || 'Unknown',
              totalStudents: totalStudents || 0,
              gradedCount: gradedCount || 0,
            });
          }
        }

        examsWithGradingProgress.push({
          ...exam,
          gradingProgress,
        });
      }

      return examsWithGradingProgress;
    },
    enabled: !!profile?.id && !!currentYear?.id,
  });

  const isLoading = classesLoading || examsLoading;

  // Filter exams by type
  const filteredExams = selectedExamType === 'all'
    ? examsWithProgress
    : examsWithProgress.filter(e => e.exam_type === selectedExamType);

  const examTypes = [...new Set(examsWithProgress.map(e => e.exam_type))];

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <PortalLayout title="Grade Entry" subtitle="Enter and manage student exam grades">
      <div className="space-y-6">
        {/* Header with filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Exam Grading</CardTitle>
                <CardDescription>Select an exam and class to enter scores</CardDescription>
              </div>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exam Types</SelectItem>
                  {examTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Classes Assigned */}
        {!isLoading && classes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No Classes Assigned</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                You don't have any classes assigned. Contact your administrator.
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Exams */}
        {!isLoading && classes.length > 0 && filteredExams.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No Exams Found</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                There are no exams scheduled for the current academic year.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Exams List */}
        {!isLoading && filteredExams.map(exam => (
          <Card key={exam.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="capitalize">{exam.exam_type.replace('_', ' ')}</span>
                      {exam.start_date && (
                        <>
                          <span>•</span>
                          <span>{format(new Date(exam.start_date), 'MMM d, yyyy')}</span>
                        </>
                      )}
                      {exam.max_marks && (
                        <>
                          <span>•</span>
                          <span>Max: {exam.max_marks} marks</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(exam.status)}
              </div>
            </CardHeader>
            <CardContent>
              {exam.gradingProgress.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No class-subject assignments found for grading.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exam.gradingProgress.map((progress, idx) => {
                      const percentage = progress.totalStudents > 0
                        ? Math.round((progress.gradedCount / progress.totalStudents) * 100)
                        : 0;
                      const isComplete = progress.gradedCount >= progress.totalStudents && progress.totalStudents > 0;

                      return (
                        <TableRow key={`${progress.classId}-${progress.subjectId}-${idx}`}>
                          <TableCell className="font-medium">{progress.className}</TableCell>
                          <TableCell>{progress.subjectName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Progress value={percentage} className="h-2 w-24" />
                              <span className="text-sm text-muted-foreground">
                                {progress.gradedCount}/{progress.totalStudents}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isComplete ? (
                              <Badge className="bg-green-500">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Complete
                              </Badge>
                            ) : percentage > 0 ? (
                              <Badge variant="outline" className="text-amber-600 border-amber-600">
                                In Progress
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Not Started</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm">
                              <Link to={`/portal/grades/${exam.id}/${progress.subjectId}/${progress.classId}`}>
                                {isComplete ? 'Review' : 'Enter Scores'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Quick Access - Your Classes */}
        {!isLoading && classes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Assigned Classes</CardTitle>
              <CardDescription>Quick reference for your class-subject assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.class?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.subject?.name || 'All Subjects'}
                      </p>
                    </div>
                    {item.is_class_teacher && (
                      <Badge variant="outline" className="text-xs">CT</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
