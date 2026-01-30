import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStudentStrandPerformance } from '@/hooks/useCBCStrands';
import { CBCLevel, cbcRubricLabels, subjectCodeLabels } from '@/types/cbc';
import { Loader2, TrendingUp, BookOpen } from 'lucide-react';

interface CBCPerformanceCardProps {
  studentId: string;
  subjectCode?: string;
  level?: CBCLevel;
  className?: string;
}

export function CBCPerformanceCard({
  studentId,
  subjectCode,
  level,
  className,
}: CBCPerformanceCardProps) {
  const { data: performance, isLoading } = useStudentStrandPerformance(studentId, subjectCode, level);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!performance || performance.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No CBC assessments recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  // Group by subject
  const bySubject = performance.reduce((acc, strand) => {
    if (!acc[strand.subject_code]) {
      acc[strand.subject_code] = [];
    }
    acc[strand.subject_code].push(strand);
    return acc;
  }, {} as Record<string, typeof performance>);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          CBC Strand Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(bySubject).map(([code, strands]) => (
          <div key={code} className="space-y-2">
            <h4 className="font-medium text-sm">{subjectCodeLabels[code] || code}</h4>
            <div className="space-y-2">
              {strands.map((strand) => {
                const total = Object.values(strand.rubric_distribution).reduce((a, b) => a + b, 0);
                const eePercent = total > 0 ? (strand.rubric_distribution.EE / total) * 100 : 0;
                const mePercent = total > 0 ? (strand.rubric_distribution.ME / total) * 100 : 0;
                const aePercent = total > 0 ? (strand.rubric_distribution.AE / total) * 100 : 0;
                const bePercent = total > 0 ? (strand.rubric_distribution.BE / total) * 100 : 0;

                return (
                  <div key={strand.id} className="p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">
                        {strand.strand_number}. {strand.name}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {strand.assessment_count} assessments
                      </Badge>
                    </div>
                    
                    {total > 0 ? (
                      <>
                        {/* Stacked progress bar */}
                        <div className="h-2 flex rounded-full overflow-hidden bg-muted">
                          <div 
                            className="bg-green-500 transition-all" 
                            style={{ width: `${eePercent}%` }} 
                            title={`EE: ${strand.rubric_distribution.EE}`}
                          />
                          <div 
                            className="bg-blue-500 transition-all" 
                            style={{ width: `${mePercent}%` }}
                            title={`ME: ${strand.rubric_distribution.ME}`}
                          />
                          <div 
                            className="bg-yellow-500 transition-all" 
                            style={{ width: `${aePercent}%` }}
                            title={`AE: ${strand.rubric_distribution.AE}`}
                          />
                          <div 
                            className="bg-red-500 transition-all" 
                            style={{ width: `${bePercent}%` }}
                            title={`BE: ${strand.rubric_distribution.BE}`}
                          />
                        </div>
                        
                        {/* Legend */}
                        <div className="flex gap-2 mt-1.5 text-[10px]">
                          {strand.rubric_distribution.EE > 0 && (
                            <span className="flex items-center gap-0.5">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              EE:{strand.rubric_distribution.EE}
                            </span>
                          )}
                          {strand.rubric_distribution.ME > 0 && (
                            <span className="flex items-center gap-0.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              ME:{strand.rubric_distribution.ME}
                            </span>
                          )}
                          {strand.rubric_distribution.AE > 0 && (
                            <span className="flex items-center gap-0.5">
                              <span className="w-2 h-2 rounded-full bg-yellow-500" />
                              AE:{strand.rubric_distribution.AE}
                            </span>
                          )}
                          {strand.rubric_distribution.BE > 0 && (
                            <span className="flex items-center gap-0.5">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              BE:{strand.rubric_distribution.BE}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic">No assessments</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Rubric Legend */}
        <div className="pt-2 border-t">
          <p className="text-[10px] text-muted-foreground mb-1">Rubric Levels:</p>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              EE: Exceeds
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              ME: Meets
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              AE: Approaches
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              BE: Below
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
