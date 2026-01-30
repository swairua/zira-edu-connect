import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAcademicYears, useCurrentAcademicYear } from '@/hooks/useAcademicYears';
import { useExams, useCreateExam, Exam } from '@/hooks/useExams';
import { usePublishExamWithNotify } from '@/hooks/usePublishExamWithNotify';
import { Checkbox } from '@/components/ui/checkbox';
import { ExamTimelineSettings, type TimelineFormData } from '@/components/exams/ExamTimelineSettings';
import { ExamDeadlineIndicator } from '@/components/exams/ExamDeadlineIndicator';
import { useExamDeadlines, validateDeadlineSequence } from '@/hooks/useExamDeadlines';
import { ClipboardList, Plus, Calendar, FileText, CheckCircle, MoreHorizontal, Edit, Send, Award, Clock } from 'lucide-react';
import { format } from 'date-fns';

const examTypes = [
  { value: 'cat', label: 'CAT (Continuous Assessment)' },
  { value: 'midterm', label: 'Mid-Term Exam' },
  { value: 'endterm', label: 'End-Term Exam' },
  { value: 'mock', label: 'Mock Exam' },
  { value: 'opener', label: 'Opener Exam' },
];

export default function Exams() {
  const navigate = useNavigate();
  const { institutionId, institution } = useInstitution();
  const { data: currentYear } = useCurrentAcademicYear(institutionId);
  const { data: academicYears = [] } = useAcademicYears(institutionId);
  const { data: exams = [], isLoading } = useExams(institutionId, currentYear?.id);
  const createExam = useCreateExam();
  const publishExamWithNotify = usePublishExamWithNotify();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [examToPublish, setExamToPublish] = useState<Exam | null>(null);
  const [notifyViaSms, setNotifyViaSms] = useState(false);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const publishExam = usePublishExamWithNotify();

  const handleOpenPublishDialog = (exam: Exam) => {
    setExamToPublish(exam);
    setPublishDialogOpen(true);
  };

  const handlePublish = async () => {
    if (!examToPublish || !institutionId) return;
    
    await publishExamWithNotify.mutateAsync({
      examId: examToPublish.id,
      institutionId,
      notifyViaSms,
      notifyInApp,
    });
    
    setPublishDialogOpen(false);
    setExamToPublish(null);
    setNotifyViaSms(false);
    setNotifyInApp(true);
  };

  const [form, setForm] = useState({
    name: '',
    exam_type: '',
    term_id: '',
    start_date: '',
    end_date: '',
    max_marks: '100',
  });

  const [timelineForm, setTimelineForm] = useState<TimelineFormData>({
    draft_deadline: '',
    correction_deadline: '',
    final_deadline: '',
    allow_late_submission: false,
    late_submission_penalty_percent: '0',
  });

  const currentTerms = currentYear?.terms || [];

  const handleSubmit = async () => {
    if (!institutionId || !currentYear?.id) return;

    // Validate deadline sequence if any deadlines are set
    if (timelineForm.draft_deadline || timelineForm.correction_deadline || timelineForm.final_deadline) {
      const validation = validateDeadlineSequence(
        form.end_date || null,
        timelineForm.draft_deadline || null,
        timelineForm.correction_deadline || null,
        timelineForm.final_deadline || null
      );
      if (!validation.valid) {
        return; // Don't submit if validation fails
      }
    }

    await createExam.mutateAsync({
      institution_id: institutionId,
      academic_year_id: currentYear.id,
      name: form.name,
      exam_type: form.exam_type,
      term_id: form.term_id || undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      max_marks: form.max_marks ? parseInt(form.max_marks) : 100,
      // Include timeline settings
      draft_deadline: timelineForm.draft_deadline || undefined,
      correction_deadline: timelineForm.correction_deadline || undefined,
      final_deadline: timelineForm.final_deadline || undefined,
      allow_late_submission: timelineForm.allow_late_submission,
      late_submission_penalty_percent: timelineForm.late_submission_penalty_percent 
        ? parseInt(timelineForm.late_submission_penalty_percent) 
        : 0,
    });

    setForm({
      name: '',
      exam_type: '',
      term_id: '',
      start_date: '',
      end_date: '',
      max_marks: '100',
    });
    setTimelineForm({
      draft_deadline: '',
      correction_deadline: '',
      final_deadline: '',
      allow_late_submission: false,
      late_submission_penalty_percent: '0',
    });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      draft: { label: 'Draft', variant: 'outline' },
      scheduled: { label: 'Scheduled', variant: 'secondary' },
      ongoing: { label: 'Ongoing', variant: 'default' },
      completed: { label: 'Completed', variant: 'secondary' },
      published: { label: 'Published', variant: 'default' },
    };
    const config = variants[status || 'draft'] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getExamTypeLabel = (type: string) => {
    return examTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <DashboardLayout title="Exams" subtitle="Manage examinations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Examinations</h1>
            <p className="text-muted-foreground">
              Manage exams for {institution?.name || 'your institution'}
            </p>
          </div>
          <PermissionGate domain="academics" action="create">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Create New Exam</DialogTitle>
                  <DialogDescription>Set up a new examination</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Exam Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Term 1 End-Term Exams 2024"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="exam_type">Exam Type</Label>
                      <Select
                        value={form.exam_type}
                        onValueChange={(value) => setForm({ ...form, exam_type: value })}
                      >
                        <SelectTrigger id="exam_type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="term">Term</Label>
                      <Select
                        value={form.term_id}
                        onValueChange={(value) => setForm({ ...form, term_id: value })}
                      >
                        <SelectTrigger id="term">
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentTerms.map((term) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={form.end_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_marks">Maximum Marks</Label>
                    <Input
                      id="max_marks"
                      type="number"
                      value={form.max_marks}
                      onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
                    />
                    </div>

                    {/* Timeline Settings */}
                    <Separator className="my-4" />
                    <ExamTimelineSettings
                      endDate={form.end_date}
                      value={timelineForm}
                      onChange={setTimelineForm}
                    />
                  </div>
                </div>
                <DialogFooter className="flex-shrink-0">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createExam.isPending || !form.name || !form.exam_type}
                  >
                    {createExam.isPending ? 'Creating...' : 'Create Exam'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>

        {/* Current Year Info */}
        {currentYear && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Academic Year</p>
                  <p className="text-lg font-semibold">{currentYear.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Exams</p>
                  <p className="text-xl font-bold">{exams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Draft</p>
                  <p className="text-xl font-bold">
                    {exams.filter((e) => e.status === 'draft').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-xl font-bold">
                    {exams.filter((e) => e.status === 'published').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Exams</CardTitle>
            <CardDescription>
              {exams.length} examination{exams.length !== 1 ? 's' : ''} for {currentYear?.name || 'current year'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No exams created</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first exam to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>{getExamTypeLabel(exam.exam_type)}</TableCell>
                      <TableCell>{exam.term?.name || '-'}</TableCell>
                      <TableCell>
                        {exam.start_date && exam.end_date ? (
                          <span className="text-sm">
                            {format(new Date(exam.start_date), 'MMM d')} -{' '}
                            {format(new Date(exam.end_date), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{exam.max_marks || 100}</TableCell>
                      <TableCell>{getStatusBadge(exam.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/exams/${exam.id}/scores`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Enter Scores
                            </DropdownMenuItem>
                            {exam.status !== 'published' && (
                              <DropdownMenuItem 
                                onClick={() => handleOpenPublishDialog(exam)}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Publish Results
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigate('/results')}>
                              <Award className="mr-2 h-4 w-4" />
                              View Results
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Publish Dialog */}
        <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish Results</DialogTitle>
              <DialogDescription>
                Publish "{examToPublish?.name}" results and notify parents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-in-app"
                  checked={notifyInApp}
                  onCheckedChange={(checked) => setNotifyInApp(!!checked)}
                />
                <label htmlFor="notify-in-app" className="text-sm font-medium">
                  Send in-app notification to parents
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-sms"
                  checked={notifyViaSms}
                  onCheckedChange={(checked) => setNotifyViaSms(!!checked)}
                />
                <label htmlFor="notify-sms" className="text-sm font-medium">
                  Send SMS notification to parents
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Parents will be notified that results are available in the Parent Portal.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={publishExamWithNotify.isPending}
              >
                {publishExamWithNotify.isPending ? 'Publishing...' : 'Publish & Notify'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
