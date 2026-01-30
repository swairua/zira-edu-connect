import { useState } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, Search, Filter, BookOpen, Trash2, Edit, Copy, Upload, Download, MoreVertical, Sparkles, Brain } from 'lucide-react';
import { useQuestions, useCreateQuestion, useDeleteQuestion } from '@/hooks/useQuestionBank';
import { useSubjects } from '@/hooks/useSubjects';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { DifficultyLevel, QuestionType, CognitiveLevel, QUESTION_TEMPLATES, QuestionTemplate } from '@/types/question-bank';
import { BulkQuestionImportDialog } from '@/components/question-bank/BulkQuestionImportDialog';
import { BulkQuestionUpdateDialog } from '@/components/question-bank/BulkQuestionUpdateDialog';
import { AIQuestionGenerator } from '@/components/question-bank/AIQuestionGenerator';
import { SampleQuestionsCard } from '@/components/question-bank/SampleQuestionsCard';
import { toast } from 'sonner';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer', label: 'Long Answer' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'true_false', label: 'True/False' },
  { value: 'matching', label: 'Matching' },
];

const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' },
];

const COGNITIVE_LEVELS: { value: CognitiveLevel; label: string }[] = [
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'comprehension', label: 'Comprehension' },
  { value: 'application', label: 'Application' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'synthesis', label: 'Synthesis' },
  { value: 'evaluation', label: 'Evaluation' },
];

const getDefaultFormData = () => ({
  subject_id: '',
  topic: '',
  question_type: 'multiple_choice' as QuestionType,
  question_text: '',
  options: [
    { label: 'A', text: '', is_correct: false },
    { label: 'B', text: '', is_correct: false },
    { label: 'C', text: '', is_correct: false },
    { label: 'D', text: '', is_correct: false },
  ],
  correct_answer: '',
  marks: 1,
  difficulty: 'medium' as DifficultyLevel,
  cognitive_level: 'knowledge' as CognitiveLevel,
  explanation: '',
});

export default function QuestionBank() {
  const { institution } = useInstitution();
  const { data: profile } = useStaffProfile();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const { data: questions = [], isLoading, refetch } = useQuestions({
    subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
    difficulty: difficultyFilter !== 'all' ? difficultyFilter as DifficultyLevel : undefined,
    questionType: typeFilter !== 'all' ? typeFilter as QuestionType : undefined,
    isActive: true,
  });

  const { data: subjects = [] } = useSubjects(institution?.id || null);
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [formData, setFormData] = useState(getDefaultFormData());

  const handleSubmit = async () => {
    if (!institution?.id || !profile?.id) return;

    await createQuestion.mutateAsync({
      institution_id: institution.id,
      subject_id: formData.subject_id,
      topic: formData.topic,
      question_type: formData.question_type,
      question_text: formData.question_text,
      options: formData.question_type === 'multiple_choice' ? formData.options : null,
      correct_answer: formData.question_type !== 'multiple_choice' ? formData.correct_answer : null,
      marks: formData.marks,
      difficulty: formData.difficulty,
      cognitive_level: formData.cognitive_level,
      explanation: formData.explanation || null,
      created_by: profile.id,
    });

    setShowCreateDialog(false);
    setFormData(getDefaultFormData());
  };

  const handleTemplateSelect = (template: QuestionTemplate) => {
    setFormData({
      ...getDefaultFormData(),
      question_type: template.questionType,
      difficulty: template.difficulty,
      cognitive_level: template.cognitiveLevel,
      marks: template.defaultMarks,
      options: template.optionCount
        ? Array.from({ length: template.optionCount }, (_, i) => ({
            label: String.fromCharCode(65 + i),
            text: '',
            is_correct: false,
          }))
        : getDefaultFormData().options,
    });
    setShowTemplateSelector(false);
    setShowCreateDialog(true);
  };

  const handleCloneQuestion = (question: typeof questions[0]) => {
    setFormData({
      subject_id: question.subject_id,
      topic: question.topic || '',
      question_type: question.question_type,
      question_text: question.question_text + ' (Copy)',
      options: question.options
        ? (question.options as Array<{ label: string; text: string; is_correct: boolean }>)
        : getDefaultFormData().options,
      correct_answer: question.correct_answer || '',
      marks: question.marks,
      difficulty: question.difficulty,
      cognitive_level: question.cognitive_level,
      explanation: question.explanation || '',
    });
    setShowCreateDialog(true);
  };

  const filteredQuestions = questions.filter(q =>
    q.question_text.toLowerCase().includes(search.toLowerCase()) ||
    q.topic?.toLowerCase().includes(search.toLowerCase())
  );

  const getDifficultyBadge = (difficulty: DifficultyLevel) => {
    const level = DIFFICULTY_LEVELS.find(d => d.value === difficulty);
    return <Badge className={level?.color}>{level?.label}</Badge>;
  };

  return (
    <PortalLayout title="Question Bank" subtitle="Manage exam questions by subject and topic">
      <div className="space-y-4 p-4 md:p-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background">
                <DropdownMenuItem onClick={() => setShowBulkImport(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import from CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowBulkUpdate(true)}
                  disabled={questions.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Bulk Update (Export/Reimport)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background">
                <DropdownMenuItem onClick={() => setShowAIGenerator(true)}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate with AI
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowTemplateSelector(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Use Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Blank Question
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {DIFFICULTY_LEVELS.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {QUESTION_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sample Questions Card + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <SampleQuestionsCard onClone={() => refetch()} />
          </div>
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{questions.length}</div>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">
                    {questions.filter(q => q.difficulty === 'easy').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Easy</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">
                    {questions.filter(q => q.difficulty === 'medium').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Medium</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">
                    {questions.filter(q => q.difficulty === 'hard').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Hard</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No questions found</h3>
              <p className="text-muted-foreground">Create your first question to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map(question => (
              <Card key={question.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline">{question.subject?.name || 'No Subject'}</Badge>
                        {getDifficultyBadge(question.difficulty)}
                        <Badge variant="secondary">
                          {QUESTION_TYPES.find(t => t.value === question.question_type)?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{question.marks} mark(s)</span>
                      </div>
                      <p className="text-sm mb-2">{question.question_text}</p>
                      {question.topic && (
                        <p className="text-xs text-muted-foreground">Topic: {question.topic}</p>
                      )}
                      {question.options && (
                        <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
                          {(question.options as Array<{label: string; text: string; is_correct?: boolean}>).map((opt, i) => (
                            <div key={i} className={`p-1 rounded ${opt.is_correct ? 'bg-green-50 text-green-700' : ''}`}>
                              {opt.label}. {opt.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCloneQuestion(question)}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteQuestion.mutate(question.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Template Selector Dialog */}
        <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {QUESTION_TEMPLATES.map(template => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-1 text-left"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{template.icon}</span>
                    <span className="font-medium">{template.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {template.defaultMarks} mark(s) • {template.difficulty}
                  </span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subject *</Label>
                    <Select
                      value={formData.subject_id}
                      onValueChange={(v) => setFormData({ ...formData, subject_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Topic</Label>
                    <Input
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g., Fractions"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Question Type *</Label>
                    <Select
                      value={formData.question_type}
                      onValueChange={(v) => setFormData({ ...formData, question_type: v as QuestionType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Difficulty *</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(v) => setFormData({ ...formData, difficulty: v as DifficultyLevel })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map(d => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Marks *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Question Text *</Label>
                  <Textarea
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    placeholder="Enter the question..."
                    rows={3}
                  />
                </div>

                {formData.question_type === 'multiple_choice' && (
                  <div>
                    <Label>Options (click to mark correct)</Label>
                    <div className="space-y-2 mt-2">
                      {formData.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant={opt.is_correct ? 'default' : 'outline'}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => {
                              const newOptions = formData.options.map((o, j) => ({
                                ...o,
                                is_correct: j === i,
                              }));
                              setFormData({ ...formData, options: newOptions });
                            }}
                          >
                            {opt.label}
                          </Button>
                          <Input
                            value={opt.text}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[i].text = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                            placeholder={`Option ${opt.label}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.question_type !== 'multiple_choice' && (
                  <div>
                    <Label>Correct Answer</Label>
                    <Textarea
                      value={formData.correct_answer}
                      onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                      placeholder="Enter the expected answer..."
                      rows={2}
                    />
                  </div>
                )}

                <div>
                  <Label>Cognitive Level</Label>
                  <Select
                    value={formData.cognitive_level}
                    onValueChange={(v) => setFormData({ ...formData, cognitive_level: v as CognitiveLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COGNITIVE_LEVELS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Explanation / Marking Guide</Label>
                  <Textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="How to mark this question..."
                    rows={2}
                  />
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.subject_id || !formData.question_text || createQuestion.isPending}
              >
                {createQuestion.isPending ? 'Saving...' : 'Save Question'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Import Dialog */}
        <BulkQuestionImportDialog
          open={showBulkImport}
          onOpenChange={setShowBulkImport}
          onSuccess={() => refetch()}
        />

        {/* Bulk Update Dialog */}
        <BulkQuestionUpdateDialog
          open={showBulkUpdate}
          onOpenChange={setShowBulkUpdate}
          questions={questions}
          onSuccess={() => refetch()}
        />

        {/* AI Question Generator */}
        <AIQuestionGenerator
          open={showAIGenerator}
          onOpenChange={setShowAIGenerator}
          onSuccess={() => refetch()}
        />
      </div>
    </PortalLayout>
  );
}