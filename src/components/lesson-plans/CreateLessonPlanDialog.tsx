import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight, BookOpen, Target, Lightbulb, ClipboardList, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CBCStrandSelector } from '@/components/cbc/CBCStrandSelector';
import { useCreateLessonPlan, useUpdateLessonPlan } from '@/hooks/useLessonPlans';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useTeacherSubjects } from '@/hooks/useTeacherSubjects';
import { useTeacherClasses } from '@/hooks/useTeacherClasses';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useTerms } from '@/hooks/useTerms';
import { CBCLevel, cbcCompetencyLabels, cbcValueLabels, classNameToCBCLevel, subjectNameToCode, CBCStrand, CBCSubStrand, CBCCompetency, CBCValue } from '@/types/cbc';
import { TEACHING_METHODS, ASSESSMENT_METHODS, LessonDevelopmentStep } from '@/types/lesson-plans';
import { AILessonAssistant } from '@/components/lesson-plans/AILessonAssistant';

const lessonPlanSchema = z.object({
  subject_id: z.string().min(1, 'Subject is required'),
  class_id: z.string().min(1, 'Class is required'),
  lesson_date: z.date({ required_error: 'Date is required' }),
  duration_minutes: z.number().min(15).max(120),
  week_number: z.number().optional().nullable(),
  lesson_number: z.number().optional().nullable(),
  topic: z.string().min(3, 'Topic is required'),
  sub_topic: z.string().optional().nullable(),
  lesson_objectives: z.array(z.string()).min(1, 'At least one objective is required'),
  strand_id: z.string().optional().nullable(),
  sub_strand_id: z.string().optional().nullable(),
  introduction: z.string().optional().nullable(),
  lesson_development: z.array(z.object({
    step: z.number(),
    activity: z.string(),
    time: z.string(),
    teacher_activity: z.string().optional(),
    learner_activity: z.string().optional(),
    resources: z.string().optional(),
  })).optional(),
  conclusion: z.string().optional().nullable(),
  teaching_aids: z.array(z.object({
    name: z.string(),
    type: z.enum(['physical', 'digital', 'printed', 'other']),
  })).optional(),
  teaching_methods: z.array(z.string()).optional(),
  core_competencies: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  assessment_methods: z.array(z.object({
    method: z.string(),
    description: z.string().optional(),
  })).optional(),
  differentiation_notes: z.string().optional().nullable(),
  academic_year_id: z.string().optional().nullable(),
  term_id: z.string().optional().nullable(),
});

type LessonPlanFormData = z.infer<typeof lessonPlanSchema>;

interface CreateLessonPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPlan?: any; // For editing existing plans
}

const WIZARD_STEPS = [
  { id: 'basic', label: 'Basic Info', icon: BookOpen },
  { id: 'cbc', label: 'CBC Alignment', icon: Target },
  { id: 'content', label: 'Lesson Content', icon: Lightbulb },
  { id: 'resources', label: 'Resources & Methods', icon: ClipboardList },
];

export function CreateLessonPlanDialog({ open, onOpenChange, editPlan }: CreateLessonPlanDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStrand, setSelectedStrand] = useState<CBCStrand | null>(null);
  const [selectedSubStrand, setSelectedSubStrand] = useState<CBCSubStrand | null>(null);
  
  const { data: profile } = useStaffProfile();
  const { institutionId } = useInstitution();
  const { data: subjects = [] } = useTeacherSubjects();
  const { data: classes = [] } = useTeacherClasses();
  const { data: academicYears = [] } = useAcademicYears(institutionId);
  const { data: terms = [] } = useTerms();
  
  const createMutation = useCreateLessonPlan();
  const updateMutation = useUpdateLessonPlan();
  
  const form = useForm<LessonPlanFormData>({
    resolver: zodResolver(lessonPlanSchema),
    defaultValues: editPlan ? {
      ...editPlan,
      lesson_date: new Date(editPlan.lesson_date),
    } : {
      duration_minutes: 40,
      lesson_objectives: [''],
      lesson_development: [],
      teaching_aids: [],
      teaching_methods: [],
      core_competencies: [],
      values: [],
      assessment_methods: [],
    },
  });

  const watchSubjectId = form.watch('subject_id');
  const watchClassId = form.watch('class_id');
  
  // Derive subject code and CBC level from selections
  const selectedSubject = subjects.find(s => s.id === watchSubjectId);
  const selectedClass = classes.find(c => c.id === watchClassId);
  const subjectCode = selectedSubject ? subjectNameToCode(selectedSubject.name) : undefined;
  const cbcLevel = selectedClass ? classNameToCBCLevel(selectedClass.name) : undefined;

  const objectives = form.watch('lesson_objectives') || [''];
  const lessonDevelopment = form.watch('lesson_development') || [];
  const teachingAids = form.watch('teaching_aids') || [];
  const assessmentMethods = form.watch('assessment_methods') || [];

  const handleNext = async () => {
    const stepFields: Record<number, (keyof LessonPlanFormData)[]> = {
      0: ['subject_id', 'class_id', 'lesson_date', 'duration_minutes', 'topic'],
      1: [],
      2: ['lesson_objectives'],
      3: [],
    };
    
    const fieldsToValidate = stepFields[currentStep];
    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }
    
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: LessonPlanFormData) => {
    const payload = {
      ...data,
      lesson_date: format(data.lesson_date, 'yyyy-MM-dd'),
      teacher_id: profile?.id,
      strand_id: selectedStrand?.id || null,
      sub_strand_id: selectedSubStrand?.id || null,
    };
    
    if (editPlan) {
      updateMutation.mutate({ id: editPlan.id, ...payload }, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          setCurrentStep(0);
        },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          setCurrentStep(0);
        },
      });
    }
  };

  // Objective management
  const addObjective = () => {
    form.setValue('lesson_objectives', [...objectives, '']);
  };

  const removeObjective = (index: number) => {
    const updated = objectives.filter((_, i) => i !== index);
    form.setValue('lesson_objectives', updated.length > 0 ? updated : ['']);
  };

  const updateObjective = (index: number, value: string) => {
    const updated = [...objectives];
    updated[index] = value;
    form.setValue('lesson_objectives', updated);
  };

  // Lesson development steps
  const addDevelopmentStep = () => {
    const newStep: LessonDevelopmentStep = {
      step: lessonDevelopment.length + 1,
      activity: '',
      time: '5 min',
      teacher_activity: '',
      learner_activity: '',
    };
    form.setValue('lesson_development', [...lessonDevelopment, newStep]);
  };

  const removeDevelopmentStep = (index: number) => {
    const updated = lessonDevelopment.filter((_, i) => i !== index);
    form.setValue('lesson_development', updated.map((s, i) => ({ ...s, step: i + 1 })));
  };

  // Teaching aids management
  const addTeachingAid = () => {
    form.setValue('teaching_aids', [...teachingAids, { name: '', type: 'physical' as const }]);
  };

  const removeTeachingAid = (index: number) => {
    form.setValue('teaching_aids', teachingAids.filter((_, i) => i !== index));
  };

  // Assessment methods management
  const addAssessmentMethod = () => {
    form.setValue('assessment_methods', [...assessmentMethods, { method: '', description: '' }]);
  };

  const removeAssessmentMethod = (index: number) => {
    form.setValue('assessment_methods', assessmentMethods.filter((_, i) => i !== index));
  };

  // Auto-import learning outcomes when sub-strand is selected
  const handleSubStrandSelect = (subStrand: CBCSubStrand | null) => {
    setSelectedSubStrand(subStrand);
    if (subStrand && subStrand.specific_learning_outcomes?.length > 0) {
      const outcomes = subStrand.specific_learning_outcomes as string[];
      if (objectives.length === 1 && objectives[0] === '') {
        form.setValue('lesson_objectives', outcomes.slice(0, 3));
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{editPlan ? 'Edit Lesson Plan' : 'Create Lesson Plan'}</DialogTitle>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="px-6 py-3 border-b">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-2 flex-1',
                    index < WIZARD_STEPS.length - 1 && 'after:content-[""] after:flex-1 after:h-0.5 after:mx-2',
                    index < currentStep && 'after:bg-primary',
                    index >= currentStep && 'after:bg-muted'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium shrink-0',
                      index === currentStep && 'bg-primary text-primary-foreground',
                      index < currentStep && 'bg-primary text-primary-foreground',
                      index > currentStep && 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={cn(
                    'text-sm hidden md:block',
                    index === currentStep ? 'font-medium' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-4 space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subject_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="class_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lesson_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Lesson Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes) *</FormLabel>
                          <Select 
                            onValueChange={(v) => field.onChange(parseInt(v))} 
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[30, 35, 40, 45, 60, 80].map((mins) => (
                                <SelectItem key={mins} value={mins.toString()}>
                                  {mins} minutes
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="week_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Week Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 4" 
                              {...field} 
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lesson_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lesson Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 1" 
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Addition of Two-Digit Numbers" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sub_topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-topic</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Adding with regrouping" 
                            {...field} 
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="academic_year_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Academic Year</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="term_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select term" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {terms.map((term) => (
                                <SelectItem key={term.id} value={term.id}>
                                  {term.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: CBC Alignment */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {subjectCode && cbcLevel ? (
                    <>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Selecting a CBC strand and sub-strand helps align your lesson with the national curriculum standards.
                          Learning outcomes can be auto-imported to help define your objectives.
                        </p>
                      </div>
                      
                      <CBCStrandSelector
                        subjectCode={subjectCode}
                        level={cbcLevel as CBCLevel}
                        selectedStrandId={selectedStrand?.id}
                        selectedSubStrandId={selectedSubStrand?.id}
                        onStrandSelect={setSelectedStrand}
                        onSubStrandSelect={handleSubStrandSelect}
                      />
                      
                      {selectedSubStrand && (
                        <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                          <h4 className="font-medium text-sm">Selected Sub-Strand Details</h4>
                          
                          {selectedSubStrand.key_inquiry_questions && (selectedSubStrand.key_inquiry_questions as string[]).length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Key Inquiry Questions:</span>
                              <ul className="list-disc list-inside mt-1 text-sm">
                                {(selectedSubStrand.key_inquiry_questions as string[]).map((q, i) => (
                                  <li key={i}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {selectedSubStrand.learning_experiences && (selectedSubStrand.learning_experiences as string[]).length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Suggested Learning Experiences:</span>
                              <ul className="list-disc list-inside mt-1 text-sm">
                                {(selectedSubStrand.learning_experiences as string[]).slice(0, 3).map((exp, i) => (
                                  <li key={i}>{exp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center border rounded-lg bg-muted/30">
                      <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Select Subject and Class First</h3>
                      <p className="text-sm text-muted-foreground">
                        Go back to Basic Info and select a subject and class to enable CBC strand selection.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Lesson Content */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* AI Assistant Button */}
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI Lesson Assistant
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Generate introduction, activities, and conclusion automatically
                      </p>
                    </div>
                    <AILessonAssistant
                      topic={form.watch('topic') || ''}
                      subTopic={form.watch('sub_topic') || undefined}
                      subjectName={selectedSubject?.name || ''}
                      gradeLevel={selectedClass?.name || 'Grade 6'}
                      durationMinutes={form.watch('duration_minutes') || 40}
                      learningOutcomes={objectives.filter(o => o.trim())}
                      keyInquiryQuestions={selectedSubStrand?.key_inquiry_questions as string[] || []}
                      onApply={(content) => {
                        form.setValue('introduction', content.introduction);
                        form.setValue('lesson_development', content.lesson_development);
                        form.setValue('conclusion', content.conclusion);
                      }}
                      disabled={!form.watch('topic')}
                    />
                  </div>

                  {/* Objectives */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Learning Objectives *</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addObjective}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      By the end of the lesson, the learner should be able to...
                    </p>
                    {objectives.map((obj, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Objective ${index + 1}`}
                          value={obj}
                          onChange={(e) => updateObjective(index, e.target.value)}
                        />
                        {objectives.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeObjective(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {form.formState.errors.lesson_objectives && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.lesson_objectives.message}
                      </p>
                    )}
                  </div>

                  {/* Introduction */}
                  <FormField
                    control={form.control}
                    name="introduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Introduction / Set Induction</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How will you introduce the lesson? (e.g., questions, story, demonstration)"
                            {...field}
                            value={field.value ?? ''}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Lesson Development */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Lesson Development Steps</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addDevelopmentStep}>
                        <Plus className="h-3 w-3 mr-1" /> Add Step
                      </Button>
                    </div>
                    
                    {lessonDevelopment.map((step, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">Step {step.step}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDevelopmentStep(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Activity name"
                            value={step.activity}
                            onChange={(e) => {
                              const updated = [...lessonDevelopment];
                              updated[index] = { ...step, activity: e.target.value };
                              form.setValue('lesson_development', updated);
                            }}
                          />
                          <Input
                            placeholder="Time (e.g., 10 min)"
                            value={step.time}
                            onChange={(e) => {
                              const updated = [...lessonDevelopment];
                              updated[index] = { ...step, time: e.target.value };
                              form.setValue('lesson_development', updated);
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Textarea
                            placeholder="Teacher activity"
                            value={step.teacher_activity || ''}
                            onChange={(e) => {
                              const updated = [...lessonDevelopment];
                              updated[index] = { ...step, teacher_activity: e.target.value };
                              form.setValue('lesson_development', updated);
                            }}
                            rows={2}
                          />
                          <Textarea
                            placeholder="Learner activity"
                            value={step.learner_activity || ''}
                            onChange={(e) => {
                              const updated = [...lessonDevelopment];
                              updated[index] = { ...step, learner_activity: e.target.value };
                              form.setValue('lesson_development', updated);
                            }}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {lessonDevelopment.length === 0 && (
                      <p className="text-sm text-muted-foreground p-3 border border-dashed rounded-lg text-center">
                        No development steps added. Click "Add Step" to structure your lesson.
                      </p>
                    )}
                  </div>

                  {/* Conclusion */}
                  <FormField
                    control={form.control}
                    name="conclusion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conclusion / Closure</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How will you wrap up the lesson? (e.g., summary, questions, preview of next lesson)"
                            {...field}
                            value={field.value ?? ''}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Resources & Methods */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Teaching Methods */}
                  <div className="space-y-3">
                    <Label>Teaching Methods</Label>
                    <div className="flex flex-wrap gap-2">
                      {TEACHING_METHODS.map((method) => {
                        const isSelected = form.watch('teaching_methods')?.includes(method);
                        return (
                          <Badge
                            key={method}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = form.watch('teaching_methods') || [];
                              if (isSelected) {
                                form.setValue('teaching_methods', current.filter(m => m !== method));
                              } else {
                                form.setValue('teaching_methods', [...current, method]);
                              }
                            }}
                          >
                            {method}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Teaching Aids */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Teaching Aids / Resources</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addTeachingAid}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    
                    {teachingAids.map((aid, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Resource name (e.g., Manila paper, Counters)"
                          value={aid.name}
                          onChange={(e) => {
                            const updated = [...teachingAids];
                            updated[index] = { ...aid, name: e.target.value };
                            form.setValue('teaching_aids', updated);
                          }}
                          className="flex-1"
                        />
                        <Select
                          value={aid.type}
                          onValueChange={(v) => {
                            const updated = [...teachingAids];
                            updated[index] = { ...aid, type: v as any };
                            form.setValue('teaching_aids', updated);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="physical">Physical</SelectItem>
                            <SelectItem value="digital">Digital</SelectItem>
                            <SelectItem value="printed">Printed</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeachingAid(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Core Competencies */}
                  <div className="space-y-3">
                    <Label>Core Competencies (CBC)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(cbcCompetencyLabels).map(([key, label]) => {
                        const isChecked = form.watch('core_competencies')?.includes(key);
                        return (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`comp-${key}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const current = form.watch('core_competencies') || [];
                                if (checked) {
                                  form.setValue('core_competencies', [...current, key]);
                                } else {
                                  form.setValue('core_competencies', current.filter(c => c !== key));
                                }
                              }}
                            />
                            <label htmlFor={`comp-${key}`} className="text-sm cursor-pointer">
                              {label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Values */}
                  <div className="space-y-3">
                    <Label>Values (CBC)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(cbcValueLabels).map(([key, label]) => {
                        const isChecked = form.watch('values')?.includes(key);
                        return (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`val-${key}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const current = form.watch('values') || [];
                                if (checked) {
                                  form.setValue('values', [...current, key]);
                                } else {
                                  form.setValue('values', current.filter(v => v !== key));
                                }
                              }}
                            />
                            <label htmlFor={`val-${key}`} className="text-sm cursor-pointer">
                              {label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assessment Methods */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Assessment Methods</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addAssessmentMethod}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    
                    {assessmentMethods.map((method, index) => (
                      <div key={index} className="flex gap-2">
                        <Select
                          value={method.method}
                          onValueChange={(v) => {
                            const updated = [...assessmentMethods];
                            updated[index] = { ...method, method: v };
                            form.setValue('assessment_methods', updated);
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSESSMENT_METHODS.map((m) => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Description (optional)"
                          value={method.description || ''}
                          onChange={(e) => {
                            const updated = [...assessmentMethods];
                            updated[index] = { ...method, description: e.target.value };
                            form.setValue('assessment_methods', updated);
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAssessmentMethod(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Differentiation Notes */}
                  <FormField
                    control={form.control}
                    name="differentiation_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Differentiation / Special Needs Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How will you adapt the lesson for learners with different abilities?"
                            {...field}
                            value={field.value ?? ''}
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </form>
          </Form>
        </ScrollArea>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentStep < WIZARD_STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (editPlan ? 'Update Plan' : 'Create Plan')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
