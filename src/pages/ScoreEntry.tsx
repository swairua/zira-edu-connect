import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useExam } from '@/hooks/useExams';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { useClassStudents } from '@/hooks/useClassStudents';
import { useScores, useUpsertScores } from '@/hooks/useScores';
import { getGradeFromScore, type CountryCode } from '@/lib/country-config';
import { ArrowLeft, Save, Users, BookOpen, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ScoreEntry {
  studentId: string;
  marks: string;
}

export default function ScoreEntry() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { institutionId, institution } = useInstitution();
  const countryCode = (institution?.country || 'KE') as CountryCode;

  const { data: exam, isLoading: examLoading } = useExam(examId || null);
  const { data: classes = [] } = useClasses(institutionId);
  const { data: subjects = [] } = useSubjects(institutionId);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const { data: students = [], isLoading: studentsLoading } = useClassStudents(selectedClass || null);
  const { data: existingScores = [], isLoading: scoresLoading } = useScores(
    examId || null,
    selectedClass || null,
    selectedSubject || null
  );

  const upsertScores = useUpsertScores(institutionId, countryCode);

  // Initialize scores from existing data
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({});

  // Update scores when existing data loads
  useEffect(() => {
    if (existingScores.length > 0 && selectedSubject) {
      const scoreMap: Record<string, ScoreEntry> = {};
      existingScores.forEach((score) => {
        if (score.subject_id === selectedSubject) {
          scoreMap[score.student_id] = {
            studentId: score.student_id,
            marks: score.marks?.toString() || '',
          };
        }
      });
      setScores(scoreMap);
    } else if (students.length > 0) {
      // Initialize empty scores for all students
      const scoreMap: Record<string, ScoreEntry> = {};
      students.forEach((student) => {
        if (!scores[student.id]) {
          scoreMap[student.id] = {
            studentId: student.id,
            marks: '',
          };
        }
      });
      setScores((prev) => ({ ...scoreMap, ...prev }));
    }
  }, [existingScores, students, selectedSubject]);

  const handleScoreChange = (studentId: string, value: string) => {
    // Only allow numbers and empty string
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;

    // Validate max marks
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && exam?.max_marks && numValue > exam.max_marks) {
      toast.error(`Maximum marks allowed is ${exam.max_marks}`);
      return;
    }

    setScores((prev) => ({
      ...prev,
      [studentId]: { studentId, marks: value },
    }));
  };

  const handleSave = async () => {
    if (!examId || !selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    const scoreInputs = Object.values(scores)
      .filter((s) => s.marks !== '')
      .map((s) => ({
        student_id: s.studentId,
        subject_id: selectedSubject,
        marks: parseFloat(s.marks) || null,
      }));

    if (scoreInputs.length === 0) {
      toast.error('No scores to save');
      return;
    }

    await upsertScores.mutateAsync({ examId, scores: scoreInputs });
  };

  // Stats calculation
  const stats = useMemo(() => {
    const entered = Object.values(scores).filter((s) => s.marks !== '').length;
    const total = students.length;
    const avgMarks =
      entered > 0
        ? Object.values(scores)
            .filter((s) => s.marks !== '')
            .reduce((sum, s) => sum + (parseFloat(s.marks) || 0), 0) / entered
        : 0;

    return { entered, total, pending: total - entered, avgMarks: Math.round(avgMarks * 10) / 10 };
  }, [scores, students]);

  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);
  const selectedClassData = classes.find((c) => c.id === selectedClass);

  if (examLoading) {
    return (
      <DashboardLayout title="Score Entry" subtitle="Loading...">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!exam) {
    return (
      <DashboardLayout title="Score Entry" subtitle="Exam not found">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Exam not found</p>
          <Button variant="outline" onClick={() => navigate('/exams')} className="mt-4">
            Back to Exams
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Score Entry" subtitle={exam.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/exams')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{exam.name}</h1>
              <p className="text-muted-foreground">
                {exam.term?.name} • Max Marks: {exam.max_marks || 100}
              </p>
            </div>
          </div>
          <Badge variant={exam.status === 'published' ? 'default' : 'outline'}>
            {exam.status || 'Draft'}
          </Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {selectedClass && selectedSubject && (
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Scores Entered</p>
                    <p className="text-xl font-bold">{stats.entered}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <BookOpen className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <BookOpen className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-xl font-bold">{stats.avgMarks}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Score Entry Table */}
        {selectedClass && selectedSubject && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {selectedClassData?.name} - {selectedSubjectData?.name}
                </CardTitle>
                <CardDescription>Enter marks for each student (max: {exam.max_marks || 100})</CardDescription>
              </div>
              <Button onClick={handleSave} disabled={upsertScores.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {upsertScores.isPending ? 'Saving...' : 'Save Scores'}
              </Button>
            </CardHeader>
            <CardContent>
              {studentsLoading || scoresLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No students in this class</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add students to this class to enter their scores
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Adm No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-32">Marks</TableHead>
                      <TableHead className="w-24">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => {
                      const scoreEntry = scores[student.id] || { marks: '' };
                      const marks = parseFloat(scoreEntry.marks);
                      const grade = !isNaN(marks) ? getGradeFromScore(marks, countryCode) : '-';

                      return (
                        <TableRow key={student.id}>
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{student.admission_number}</TableCell>
                          <TableCell className="font-medium">
                            {student.first_name} {student.last_name}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="--"
                              value={scoreEntry.marks}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={grade !== '-' ? 'default' : 'outline'}
                              className="min-w-12 justify-center"
                            >
                              {grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {(!selectedClass || !selectedSubject) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-semibold">Select Class and Subject</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Choose a class and subject above to start entering scores
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
