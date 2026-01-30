import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LessonDevelopmentStep } from '@/types/lesson-plans';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface AILessonAssistantProps {
  topic: string;
  subTopic?: string;
  subjectName: string;
  gradeLevel: string;
  durationMinutes: number;
  learningOutcomes?: string[];
  keyInquiryQuestions?: string[];
  onApply: (content: {
    introduction: string;
    lesson_development: LessonDevelopmentStep[];
    conclusion: string;
    assessment_questions?: string[];
  }) => void;
  disabled?: boolean;
}

interface GeneratedContent {
  introduction: string;
  lesson_development: LessonDevelopmentStep[];
  conclusion: string;
  assessment_questions?: string[];
  suggested_teaching_aids?: string[];
}

export function AILessonAssistant({
  topic,
  subTopic,
  subjectName,
  gradeLevel,
  durationMinutes,
  learningOutcomes = [],
  keyInquiryQuestions = [],
  onApply,
  disabled,
}: AILessonAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = async () => {
    if (!topic || !subjectName) {
      toast.error('Please enter a topic and select a subject first');
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson-content', {
        body: {
          topic,
          sub_topic: subTopic,
          subject_name: subjectName,
          grade_level: gradeLevel,
          duration_minutes: durationMinutes,
          learning_outcomes: learningOutcomes.filter(o => o.trim()),
          key_inquiry_questions: keyInquiryQuestions,
        },
      });

      if (error) {
        console.error('Error generating lesson content:', error);
        throw error;
      }

      if (data?.content) {
        setGeneratedContent(data.content);
        setShowPreview(true);
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate lesson content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedContent) {
      onApply({
        introduction: generatedContent.introduction,
        lesson_development: generatedContent.lesson_development.map((step, i) => ({
          ...step,
          step: i + 1,
        })),
        conclusion: generatedContent.conclusion,
        assessment_questions: generatedContent.assessment_questions,
      });
      setShowPreview(false);
      toast.success('AI content applied! Review and edit as needed.');
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={disabled || isGenerating || !topic}
        className="gap-2"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isGenerating ? 'Generating...' : 'AI Assist'}
      </Button>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Generated Lesson Content
            </DialogTitle>
            <DialogDescription>
              Review the generated content and apply it to your lesson plan.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {generatedContent && (
              <div className="space-y-6 py-4">
                {/* Introduction */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Introduction / Set Induction
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {generatedContent.introduction}
                  </p>
                </div>

                {/* Lesson Development */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Lesson Development Steps
                  </h4>
                  <div className="space-y-3">
                    {generatedContent.lesson_development.map((step, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 bg-muted/30"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">Step {step.step}</Badge>
                          <span className="font-medium text-sm">{step.activity}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {step.time}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Teacher Activity:
                            </p>
                            <p className="text-sm">{step.teacher_activity}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Learner Activity:
                            </p>
                            <p className="text-sm">{step.learner_activity}</p>
                          </div>
                        </div>
                        {step.resources && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Resources: {step.resources}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conclusion */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Conclusion
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {generatedContent.conclusion}
                  </p>
                </div>

                {/* Assessment Questions */}
                {generatedContent.assessment_questions && generatedContent.assessment_questions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Assessment Questions
                    </h4>
                    <ul className="list-decimal list-inside space-y-1 text-sm bg-muted/50 p-3 rounded-lg">
                      {generatedContent.assessment_questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Teaching Aids */}
                {generatedContent.suggested_teaching_aids && generatedContent.suggested_teaching_aids.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Suggested Teaching Aids
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.suggested_teaching_aids.map((aid, i) => (
                        <Badge key={i} variant="outline">
                          {aid}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleApply}>
              <Check className="h-4 w-4 mr-2" />
              Apply Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
