import { useState, useMemo } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, Calendar, Users, MessageSquare } from 'lucide-react';
import { useDiaryEntries, useCreateDiaryEntry } from '@/hooks/useStudentDiary';
import { useStudents } from '@/hooks/useStudents';
import { useTeacherClasses } from '@/hooks/useTeacherClasses';
import { useClassStudents } from '@/hooks/useClassStudents';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { COMMON_ACTIVITIES, Mood, EntryType } from '@/types/diary';
import { DiaryEntryCard } from '@/components/diary/DiaryEntryCard';
import { BulkDiaryEntryDialog } from '@/components/diary/BulkDiaryEntryDialog';
import { format } from 'date-fns';

const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: 'happy', label: '😊 Happy' },
  { value: 'excited', label: '🤩 Excited' },
  { value: 'okay', label: '😐 Okay' },
  { value: 'tired', label: '😴 Tired' },
  { value: 'upset', label: '😢 Upset' },
];

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: 'daily_report', label: 'Daily Report' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'concern', label: 'Concern' },
  { value: 'behavior', label: 'Behavior Note' },
  { value: 'health', label: 'Health Update' },
];

type TabValue = 'all' | 'pending' | 'responses' | 'flagged';

export default function StudentDiary() {
  const { institution } = useInstitution();
  const { data: profile } = useStaffProfile();
  const { data: teacherClasses = [] } = useTeacherClasses();
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  // Get filter params based on active tab
  const getTabFilters = () => {
    switch (activeTab) {
      case 'pending':
        return { pendingAcknowledgment: true };
      case 'responses':
        return { hasParentResponse: true };
      case 'flagged':
        return { isFlagged: true };
      default:
        return {};
    }
  };

  const { data: entries = [], isLoading } = useDiaryEntries({
    entryType: typeFilter !== 'all' ? typeFilter : undefined,
    classId: classFilter !== 'all' ? classFilter : undefined,
    ...getTabFilters(),
  });

  const { data: allStudents = [] } = useStudents(institution?.id || null);
  const { data: classStudents = [] } = useClassStudents(classFilter !== 'all' ? classFilter : null);
  const createEntry = useCreateDiaryEntry();

  // Use class students if a class is selected, otherwise all students
  const students = classFilter !== 'all' ? classStudents : allStudents;

  const selectedClass = teacherClasses.find(c => c.id === classFilter);

  const [formData, setFormData] = useState({
    student_id: '',
    entry_type: 'daily_report' as EntryType,
    mood: undefined as Mood | undefined,
    meals: { breakfast: false, snack: false, lunch: false },
    nap_duration_minutes: 0,
    activities: [] as string[],
    learning_highlights: '',
    teacher_comment: '',
    is_flagged: false,
  });

  // Calculate stats based on filtered entries
  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntries = entries.filter(e => e.entry_date === today);
    return {
      todayCount: todayEntries.length,
      flaggedCount: entries.filter(e => e.is_flagged).length,
      acknowledgedCount: entries.filter(e => e.parent_acknowledged_at).length,
      pendingCount: entries.filter(e => !e.parent_acknowledged_at).length,
      responseCount: entries.filter(e => e.parent_comment).length,
    };
  }, [entries]);

  const handleSubmit = async () => {
    if (!institution?.id || !profile?.id) return;

    await createEntry.mutateAsync({
      institution_id: institution.id,
      student_id: formData.student_id,
      entry_type: formData.entry_type,
      mood: formData.mood,
      meals: formData.meals,
      nap_duration_minutes: formData.nap_duration_minutes || undefined,
      activities: formData.activities,
      learning_highlights: formData.learning_highlights || undefined,
      teacher_comment: formData.teacher_comment,
      is_flagged: formData.is_flagged,
      created_by: profile.id,
      entry_date: format(new Date(), 'yyyy-MM-dd'),
    });

    setShowCreateDialog(false);
    setFormData({
      student_id: '',
      entry_type: 'daily_report',
      mood: undefined,
      meals: { breakfast: false, snack: false, lunch: false },
      nap_duration_minutes: 0,
      activities: [],
      learning_highlights: '',
      teacher_comment: '',
      is_flagged: false,
    });
  };

  const toggleActivity = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity],
    }));
  };

  const filteredEntries = entries.filter(e =>
    e.student?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.student?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.teacher_comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout title="Student Diary" subtitle="Daily reports and communication with parents">
      <div className="space-y-4 p-4 md:p-6">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-2 flex-wrap">
            {/* Class Filter */}
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {teacherClasses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ENTRY_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
            {classFilter !== 'all' && (
              <Button variant="secondary" onClick={() => setShowBulkDialog(true)}>
                <Users className="h-4 w-4 mr-2" />
                Bulk Entry
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.todayCount}</div>
              <p className="text-sm text-muted-foreground">Today's Entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{stats.flaggedCount}</div>
              <p className="text-sm text-muted-foreground">Flagged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.acknowledgedCount}</div>
              <p className="text-sm text-muted-foreground">Acknowledged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.responseCount}</div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Parent Responses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="all">All Entries</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Ack. {stats.pendingCount > 0 && <Badge variant="secondary" className="ml-1">{stats.pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="responses">
              Parent Responses {stats.responseCount > 0 && <Badge variant="secondary" className="ml-1">{stats.responseCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged {stats.flaggedCount > 0 && <Badge variant="destructive" className="ml-1">{stats.flaggedCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {/* Entries List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No diary entries</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'responses' 
                      ? 'No parent responses yet'
                      : activeTab === 'pending'
                        ? 'All entries have been acknowledged'
                        : activeTab === 'flagged'
                          ? 'No flagged entries'
                          : 'Create a diary entry to communicate with parents'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map(entry => (
                  <DiaryEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Single Entry Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle>New Diary Entry</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Student *</Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(v) => setFormData({ ...formData, student_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.first_name} {s.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Entry Type *</Label>
                    <Select
                      value={formData.entry_type}
                      onValueChange={(v) => setFormData({ ...formData, entry_type: v as EntryType })}
                    >
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

                {/* Mood Selector */}
                <div>
                  <Label>Mood</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {MOOD_OPTIONS.map(mood => (
                      <Button
                        key={mood.value}
                        type="button"
                        variant={formData.mood === mood.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, mood: mood.value })}
                      >
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Meals */}
                <div>
                  <Label>Meals</Label>
                  <div className="flex gap-4 mt-2">
                    {['breakfast', 'snack', 'lunch'].map(meal => (
                      <label key={meal} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.meals[meal as keyof typeof formData.meals]}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            meals: { ...formData.meals, [meal]: checked },
                          })}
                        />
                        <span className="capitalize text-sm">{meal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <Label>Activities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMMON_ACTIVITIES.map(activity => (
                      <Button
                        key={activity}
                        type="button"
                        variant={formData.activities.includes(activity) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleActivity(activity)}
                      >
                        {activity}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Learning Highlights</Label>
                  <Textarea
                    value={formData.learning_highlights}
                    onChange={(e) => setFormData({ ...formData, learning_highlights: e.target.value })}
                    placeholder="What did the student learn today?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Teacher's Comment *</Label>
                  <Textarea
                    value={formData.teacher_comment}
                    onChange={(e) => setFormData({ ...formData, teacher_comment: e.target.value })}
                    placeholder="Your message to the parent..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="flagged"
                    checked={formData.is_flagged}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_flagged: !!checked })}
                  />
                  <Label htmlFor="flagged" className="text-sm text-red-600">
                    Flag this entry (requires parent attention)
                  </Label>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.student_id || !formData.teacher_comment || createEntry.isPending}
              >
                {createEntry.isPending ? 'Saving...' : 'Save Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Entry Dialog */}
        {classFilter !== 'all' && selectedClass && (
          <BulkDiaryEntryDialog
            open={showBulkDialog}
            onOpenChange={setShowBulkDialog}
            classId={classFilter}
            className={selectedClass.name}
          />
        )}
      </div>
    </PortalLayout>
  );
}
