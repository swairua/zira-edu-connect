import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAcademicYears, useCurrentAcademicYear } from '@/hooks/useAcademicYears';
import { useExams } from '@/hooks/useExams';
import { useClasses } from '@/hooks/useClasses';
import { useClassStudents } from '@/hooks/useClassStudents';
import { useScores } from '@/hooks/useScores';
import { Award, Users, TrendingUp, FileText, FileBarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Results() {
  const { institutionId, institution } = useInstitution();
  const { data: currentYear } = useCurrentAcademicYear(institutionId);
  const { data: exams = [], isLoading: examsLoading } = useExams(institutionId, currentYear?.id);
  const { data: classes = [] } = useClasses(institutionId);

  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const { data: students = [], isLoading: studentsLoading } = useClassStudents(selectedClass || null);
  const { data: scores = [], isLoading: scoresLoading } = useScores(selectedExam || null, selectedClass || null);

  const publishedExams = exams.filter((e) => e.status === 'published');
  const selectedExamData = exams.find((e) => e.id === selectedExam);
  const selectedClassData = classes.find((c) => c.id === selectedClass);

  // Group scores by student
  const studentResults = students.map((student) => {
    const studentScores = scores.filter((s) => s.student_id === student.id);
    const totalMarks = studentScores.reduce((sum, s) => sum + (s.marks || 0), 0);
    const subjectCount = studentScores.length;
    const avgMarks = subjectCount > 0 ? totalMarks / subjectCount : 0;

    return {
      ...student,
      scores: studentScores,
      totalMarks,
      avgMarks: Math.round(avgMarks * 10) / 10,
      subjectCount,
    };
  });

  // Sort by average marks
  const rankedStudents = [...studentResults].sort((a, b) => b.avgMarks - a.avgMarks);

  // Stats
  const classAverage =
    rankedStudents.length > 0
      ? rankedStudents.reduce((sum, s) => sum + s.avgMarks, 0) / rankedStudents.length
      : 0;

  return (
    <DashboardLayout title="Results" subtitle="View examination results">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Examination Results</h1>
            <p className="text-muted-foreground">
              View published results for {institution?.name || 'your institution'}
            </p>
          </div>
          <Button asChild>
            <Link to="/reports/report-cards">
              <FileBarChart className="mr-2 h-4 w-4" />
              Generate Report Cards
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Exam</label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {publishedExams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </SelectItem>
                    ))}
                    {publishedExams.length === 0 && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No published exams
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.stream && `- ${cls.stream}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {selectedExam && selectedClass && (
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="text-xl font-bold">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class Average</p>
                    <p className="text-xl font-bold">{Math.round(classAverage * 10) / 10}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <Award className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Top Score</p>
                    <p className="text-xl font-bold">
                      {rankedStudents[0]?.avgMarks || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <FileText className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exam</p>
                    <p className="text-xl font-bold truncate max-w-24">{selectedExamData?.name?.split(' ')[0] || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Table */}
        {selectedExam && selectedClass && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedClassData?.name} - {selectedExamData?.name}
              </CardTitle>
              <CardDescription>Student rankings based on average marks</CardDescription>
            </CardHeader>
            <CardContent>
              {studentsLoading || scoresLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : rankedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No results available</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Scores have not been entered for this exam and class
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Adm No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankedStudents.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          {index === 0 && (
                            <Badge className="bg-yellow-500 text-yellow-950">1st</Badge>
                          )}
                          {index === 1 && (
                            <Badge className="bg-gray-400 text-gray-900">2nd</Badge>
                          )}
                          {index === 2 && (
                            <Badge className="bg-amber-600 text-amber-50">3rd</Badge>
                          )}
                          {index > 2 && (
                            <span className="text-muted-foreground">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.admission_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.subjectCount}</TableCell>
                        <TableCell>{student.totalMarks}</TableCell>
                        <TableCell>
                          <Badge variant={student.avgMarks >= 50 ? 'default' : 'destructive'}>
                            {student.avgMarks}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {(!selectedExam || !selectedClass) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Award className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-semibold">Select Exam and Class</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Choose a published exam and class to view results
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
