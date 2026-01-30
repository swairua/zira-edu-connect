import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Sparkles } from 'lucide-react';
import { useClassStudents } from '@/hooks/useClassStudents';
import { useBulkCreateDiaryEntries, useExistingEntriesForDate } from '@/hooks/useStudentDiary';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { COMMON_ACTIVITIES, DIARY_TEMPLATES, Mood, EntryType, DiaryTemplate } from '@/types/diary';
import { format } from 'date-fns';

interface BulkDiaryEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
}

interface StudentEntry {
  studentId: string;
  selected: boolean;
  mood: Mood;
  customNote: string;
  hasExisting: boolean;
}

const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'excited', label: 'Excited', emoji: '🤩' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'upset', label: 'Upset', emoji: '😢' },
];

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: 'daily_report', label: 'Daily Report' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'concern', label: 'Concern' },
  { value: 'behavior', label: 'Behavior Note' },
  { value: 'health', label: 'Health Update' },
];

export function BulkDiaryEntryDialog({ open, onOpenChange, classId, className }: BulkDiaryEntryDialogProps) {
  const { institution } = useInstitution();
  const { data: profile } = useStaffProfile();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [entryDate, setEntryDate] = useState(today);
  const [entryType, setEntryType] = useState<EntryType>('daily_report');
  const [commonActivities, setCommonActivities] = useState<string[]>([]);
  const [commonMeals, setCommonMeals] = useState({ breakfast: false, snack: false, lunch: false });
  const [defaultComment, setDefaultComment] = useState('');
  const [studentEntries, setStudentEntries] = useState<Record<string, StudentEntry>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const { data: students = [], isLoading: studentsLoading } = useClassStudents(classId);
  const { data: existingStudentIds = [], isLoading: existingLoading } = useExistingEntriesForDate(classId, entryDate);
  const bulkCreate = useBulkCreateDiaryEntries();
  
  // Initialize student entries when students load
  useMemo(() => {
    const entries: Record<string, StudentEntry> = {};
    students.forEach(student => {
      const hasExisting = existingStudentIds.includes(student.id);
      entries[student.id] = studentEntries[student.id] || {
        studentId: student.id,
        selected: !hasExisting,
        mood: 'happy' as Mood,
        customNote: '',
        hasExisting,
      };
      // Update hasExisting flag
      if (entries[student.id]) {
        entries[student.id].hasExisting = hasExisting;
        if (hasExisting && entries[student.id].selected) {
          entries[student.id].selected = false;
        }
      }
    });
    if (Object.keys(entries).length > 0 && JSON.stringify(entries) !== JSON.stringify(studentEntries)) {
      setStudentEntries(entries);
    }
  }, [students, existingStudentIds]);

  const applyTemplate = (template: DiaryTemplate) => {
    setSelectedTemplate(template.id);
    setCommonActivities(template.activities);
    setCommonMeals(template.meals);
    setDefaultComment(template.defaultComment);
    // Set all selected students to the template's default mood
    setStudentEntries(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        if (updated[id].selected) {
          updated[id].mood = template.defaultMood;
        }
      });
      return updated;
    });
  };

  const setAllMood = (mood: Mood) => {
    setStudentEntries(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        if (updated[id].selected) {
          updated[id].mood = mood;
        }
      });
      return updated;
    });
  };

  const toggleActivity = (activity: string) => {
    setSelectedTemplate(null);
    setCommonActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const updateStudentEntry = (studentId: string, updates: Partial<StudentEntry>) => {
    setStudentEntries(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], ...updates },
    }));
  };

  const selectAll = () => {
    setStudentEntries(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        if (!updated[id].hasExisting) {
          updated[id].selected = true;
        }
      });
      return updated;
    });
  };

  const deselectAll = () => {
    setStudentEntries(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[id].selected = false;
      });
      return updated;
    });
  };

  const selectedCount = Object.values(studentEntries).filter(e => e.selected).length;

  const handleSubmit = async () => {
    if (!institution?.id || !profile?.id) return;

    const entries = Object.values(studentEntries)
      .filter(e => e.selected)
      .map(entry => ({
        institution_id: institution.id,
        student_id: entry.studentId,
        entry_type: entryType,
        mood: entry.mood,
        meals: commonMeals,
        activities: commonActivities,
        teacher_comment: entry.customNote || defaultComment || 'Daily report completed.',
        is_flagged: false,
        created_by: profile.id,
        entry_date: entryDate,
      }));

    await bulkCreate.mutateAsync(entries);
    onOpenChange(false);
    
    // Reset form
    setCommonActivities([]);
    setCommonMeals({ breakfast: false, snack: false, lunch: false });
    setDefaultComment('');
    setStudentEntries({});
    setSelectedTemplate(null);
  };

  const isLoading = studentsLoading || existingLoading;

  // Count moods for summary
  const moodCounts = useMemo(() => {
    const counts: Record<Mood, number> = { happy: 0, excited: 0, okay: 0, tired: 0, upset: 0 };
    Object.values(studentEntries).forEach(entry => {
      if (entry.selected) {
        counts[entry.mood]++;
      }
    });
    return counts;
  }, [studentEntries]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Diary Entry - {className}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* Quick Templates */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Templates
            </Label>
            <div className="flex flex-wrap gap-2">
              {DIARY_TEMPLATES.map(template => (
                <Button
                  key={template.id}
                  type="button"
                  variant={selectedTemplate === template.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className="h-9"
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date & Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                max={today}
              />
            </div>
            <div>
              <Label>Entry Type</Label>
              <Select value={entryType} onValueChange={(v) => setEntryType(v as EntryType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Common Fields Section */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h4 className="font-medium text-sm">Common Fields (applied to all selected students)</h4>
            
            {/* Activities */}
            <div>
              <Label className="text-xs">Activities</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {COMMON_ACTIVITIES.slice(0, 10).map(activity => (
                  <Button
                    key={activity}
                    type="button"
                    variant={commonActivities.includes(activity) ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => toggleActivity(activity)}
                  >
                    {activity}
                  </Button>
                ))}
              </div>
            </div>

            {/* Meals */}
            <div>
              <Label className="text-xs">Meals</Label>
              <div className="flex gap-4 mt-1">
                {['breakfast', 'snack', 'lunch'].map(meal => (
                  <label key={meal} className="flex items-center gap-2">
                    <Checkbox
                      checked={commonMeals[meal as keyof typeof commonMeals]}
                      onCheckedChange={(checked) => setCommonMeals({
                        ...commonMeals,
                        [meal]: checked,
                      })}
                    />
                    <span className="capitalize text-sm">{meal}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Default Comment */}
            <div>
              <Label className="text-xs">Default Comment (optional)</Label>
              <Textarea
                value={defaultComment}
                onChange={(e) => setDefaultComment(e.target.value)}
                placeholder="Optional comment for students without custom notes..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Students List */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-sm font-medium">Students ({selectedCount} selected)</Label>
                {/* Mood Summary */}
                <div className="flex gap-1">
                  {MOOD_OPTIONS.map(mood => (
                    moodCounts[mood.value] > 0 && (
                      <Badge key={mood.value} variant="secondary" className="text-xs px-1.5">
                        {mood.emoji} {moodCounts[mood.value]}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {/* Set All Mood Buttons */}
                {MOOD_OPTIONS.slice(0, 3).map(mood => (
                  <Button
                    key={mood.value}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-base"
                    onClick={() => setAllMood(mood.value)}
                    title={`Set all to ${mood.label}`}
                  >
                    {mood.emoji}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" className="h-8" onClick={selectAll}>All</Button>
                <Button variant="ghost" size="sm" className="h-8" onClick={deselectAll}>Clear</Button>
              </div>
            </div>

            <ScrollArea className="h-[250px] border rounded-lg">
              <div className="p-2 space-y-1">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading students...</p>
                ) : students.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No students in this class</p>
                ) : (
                  students.map(student => {
                    const entry = studentEntries[student.id];
                    if (!entry) return null;
                    
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg ${
                          entry.hasExisting 
                            ? 'bg-muted/50 opacity-60' 
                            : entry.selected 
                              ? 'bg-primary/10' 
                              : 'hover:bg-muted/30'
                        }`}
                      >
                        <Checkbox
                          checked={entry.selected}
                          disabled={entry.hasExisting}
                          onCheckedChange={(checked) => 
                            updateStudentEntry(student.id, { selected: !!checked })
                          }
                        />
                        
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">
                            {student.first_name} {student.last_name}
                          </span>
                          {entry.hasExisting && (
                            <Badge variant="secondary" className="text-xs mt-0.5">
                              Entry exists
                            </Badge>
                          )}
                        </div>

                        {/* Quick Mood Selector - Larger touch targets */}
                        <div className="flex gap-0.5">
                          {MOOD_OPTIONS.map(mood => (
                            <button
                              key={mood.value}
                              type="button"
                              disabled={!entry.selected}
                              onClick={() => updateStudentEntry(student.id, { mood: mood.value })}
                              className={`text-xl sm:text-2xl p-1.5 sm:p-2 rounded-lg transition-all ${
                                entry.mood === mood.value 
                                  ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                                  : 'opacity-40 hover:opacity-70 hover:bg-muted'
                              } ${!entry.selected ? 'cursor-not-allowed opacity-20' : 'cursor-pointer'}`}
                              title={mood.label}
                            >
                              {mood.emoji}
                            </button>
                          ))}
                        </div>

                        {/* Custom Note Input - Wider */}
                        <Input
                          placeholder="Note..."
                          value={entry.customNote}
                          onChange={(e) => updateStudentEntry(student.id, { customNote: e.target.value })}
                          disabled={!entry.selected}
                          className="w-24 sm:w-40 h-9 text-xs"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedCount === 0 || bulkCreate.isPending}
          >
            {bulkCreate.isPending ? 'Saving...' : `Save ${selectedCount} Entries`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
