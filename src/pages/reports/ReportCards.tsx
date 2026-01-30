import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Users, Loader2, GraduationCap, Printer, TrendingUp, Award, BarChart3, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useExams } from '@/hooks/useExams';
import { useClasses } from '@/hooks/useClasses';
import { useScores } from '@/hooks/useScores';
import { useStudents } from '@/hooks/useStudents';
import { useClassPerformance } from '@/hooks/useClassPerformance';
import { useCurrentAcademicYear } from '@/hooks/useAcademicYears';
import { generateReportCardPDF } from '@/lib/pdf-generators';
import { getGradeFromScore, getCurriculum, CurriculumId } from '@/lib/curriculum-config';

export default function ReportCards() {
  const { institutionId, institution } = useInstitution();
  const { data: currentYear } = useCurrentAcademicYear(institutionId);
  const { data: exams = [], isLoading: examsLoading } = useExams(institutionId, currentYear?.id);
  const { data: classes = [] } = useClasses(institutionId);

  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get curriculum for grading - default to CBC for Kenya schools
  const curriculumId: CurriculumId = ((institution as any)?.curriculum as CurriculumId) || 'ke_cbc';
  const curriculumConfig = getCurriculum(curriculumId);
  const gradingScale = curriculumConfig?.gradingScales?.[0];

  const { data: students = [], isLoading: studentsLoading } = useStudents(institutionId, { classId: selectedClass || undefined });
  const { data: scores = [], isLoading: scoresLoading } = useScores(selectedExam || null, selectedClass || null);
  const { data: classPerformance } = useClassPerformance(institutionId, selectedExam || undefined, selectedClass || undefined);

  const publishedExams = exams.filter((e) => e.status === 'published');
  const selectedExamData = exams.find((e) => e.id === selectedExam);
  const selectedClassData = classes.find((c) => c.id === selectedClass);

  // Get unique streams from classes
  const streams = useMemo(() => {
    const uniqueStreams = new Set(classes.map(c => c.stream).filter(Boolean));
    return Array.from(uniqueStreams);
  }, [classes]);

  // Filter classes by stream
  const filteredClasses = useMemo(() => {
    if (selectedStream === 'all') return classes;
    return classes.filter(c => c.stream === selectedStream);
  }, [classes, selectedStream]);

  // Fetch subjects for the class
  const { data: subjects = [] } = useQuery({
    queryKey: ['class-subjects', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data, error } = await supabase
        .from('class_subjects')
        .select('subject:subjects(id, name)')
        .eq('class_id', selectedClass);
      if (error) throw error;
      return data?.map(d => d.subject).filter(Boolean) || [];
    },
    enabled: !!selectedClass,
  });

  // Calculate student results with rankings using percentage
  const maxMarks = selectedExamData?.max_marks || 100;
  
  const studentResults = students.map((student) => {
    const studentScores = scores.filter((s) => s.student_id === student.id);
    const totalMarks = studentScores.reduce((sum, s) => sum + (s.marks || 0), 0);
    const subjectCount = studentScores.length;
    
    // Calculate average as percentage of max_marks
    const totalMaxMarks = subjectCount * maxMarks;
    const avgPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

    return {
      ...student,
      scores: studentScores,
      totalMarks,
      avgPercentage: Math.round(avgPercentage * 10) / 10,
      subjectCount,
    };
  });

  // Sort by average percentage and assign ranks
  const rankedStudents = [...studentResults]
    .sort((a, b) => b.avgPercentage - a.avgPercentage)
    .map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

  // Get class performance summary
  const classSummary = classPerformance?.classSummaries?.find(c => c.classId === selectedClass);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(rankedStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const generateReportCard = async (student: typeof rankedStudents[0]) => {
    if (!selectedExamData || !institution) return;

    // Build scores array with subject names - calculate percentage for grading
    const examMaxMarks = selectedExamData.max_marks || 100;
    const studentScoreData = student.scores.map(score => {
      const subject = subjects.find((s: any) => s.id === score.subject_id);
      // Calculate percentage for proper grade lookup
      const percentage = examMaxMarks > 0 ? ((score.marks || 0) / examMaxMarks) * 100 : 0;
      const grade = getGradeFromScore(percentage, curriculumId);
      return {
        subject: subject?.name || 'Unknown Subject',
        marks: score.marks || 0,
        grade: grade,
        remarks: '',
      };
    });

    generateReportCardPDF({
      student: {
        first_name: student.first_name,
        last_name: student.last_name,
        admission_number: student.admission_number,
        class: selectedClassData,
      },
      exam: {
        name: selectedExamData.name,
        term: selectedExamData.term ? { name: selectedExamData.term.name } : undefined,
        academic_year: selectedExamData.academic_year ? { name: selectedExamData.academic_year.name } : undefined,
        max_marks: selectedExamData.max_marks || 100,
      },
      scores: studentScoreData,
      classRank: student.rank,
      totalStudents: rankedStudents.length,
      average: student.avgPercentage,
      totalMarks: student.totalMarks,
      totalMaxMarks: studentScoreData.length * (selectedExamData.max_marks || 100),
      institution: {
        name: institution.name,
        address: institution.address || '',
        phone: institution.phone || '',
        email: institution.email || '',
        logo_url: (institution as any).logo_url || undefined,
        motto: (institution as any).motto || undefined,
      },
      // Include grading scale for PDF legend
      gradingScale: gradingScale ? {
        name: gradingScale.name,
        grades: gradingScale.grades.map(g => ({
          grade: g.grade,
          min_score: g.minScore,
          max_score: g.maxScore,
          description: g.description,
        })),
      } : undefined,
    });
  };

  const handleGenerateSelected = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsGenerating(true);
    try {
      for (const studentId of selectedStudents) {
        const student = rankedStudents.find(s => s.id === studentId);
        if (student) {
          await generateReportCard(student);
          // Small delay between PDFs to prevent browser issues
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      toast.success(`Generated ${selectedStudents.length} report card(s)`);
    } catch (error) {
      toast.error('Failed to generate some report cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (rankedStudents.length === 0) {
      toast.error('No students to generate report cards for');
      return;
    }

    setIsGenerating(true);
    try {
      for (const student of rankedStudents) {
        await generateReportCard(student);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success(`Generated ${rankedStudents.length} report card(s)`);
    } catch (error) {
      toast.error('Failed to generate some report cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = studentsLoading || scoresLoading;
  const hasSelection = selectedExam && selectedClass;

  return (
    <DashboardLayout title="Report Cards" subtitle="Generate student report cards">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Report Cards</h1>
            <p className="text-muted-foreground">
              Generate and print student report cards for {institution?.name || 'your institution'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Exam</label>
                <Select value={selectedExam} onValueChange={(val) => {
                  setSelectedExam(val);
                  setSelectedStudents([]);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a published exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {publishedExams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </SelectItem>
                    ))}
                    {publishedExams.length === 0 && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No published exams available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {streams.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Stream</label>
                  <Select value={selectedStream} onValueChange={setSelectedStream}>
                    <SelectTrigger>
                      <SelectValue placeholder="All streams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Streams</SelectItem>
                      {streams.map((stream) => (
                        <SelectItem key={stream} value={stream!}>
                          {stream}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Class</label>
                <Select value={selectedClass} onValueChange={(val) => {
                  setSelectedClass(val);
                  setSelectedStudents([]);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.stream && `- ${cls.stream}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end">
                {hasSelection && rankedStudents.length > 0 && (
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={handleGenerateSelected}
                      disabled={selectedStudents.length === 0 || isGenerating}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="mr-2 h-4 w-4" />
                      )}
                      Print ({selectedStudents.length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerateAll}
                      disabled={isGenerating}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      All
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {hasSelection && !isLoading && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="text-xl font-bold">{rankedStudents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class Average</p>
                    <p className="text-xl font-bold">{classSummary?.average || '-'}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Top Score</p>
                    <p className="text-xl font-bold">{classSummary?.highestAverage || '-'}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                    <p className="text-xl font-bold">{classSummary?.passRate || '-'}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Students Table */}
        {hasSelection && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedClassData?.name} - {selectedExamData?.name}
              </CardTitle>
              <CardDescription>
                Select students to generate report cards
                {classSummary?.topStudent && (
                  <span className="ml-2 text-green-600">
                    • Top Student: {classSummary.topStudent.name} ({classSummary.topStudent.average}%)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : rankedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No Results Available</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Scores have not been entered for this exam and class
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedStudents.length === rankedStudents.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Adm No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          {student.rank === 1 && (
                            <Badge className="bg-yellow-500 text-yellow-950">1st</Badge>
                          )}
                          {student.rank === 2 && (
                            <Badge className="bg-gray-400 text-gray-900">2nd</Badge>
                          )}
                          {student.rank === 3 && (
                            <Badge className="bg-amber-600 text-amber-50">3rd</Badge>
                          )}
                          {student.rank > 3 && (
                            <span className="text-muted-foreground">{student.rank}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.admission_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.subjectCount}</TableCell>
                        <TableCell className="font-medium">{student.totalMarks}</TableCell>
                        <TableCell>
                          <Badge variant={student.avgPercentage >= 50 ? 'default' : 'destructive'}>
                            {student.avgPercentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateReportCard(student)}
                            disabled={isGenerating}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Generate
                          </Button>
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
        {!hasSelection && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-semibold">Select Exam and Class</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Choose a published exam and class to generate report cards
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
