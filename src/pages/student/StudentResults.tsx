import { StudentLayout } from '@/components/student/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentResults } from '@/hooks/useStudentData';
import { useQueryClient } from '@tanstack/react-query';
import { Award, TrendingUp } from 'lucide-react';
import { getGradeColor, getGradeDescription } from '@/lib/grade-utils';

export default function StudentResults() {
  const queryClient = useQueryClient();
  const { data: results = [], isLoading } = useStudentResults();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['student-results'] });
  };

  // Group results by exam
  const groupedResults = results.reduce((acc, result) => {
    const exam = result.exams as any;
    const examId = exam?.id || 'unknown';
    if (!acc[examId]) {
      acc[examId] = {
        exam: exam,
        scores: [],
      };
    }
    acc[examId].scores.push(result);
    return acc;
  }, {} as Record<string, { exam: any; scores: typeof results }>);

  return (
    <StudentLayout title="Results" onRefresh={handleRefresh}>
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No results yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your exam results will appear here once they are published
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.values(groupedResults).map(({ exam, scores }) => {
            const totalMarks = scores.reduce((sum, s) => sum + (s.marks || 0), 0);
            const maxPossible = scores.length * (exam?.max_marks || 100);
            const percentage = maxPossible > 0 ? Math.round((totalMarks / maxPossible) * 100) : 0;

            return (
              <Card key={exam?.id || 'unknown'}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{exam?.name || 'Unknown Exam'}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exam?.terms?.name} • {exam?.academic_years?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        {percentage}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {totalMarks}/{maxPossible}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scores.map((score) => {
                      const subject = score.subjects as any;
                      return (
                        <div 
                          key={score.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium text-sm">{subject?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{subject?.code}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              {score.marks || 0}/{exam?.max_marks || 100}
                            </span>
                            <Badge 
                              className={getGradeColor(score.grade)}
                              title={getGradeDescription(score.grade)}
                            >
                              {score.grade || '-'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </StudentLayout>
  );
}
