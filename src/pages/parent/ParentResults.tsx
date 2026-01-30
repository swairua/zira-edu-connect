import { useState } from 'react';
import { ParentLayout } from '@/components/parent/ParentLayout';
import { NoStudentLinked } from '@/components/parent/NoStudentLinked';
import { ErrorCard } from '@/components/parent/ErrorCard';
import { useParent } from '@/contexts/ParentContext';
import { useStudentResultsForParent } from '@/hooks/useParentData';
import { useParentReportCard } from '@/hooks/useParentReportCard';
import { generateReportCardPDF } from '@/lib/pdf-generators';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Download, Loader2 } from 'lucide-react';
import type { StudentScore, ExamGroup, Exam } from '@/types/parent';

export default function ParentResults() {
  const { selectedStudent, isLoading: parentLoading } = useParent();
  
  const { 
    data: results = [], 
    isLoading, 
    error,
    refetch,
  } = useStudentResultsForParent(
    selectedStudent?.id || null,
    selectedStudent?.institution_id || null
  );

  const isRefreshing = isLoading;

  // Group results by exam with proper typing
  const resultsByExam = (results as StudentScore[]).reduce<Record<string, ExamGroup>>((acc, score) => {
    const examId = score.exams?.id;
    if (!examId || !score.exams) return acc;
    
    if (!acc[examId]) {
      acc[examId] = {
        exam: score.exams,
        scores: [],
      };
    }
    acc[examId].scores.push(score);
    return acc;
  }, {});

  // Calculate averages for each exam group
  const exams: ExamGroup[] = Object.values(resultsByExam).map(group => {
    const validScores = group.scores.filter(s => s.marks !== null);
    const maxMarks = group.exam.max_marks || 100;
    const average = validScores.length > 0
      ? validScores.reduce((sum, s) => sum + ((s.marks || 0) / maxMarks) * 100, 0) / validScores.length
      : undefined;
    return { ...group, average };
  });

  // State for downloading report card
  const [downloadingExamId, setDownloadingExamId] = useState<string | null>(null);

  const handleDownloadReportCard = async (examId: string) => {
    if (!selectedStudent) return;
    
    setDownloadingExamId(examId);
    
    try {
      // Fetch report card data
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/get_parent_report_card_data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_student_id: selectedStudent.id,
            p_exam_id: examId,
          }),
        }
      );
      
      // Find exam data from our already loaded data
      const examGroup = exams.find(e => e.exam.id === examId);
      if (!examGroup) {
        throw new Error('Exam not found');
      }
      
      // Build scores array
      const scores = examGroup.scores.map(score => ({
        subject: score.subjects?.name || 'Unknown',
        marks: score.marks || 0,
        grade: score.grade || '-',
        remarks: '',
      }));
      
      const totalMarks = scores.reduce((sum, s) => sum + s.marks, 0);
      const maxPossible = (examGroup.exam.max_marks || 100) * scores.length;
      const average = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;
      
      // Generate PDF
      generateReportCardPDF({
        student: {
          first_name: selectedStudent.first_name,
          last_name: selectedStudent.last_name,
          admission_number: selectedStudent.admission_number,
          className: selectedStudent.class_name,
        },
        exam: examGroup.exam,
        scores,
        average,
        institution: {
          name: 'School', // Will be populated from context if available
        },
      });
    } catch (error) {
      console.error('Error generating report card:', error);
    } finally {
      setDownloadingExamId(null);
    }
  };
  if (!parentLoading && !selectedStudent) {
    return (
      <ParentLayout title="Results">
        <div className="p-4">
          <NoStudentLinked />
        </div>
      </ParentLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <ParentLayout title="Results">
        <div className="p-4">
          <ErrorCard 
            title="Couldn't load results"
            message="We couldn't load your exam results. Please try again."
            onRetry={() => refetch()}
          />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout 
      title="Results"
      onRefresh={() => refetch()}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-4 p-4">
        {isLoading ? (
          [1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <GraduationCap className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Results Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Released exam results will appear here. Check back after exams are graded.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          exams.map((examGroup) => (
            <Card key={examGroup.exam.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {examGroup.exam.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {examGroup.exam.academic_years?.name} • {examGroup.exam.terms?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{examGroup.exam.exam_type}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReportCard(examGroup.exam.id)}
                      disabled={downloadingExamId === examGroup.exam.id}
                      className="gap-1"
                    >
                      {downloadingExamId === examGroup.exam.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      Report
                    </Button>
                  </div>
                </div>
                {examGroup.average !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Average:</span>
                    <Badge 
                      variant={examGroup.average >= 70 ? 'default' : 'secondary'}
                      aria-label={`Average score: ${examGroup.average.toFixed(1)} percent`}
                    >
                      {examGroup.average.toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2" role="list" aria-label="Subject scores">
                  {examGroup.scores.map((score) => (
                    <div 
                      key={score.id} 
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                      role="listitem"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <div>
                          <span className="text-sm font-medium">
                            {score.subjects?.name}
                          </span>
                          {score.subjects?.code && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({score.subjects.code})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {score.marks ?? '-'}/{examGroup.exam.max_marks || 100}
                        </span>
                        <Badge 
                          variant={score.grade?.startsWith('A') ? 'default' : 'secondary'}
                          className="min-w-[2.5rem] justify-center"
                          aria-label={`Grade: ${score.grade || 'Not graded'}`}
                        >
                          {score.grade || '-'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ParentLayout>
  );
}
