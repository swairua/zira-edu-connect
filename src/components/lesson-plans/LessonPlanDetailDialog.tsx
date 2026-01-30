import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, XCircle, Calendar, Clock, BookOpen, Target, Lightbulb, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useLessonPlanForReview } from '@/hooks/useLessonPlanApprovals';
import { lessonPlanStatusLabels } from '@/types/lesson-plans';

interface LessonPlanDetailDialogProps {
  planId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isApproving?: boolean;
}

export function LessonPlanDetailDialog({
  planId,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isApproving,
}: LessonPlanDetailDialogProps) {
  const { data: plan, isLoading } = useLessonPlanForReview(planId ?? undefined);

  const isPending = plan?.status === 'submitted';

  // Parse JSON fields safely
  const lessonObjectives = Array.isArray(plan?.lesson_objectives) 
    ? plan.lesson_objectives 
    : [];
  
  const lessonDevelopment = Array.isArray(plan?.lesson_development) 
    ? plan.lesson_development 
    : [];

  const teachingAids = Array.isArray(plan?.teaching_aids) 
    ? plan.teaching_aids 
    : [];

  const assessmentMethods = Array.isArray(plan?.assessment_methods) 
    ? plan.assessment_methods 
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl sm:max-w-3xl max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lesson Plan Review
          </DialogTitle>
          <DialogDescription>
            Review the lesson plan details before making a decision
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : plan ? (
          <ScrollArea className="flex-1 max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Teacher</p>
                  <p className="font-medium">
                    {plan.teacher?.first_name} {plan.teacher?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{plan.subject?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{plan.class?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline">
                    {lessonPlanStatusLabels[plan.status]}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Timing */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Lesson Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p>{plan.lesson_date ? format(new Date(plan.lesson_date), 'MMM d, yyyy') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p>{plan.duration_minutes} minutes</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Week</p>
                    <p>{plan.week_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lesson #</p>
                    <p>{plan.lesson_number || '-'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Topic */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Topic
                </h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium">{plan.topic}</p>
                  {plan.sub_topic && (
                    <p className="text-sm text-muted-foreground mt-1">{plan.sub_topic}</p>
                  )}
                </div>
              </div>

              {/* CBC Alignment */}
              {(plan.strand || plan.sub_strand) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">CBC Alignment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.strand && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Strand</p>
                          <p className="font-medium">{plan.strand.name}</p>
                        </div>
                      )}
                      {plan.sub_strand && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Sub-Strand</p>
                          <p className="font-medium">{plan.sub_strand.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Objectives */}
              {lessonObjectives.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Learning Objectives
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {lessonObjectives.map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Introduction */}
              {plan.introduction && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Introduction</h4>
                    <p className="text-sm whitespace-pre-wrap">{plan.introduction}</p>
                  </div>
                </>
              )}

              {/* Lesson Development */}
              {lessonDevelopment.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Lesson Development
                    </h4>
                    <div className="space-y-3">
                      {lessonDevelopment.map((step: any, i: number) => (
                        <div key={i} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Step {step.step || i + 1}</Badge>
                            {step.time && <span className="text-sm text-muted-foreground">{step.time}</span>}
                          </div>
                          <p className="text-sm">{step.activity}</p>
                          {step.teacher_activity && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>Teacher:</strong> {step.teacher_activity}
                            </p>
                          )}
                          {step.learner_activity && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Learners:</strong> {step.learner_activity}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Conclusion */}
              {plan.conclusion && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Conclusion</h4>
                    <p className="text-sm whitespace-pre-wrap">{plan.conclusion}</p>
                  </div>
                </>
              )}

              {/* Teaching Aids */}
              {teachingAids.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Teaching Aids
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {teachingAids.map((aid: any, i: number) => (
                        <Badge key={i} variant="outline">
                          {typeof aid === 'string' ? aid : aid.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Core Competencies & Values */}
              {(plan.core_competencies?.length > 0 || plan.values?.length > 0) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      CBC Elements
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.core_competencies?.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Core Competencies</p>
                          <div className="flex flex-wrap gap-1">
                            {plan.core_competencies.map((comp: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {comp.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {plan.values?.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Values</p>
                          <div className="flex flex-wrap gap-1">
                            {plan.values.map((value: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {value.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Assessment */}
              {assessmentMethods.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Assessment Methods</h4>
                    <div className="flex flex-wrap gap-2">
                      {assessmentMethods.map((method: any, i: number) => (
                        <Badge key={i} variant="outline">
                          {typeof method === 'string' ? method : method.method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Rejection Reason (if rejected) */}
              {plan.status === 'rejected' && plan.rejection_reason && (
                <>
                  <Separator />
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-destructive">Rejection Reason</h4>
                    <p className="text-sm">{plan.rejection_reason}</p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Lesson plan not found
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isPending && onApprove && onReject && planId && (
            <>
              <Button
                variant="destructive"
                onClick={() => onReject(planId)}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() => onApprove(planId)}
                disabled={isApproving}
                className="gap-2"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
