import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { CBCStrandSelector } from '@/components/cbc/CBCStrandSelector';
import { useCreateScheme, useUpdateScheme, useGenerateSchemeEntries } from '@/hooks/useSchemesOfWork';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useTeacherSubjects } from '@/hooks/useTeacherSubjects';
import { useTeacherClasses } from '@/hooks/useTeacherClasses';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useTerms } from '@/hooks/useTerms';
import { CBCLevel, classNameToCBCLevel, subjectNameToCode, CBCStrand, CBCSubStrand } from '@/types/cbc';
import { ASSESSMENT_METHODS } from '@/types/lesson-plans';

const schemeSchema = z.object({
  subject_id: z.string().min(1, 'Subject is required'),
  class_id: z.string().min(1, 'Class is required'),
  academic_year_id: z.string().min(1, 'Academic year is required'),
  term_id: z.string().min(1, 'Term is required'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional().nullable(),
  total_weeks: z.number().min(1).max(20),
});

type SchemeFormData = z.infer<typeof schemeSchema>;

interface WeekEntry {
  week_number: number;
  topic: string;
  sub_topic: string;
  strand_id: string | null;
  sub_strand_id: string | null;
  objectives: string[];
  learning_activities: string[];
  teaching_resources: string[];
  assessment_methods: string[];
  lessons_allocated: number;
  remarks: string;
  isExpanded: boolean;
}

interface CreateSchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editScheme?: any;
}

export function CreateSchemeDialog({ open, onOpenChange, editScheme }: CreateSchemeDialogProps) {
  const [step, setStep] = useState<'header' | 'entries'>('header');
  const [weekEntries, setWeekEntries] = useState<WeekEntry[]>([]);
  const [createdSchemeId, setCreatedSchemeId] = useState<string | null>(null);
  
  const { data: profile } = useStaffProfile();
  const { institutionId } = useInstitution();
  const { data: subjects = [] } = useTeacherSubjects();
  const { data: classes = [] } = useTeacherClasses();
  const { data: academicYears = [] } = useAcademicYears(institutionId);
  const { data: terms = [] } = useTerms();
  
  const createMutation = useCreateScheme();
  const updateMutation = useUpdateScheme();
  const generateEntriesMutation = useGenerateSchemeEntries();
  
  const form = useForm<SchemeFormData>({
    resolver: zodResolver(schemeSchema),
    defaultValues: editScheme ? {
      ...editScheme,
    } : {
      total_weeks: 13,
    },
  });

  const watchSubjectId = form.watch('subject_id');
  const watchClassId = form.watch('class_id');
  const watchTotalWeeks = form.watch('total_weeks');
  
  const selectedSubject = subjects.find(s => s.id === watchSubjectId);
  const selectedClass = classes.find(c => c.id === watchClassId);
  const subjectCode = selectedSubject ? subjectNameToCode(selectedSubject.name) : undefined;
  const cbcLevel = selectedClass ? classNameToCBCLevel(selectedClass.name) : undefined;

  const handleCreateScheme = async (data: SchemeFormData) => {
    const payload = {
      ...data,
      teacher_id: profile?.id,
      status: 'draft',
    };
    
    createMutation.mutate(payload, {
      onSuccess: (result: any) => {
        setCreatedSchemeId(result.id);
        
        // Generate empty week entries
        const entries: WeekEntry[] = Array.from({ length: data.total_weeks }, (_, i) => ({
          week_number: i + 1,
          topic: '',
          sub_topic: '',
          strand_id: null,
          sub_strand_id: null,
          objectives: [],
          learning_activities: [],
          teaching_resources: [],
          assessment_methods: [],
          lessons_allocated: 5,
          remarks: '',
          isExpanded: i === 0,
        }));
        
        setWeekEntries(entries);
        setStep('entries');
      },
    });
  };

  const updateWeekEntry = (weekIndex: number, updates: Partial<WeekEntry>) => {
    setWeekEntries(prev => {
      const updated = [...prev];
      updated[weekIndex] = { ...updated[weekIndex], ...updates };
      return updated;
    });
  };

  const toggleWeekExpand = (weekIndex: number) => {
    setWeekEntries(prev => {
      const updated = [...prev];
      updated[weekIndex] = { ...updated[weekIndex], isExpanded: !updated[weekIndex].isExpanded };
      return updated;
    });
  };

  const handleSaveEntries = async () => {
    if (!createdSchemeId) return;
    
    const entries = weekEntries.map(({ isExpanded, ...entry }) => ({
      scheme_id: createdSchemeId,
      ...entry,
    }));
    
    generateEntriesMutation.mutate({ schemeId: createdSchemeId, weeks: 0 }, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      },
    });
  };

  const resetForm = () => {
    form.reset();
    setStep('header');
    setWeekEntries([]);
    setCreatedSchemeId(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const isSubmitting = createMutation.isPending || generateEntriesMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>
            {step === 'header' ? 'Create Scheme of Work' : 'Define Weekly Entries'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {step === 'header' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateScheme)} className="py-4 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheme Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics Term 1 2025 - Grade 4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    name="academic_year_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormLabel>Term *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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

                <FormField
                  control={form.control}
                  name="total_weeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Weeks in Term *</FormLabel>
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
                          {[8, 9, 10, 11, 12, 13, 14, 15].map((weeks) => (
                            <SelectItem key={weeks} value={weeks.toString()}>
                              {weeks} weeks
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description or notes about this scheme..."
                          {...field}
                          value={field.value ?? ''}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {step === 'entries' && (
            <div className="py-4 space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Define what will be taught each week. Click on a week to expand and add details.
                  You can save and add entries later.
                </p>
              </div>

              {weekEntries.map((entry, index) => (
                <Collapsible
                  key={entry.week_number}
                  open={entry.isExpanded}
                  onOpenChange={() => toggleWeekExpand(index)}
                >
                  <div className="border rounded-lg">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Week {entry.week_number}</Badge>
                          <span className="font-medium">
                            {entry.topic || 'Click to add topic'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.lessons_allocated > 0 && (
                            <Badge variant="secondary">{entry.lessons_allocated} lessons</Badge>
                          )}
                          {entry.isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="p-4 pt-0 space-y-4 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Topic *</Label>
                            <Input
                              placeholder="Main topic for this week"
                              value={entry.topic}
                              onChange={(e) => updateWeekEntry(index, { topic: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Sub-topic</Label>
                            <Input
                              placeholder="Sub-topic (optional)"
                              value={entry.sub_topic}
                              onChange={(e) => updateWeekEntry(index, { sub_topic: e.target.value })}
                            />
                          </div>
                        </div>

                        {subjectCode && cbcLevel && (
                          <div className="space-y-2">
                            <Label>CBC Strand Alignment</Label>
                            <CBCStrandSelector
                              subjectCode={subjectCode}
                              level={cbcLevel as CBCLevel}
                              selectedStrandId={entry.strand_id || undefined}
                              selectedSubStrandId={entry.sub_strand_id || undefined}
                              onStrandSelect={(strand) => updateWeekEntry(index, { strand_id: strand?.id || null })}
                              onSubStrandSelect={(subStrand) => updateWeekEntry(index, { sub_strand_id: subStrand?.id || null })}
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Learning Objectives</Label>
                            <Textarea
                              placeholder="Enter objectives (one per line)"
                              value={entry.objectives.join('\n')}
                              onChange={(e) => updateWeekEntry(index, { 
                                objectives: e.target.value.split('\n').filter(Boolean) 
                              })}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Learning Activities</Label>
                            <Textarea
                              placeholder="Enter activities (one per line)"
                              value={entry.learning_activities.join('\n')}
                              onChange={(e) => updateWeekEntry(index, { 
                                learning_activities: e.target.value.split('\n').filter(Boolean) 
                              })}
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Teaching Resources</Label>
                            <Textarea
                              placeholder="Enter resources (one per line)"
                              value={entry.teaching_resources.join('\n')}
                              onChange={(e) => updateWeekEntry(index, { 
                                teaching_resources: e.target.value.split('\n').filter(Boolean) 
                              })}
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Lessons Allocated</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={entry.lessons_allocated}
                              onChange={(e) => updateWeekEntry(index, { 
                                lessons_allocated: parseInt(e.target.value) || 1 
                              })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Assessment Methods</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {ASSESSMENT_METHODS.map((method) => {
                              const isSelected = entry.assessment_methods.includes(method);
                              return (
                                <Badge
                                  key={method}
                                  variant={isSelected ? 'default' : 'outline'}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    if (isSelected) {
                                      updateWeekEntry(index, {
                                        assessment_methods: entry.assessment_methods.filter(m => m !== method)
                                      });
                                    } else {
                                      updateWeekEntry(index, {
                                        assessment_methods: [...entry.assessment_methods, method]
                                      });
                                    }
                                  }}
                                >
                                  {method}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label>Remarks</Label>
                          <Textarea
                            placeholder="Any additional notes for this week"
                            value={entry.remarks}
                            onChange={(e) => updateWeekEntry(index, { remarks: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          {step === 'header' ? (
            <>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={form.handleSubmit(handleCreateScheme)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create & Add Entries'}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setStep('header')}>
                Back to Header
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Save & Close
                </Button>
                <Button onClick={handleSaveEntries} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Entries'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
