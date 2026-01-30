import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Loader2, Check, X, BookOpen, Brain } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateQuestion } from '@/hooks/useQuestionBank';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { toast } from 'sonner';
import { CBCLevel, cbcLevelLabels } from '@/types/cbc';
import { DifficultyLevel, QuestionType, CognitiveLevel } from '@/types/question-bank';

interface AIQuestionGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId?: string;
  onSuccess?: () => void;
}

interface GeneratedQuestion {
  question_text: string;
  options?: { label: string; text: string; is_correct: boolean }[];
  correct_answer?: string;
  explanation: string;
  marks: number;
  topic: string;
  question_type: QuestionType;
  difficulty: DifficultyLevel;
  cognitive_level: CognitiveLevel;
  sub_strand_id: string;
  selected?: boolean;
}

const SUBJECT_CODES = ['MATH', 'ENG', 'SCI', 'SST', 'KIS', 'CRE', 'IRE', 'ART', 'MUSIC', 'PE'];
const CBC_LEVELS: CBCLevel[] = ['grade_4', 'grade_5', 'grade_6', 'grade_7', 'grade_8', 'grade_9'];

export function AIQuestionGenerator({ open, onOpenChange, subjectId, onSuccess }: AIQuestionGeneratorProps) {
  const { institution } = useInstitution();
  const { data: profile } = useStaffProfile();
  const createQuestion = useCreateQuestion();

  const [step, setStep] = useState<'configure' | 'review'>('configure');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);

  // Configuration state
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('MATH');
  const [selectedLevel, setSelectedLevel] = useState<CBCLevel>('grade_4');
  const [selectedStrandId, setSelectedStrandId] = useState('');
  const [selectedSubStrandId, setSelectedSubStrandId] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevel>('knowledge');
  const [count, setCount] = useState(3);

  // Fetch strands for selected subject and level
  const { data: strands = [] } = useQuery({
    queryKey: ['cbc-strands', selectedSubjectCode, selectedLevel],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cbc_strands')
        .select('id, name, strand_number')
        .eq('subject_code', selectedSubjectCode)
        .eq('level', selectedLevel)
        .order('strand_number');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSubjectCode && !!selectedLevel,
  });

  // Fetch sub-strands for selected strand
  const { data: subStrands = [] } = useQuery({
    queryKey: ['cbc-sub-strands', selectedStrandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cbc_sub_strands')
        .select('id, name, sub_strand_number, specific_learning_outcomes')
        .eq('strand_id', selectedStrandId)
        .order('sub_strand_number');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStrandId,
  });

  // Get subjects for the institution to map codes to IDs
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-for-ai', institution?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, code, name')
        .eq('institution_id', institution!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!institution?.id,
  });

  const handleGenerate = async () => {
    if (!selectedSubStrandId) {
      toast.error('Please select a sub-strand');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-questions', {
        body: {
          sub_strand_id: selectedSubStrandId,
          question_type: questionType,
          difficulty,
          count,
          cognitive_level: cognitiveLevel,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate questions');
      }

      const { questions } = response.data;
      setGeneratedQuestions(
        questions.map((q: GeneratedQuestion) => ({ ...q, selected: true }))
      );
      setStep('review');
      toast.success(`Generated ${questions.length} questions!`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestionSelection = (index: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, selected: !q.selected } : q))
    );
  };

  const handleSaveSelected = async () => {
    const selectedQuestions = generatedQuestions.filter((q) => q.selected);
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question to save');
      return;
    }

    // Find the matching subject ID
    const matchingSubject = subjects.find(
      (s) => s.code?.toUpperCase() === selectedSubjectCode
    );
    if (!matchingSubject) {
      toast.error(`Subject ${selectedSubjectCode} not found in your institution. Please add it first.`);
      return;
    }

    try {
      for (const q of selectedQuestions) {
        await createQuestion.mutateAsync({
          institution_id: institution!.id,
          subject_id: subjectId || matchingSubject.id,
          sub_strand_id: q.sub_strand_id,
          topic: q.topic,
          question_type: q.question_type,
          question_text: q.question_text,
          options: q.options || null,
          correct_answer: q.correct_answer || null,
          marks: q.marks,
          difficulty: q.difficulty,
          cognitive_level: q.cognitive_level,
          explanation: q.explanation,
          created_by: profile!.id,
          tags: ['ai-generated', 'cbc-aligned'],
        });
      }

      toast.success(`Saved ${selectedQuestions.length} questions to your bank!`);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save some questions');
    }
  };

  const handleClose = () => {
    setStep('configure');
    setGeneratedQuestions([]);
    setSelectedStrandId('');
    setSelectedSubStrandId('');
    onOpenChange(false);
  };

  const selectedSubStrand = subStrands.find((ss) => ss.id === selectedSubStrandId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Question Generator
          </DialogTitle>
        </DialogHeader>

        {step === 'configure' ? (
          <>
            <DialogBody>
              <div className="space-y-6">
                {/* Subject & Level Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subject</Label>
                    <Select value={selectedSubjectCode} onValueChange={(v) => {
                      setSelectedSubjectCode(v);
                      setSelectedStrandId('');
                      setSelectedSubStrandId('');
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECT_CODES.map((code) => (
                          <SelectItem key={code} value={code}>{code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Grade Level</Label>
                    <Select value={selectedLevel} onValueChange={(v) => {
                      setSelectedLevel(v as CBCLevel);
                      setSelectedStrandId('');
                      setSelectedSubStrandId('');
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CBC_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {cbcLevelLabels[level]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Strand & Sub-Strand Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Strand</Label>
                    <Select value={selectedStrandId} onValueChange={(v) => {
                      setSelectedStrandId(v);
                      setSelectedSubStrandId('');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strand" />
                      </SelectTrigger>
                      <SelectContent>
                        {strands.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.strand_number}. {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sub-Strand *</Label>
                    <Select 
                      value={selectedSubStrandId} 
                      onValueChange={setSelectedSubStrandId}
                      disabled={!selectedStrandId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-strand" />
                      </SelectTrigger>
                      <SelectContent>
                        {subStrands.map((ss) => (
                          <SelectItem key={ss.id} value={ss.id}>
                            {ss.sub_strand_number}. {ss.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Learning Outcomes Preview */}
                {selectedSubStrand && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Learning Outcomes</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        {Array.isArray(selectedSubStrand.specific_learning_outcomes) 
                          ? selectedSubStrand.specific_learning_outcomes.slice(0, 3).map((o, i) => (
                              <li key={i}>{String(o)}</li>
                            ))
                          : <li>Learning outcomes available</li>
                        }
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Question Settings */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Question Type</Label>
                    <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="fill_blank">Fill in Blank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cognitive Level</Label>
                    <Select value={cognitiveLevel} onValueChange={(v) => setCognitiveLevel(v as CognitiveLevel)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="knowledge">Knowledge</SelectItem>
                        <SelectItem value="comprehension">Comprehension</SelectItem>
                        <SelectItem value="application">Application</SelectItem>
                        <SelectItem value="analysis">Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <Label>Number of Questions: {count}</Label>
                  <Slider
                    value={[count]}
                    onValueChange={([v]) => setCount(v)}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate 1-10 questions at a time
                  </p>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={handleGenerate} 
                disabled={!selectedSubStrandId || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogBody className="flex-1 min-h-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-medium">Review Generated Questions</span>
                </div>
                <Badge variant="outline">
                  {generatedQuestions.filter((q) => q.selected).length} of{' '}
                  {generatedQuestions.length} selected
                </Badge>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {generatedQuestions.map((q, index) => (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-colors ${
                        q.selected ? 'border-primary bg-primary/5' : 'opacity-60'
                      }`}
                      onClick={() => toggleQuestionSelection(index)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={q.selected}
                            onCheckedChange={() => toggleQuestionSelection(index)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline">{q.topic}</Badge>
                              <Badge
                                className={
                                  q.difficulty === 'easy'
                                    ? 'bg-green-100 text-green-800'
                                    : q.difficulty === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }
                              >
                                {q.difficulty}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {q.marks} mark(s)
                              </span>
                            </div>
                            <p className="text-sm mb-2">{q.question_text}</p>
                            {q.options && (
                              <div className="grid grid-cols-2 gap-1 text-sm">
                                {q.options.map((opt, i) => (
                                  <div
                                    key={i}
                                    className={`p-1 rounded text-xs ${
                                      opt.is_correct
                                        ? 'bg-green-50 text-green-700 font-medium'
                                        : ''
                                    }`}
                                  >
                                    {opt.label}. {opt.text}
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.correct_answer && (
                              <p className="text-xs text-green-600 mt-1">
                                Answer: {q.correct_answer}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('configure')}>
                <X className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSaveSelected}
                disabled={generatedQuestions.filter((q) => q.selected).length === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Save {generatedQuestions.filter((q) => q.selected).length} Question(s)
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
