import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Copy, Sparkles, GraduationCap, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateQuestion } from '@/hooks/useQuestionBank';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { toast } from 'sonner';

interface SampleQuestion {
  id: string;
  topic: string;
  question_type: string;
  question_text: string;
  options: { label: string; text: string; is_correct: boolean }[] | null;
  correct_answer: string | null;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cognitive_level: string;
  explanation: string | null;
  tags: string[];
  sub_strand_id: string | null;
  subject: { name: string; code: string } | null;
  sub_strand: { name: string; strand: { name: string; subject_code: string } } | null;
}

interface SampleQuestionsCardProps {
  onClone?: () => void;
}

export function SampleQuestionsCard({ onClone }: SampleQuestionsCardProps) {
  const { institution } = useInstitution();
  const { data: profile } = useStaffProfile();
  const createQuestion = useCreateQuestion();
  
  const [showBrowser, setShowBrowser] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [cloning, setCloning] = useState<string | null>(null);

  // Fetch sample questions (questions tagged with 'sample')
  const { data: sampleQuestions = [], isLoading } = useQuery({
    queryKey: ['sample-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_bank')
        .select(`
          id, topic, question_type, question_text, options, correct_answer,
          marks, difficulty, cognitive_level, explanation, tags, sub_strand_id,
          subject:subjects(name, code),
          sub_strand:cbc_sub_strands(name, strand:cbc_strands(name, subject_code))
        `)
        .contains('tags', ['sample'])
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as SampleQuestion[];
    },
  });

  // Get user's subjects
  const { data: userSubjects = [] } = useQuery({
    queryKey: ['user-subjects', institution?.id],
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

  const handleClone = async (question: SampleQuestion) => {
    if (!institution?.id || !profile?.id) return;

    // Find matching subject in user's institution
    const subjectCode = question.sub_strand?.strand?.subject_code || question.subject?.code;
    const matchingSubject = userSubjects.find(s => s.code?.toUpperCase() === subjectCode?.toUpperCase());
    
    if (!matchingSubject) {
      toast.error(`Subject ${subjectCode} not found in your institution. Please add it first.`);
      return;
    }

    setCloning(question.id);
    try {
      await createQuestion.mutateAsync({
        institution_id: institution.id,
        subject_id: matchingSubject.id,
        sub_strand_id: question.sub_strand_id,
        topic: question.topic,
        question_type: question.question_type,
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        marks: question.marks,
        difficulty: question.difficulty,
        cognitive_level: question.cognitive_level,
        explanation: question.explanation,
        created_by: profile.id,
        tags: ['cloned-from-sample'],
      });

      toast.success('Question cloned to your bank!');
      onClone?.();
    } catch (error) {
      console.error('Clone error:', error);
      toast.error('Failed to clone question');
    } finally {
      setCloning(null);
    }
  };

  const filteredQuestions = sampleQuestions.filter(q => {
    const subjectCode = q.sub_strand?.strand?.subject_code || q.subject?.code;
    if (subjectFilter !== 'all' && subjectCode !== subjectFilter) return false;
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  const uniqueSubjects = [...new Set(sampleQuestions.map(q => 
    q.sub_strand?.strand?.subject_code || q.subject?.code
  ).filter(Boolean))];

  const getDifficultyColor = (d: string) => {
    return d === 'easy' ? 'bg-green-100 text-green-800' 
         : d === 'medium' ? 'bg-yellow-100 text-yellow-800' 
         : 'bg-red-100 text-red-800';
  };

  if (sampleQuestions.length === 0 && !isLoading) {
    return null; // Don't show card if no sample questions
  }

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            CBC Sample Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Browse {sampleQuestions.length} curriculum-aligned template questions and clone them to your bank.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBrowser(true)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Samples
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showBrowser} onOpenChange={setShowBrowser}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              CBC Sample Question Library
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-2 py-2 border-b">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map(code => (
                  <SelectItem key={code} value={code!}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="secondary" className="ml-auto">
              {filteredQuestions.length} questions
            </Badge>
          </div>

          <DialogBody className="flex-1 min-h-0">
            <ScrollArea className="h-[450px] pr-4">
              <div className="space-y-3">
                {filteredQuestions.map(question => (
                  <Card key={question.id} className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline">
                            {question.sub_strand?.strand?.subject_code || question.subject?.code}
                          </Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="secondary">{question.marks} mark(s)</Badge>
                          {question.sub_strand && (
                            <span className="text-xs text-muted-foreground">
                              {question.sub_strand.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-2">{question.question_text}</p>
                        {question.options && (
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {question.options.map((opt, i) => (
                              <div key={i} className={`p-1 rounded ${opt.is_correct ? 'bg-green-50 text-green-700' : ''}`}>
                                {opt.label}. {opt.text}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.correct_answer && (
                          <p className="text-xs text-green-600 mt-1">Answer: {question.correct_answer}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClone(question)}
                        disabled={cloning === question.id}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        {cloning === question.id ? 'Cloning...' : 'Clone'}
                      </Button>
                    </div>
                  </Card>
                ))}
                
                {filteredQuestions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sample questions match your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogBody>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBrowser(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
