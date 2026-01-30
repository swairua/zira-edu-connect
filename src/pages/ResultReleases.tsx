import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAcademicYears, useCurrentAcademicYear } from '@/hooks/useAcademicYears';
import { useExams } from '@/hooks/useExams';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { 
  useResultReleases, 
  useCreateResultRelease, 
  useRevokeResultRelease,
  useReleaseStats 
} from '@/hooks/useResultReleases';
import { 
  Eye, 
  EyeOff, 
  Bell, 
  BellOff,
  Calendar,
  BookOpen,
  Users,
  FileText,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ResultReleases() {
  const { institutionId, institution } = useInstitution();
  const { data: currentYear } = useCurrentAcademicYear(institutionId);
  const { data: exams = [] } = useExams(institutionId, currentYear?.id);
  const { data: classes = [] } = useClasses(institutionId);
  const { data: subjects = [] } = useSubjects(institutionId);
  const { data: releases = [], isLoading } = useResultReleases(institutionId);
  const { data: stats } = useReleaseStats(institutionId);

  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [releaseType, setReleaseType] = useState<'exam' | 'assignment' | 'term_report'>('exam');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [notifyParents, setNotifyParents] = useState(true);
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [releaseNotes, setReleaseNotes] = useState('');

  const createRelease = useCreateResultRelease(institutionId);
  const revokeRelease = useRevokeResultRelease();

  const handleCreateRelease = async () => {
    if (!institutionId) return;

    try {
      await createRelease.mutateAsync({
        releaseType: releaseType,
        examId: selectedExam || undefined,
        classId: selectedClass && selectedClass !== 'all' ? selectedClass : undefined,
        subjectId: selectedSubject && selectedSubject !== 'all' ? selectedSubject : undefined,
        academicYearId: currentYear?.id,
        notifyParents: notifyParents,
        notifyStudents: notifyStudents,
        notes: releaseNotes || undefined,
      });
      toast.success('Results released successfully');
      setReleaseDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to release results');
    }
  };

  const handleRevokeRelease = async (releaseId: string) => {
    try {
      await revokeRelease.mutateAsync(releaseId);
      toast.success('Release revoked');
    } catch (error) {
      toast.error('Failed to revoke release');
    }
  };

  const resetForm = () => {
    setReleaseType('exam');
    setSelectedExam('');
    setSelectedClass('');
    setSelectedSubject('');
    setNotifyParents(true);
    setNotifyStudents(true);
    setReleaseNotes('');
  };

  const publishedExams = exams.filter(e => e.status === 'published' || e.status === 'completed');

  return (
    <DashboardLayout title="Result Releases" subtitle="Control visibility of results to students and parents">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Result Releases</h1>
            <p className="text-muted-foreground">
              Manage when results become visible to students and parents
            </p>
          </div>
          <Button onClick={() => setReleaseDialogOpen(true)}>
            <Send className="mr-2 h-4 w-4" />
            Release Results
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Eye className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exams Released</p>
                  <p className="text-xl font-bold">{stats?.exam || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assignments Released</p>
                  <p className="text-xl font-bold">{stats?.assignment || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Releases</p>
                  <p className="text-xl font-bold">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Releases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Release History</CardTitle>
            <CardDescription>
              All results that have been made visible to students and parents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : releases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <EyeOff className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No results released yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click "Release Results" to make grades visible to students and parents
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Released By</TableHead>
                    <TableHead>Released At</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {releases.map((release) => (
                    <TableRow key={release.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {release.release_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {release.exam?.name || release.assignment?.title || 'All Results'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {release.subject?.name && `${release.subject.name} • `}
                            {release.class?.name || 'All Classes'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {release.releaser?.first_name} {release.releaser?.last_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {release.released_at 
                            ? format(new Date(release.released_at), 'MMM d, yyyy HH:mm')
                            : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {release.notify_parents ? (
                            <Badge variant="secondary" className="gap-1">
                              <Bell className="h-3 w-3" />Parents
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              <BellOff className="h-3 w-3" />Parents
                            </Badge>
                          )}
                          {release.notify_students ? (
                            <Badge variant="secondary" className="gap-1">
                              <Bell className="h-3 w-3" />Students
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              <BellOff className="h-3 w-3" />Students
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevokeRelease(release.id)}
                          disabled={revokeRelease.isPending}
                        >
                          <EyeOff className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Release Dialog */}
      <Dialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Release Results</DialogTitle>
            <DialogDescription>
              Make grades visible to students and parents. You can release by exam, class, or subject.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Release Type</label>
              <Select value={releaseType} onValueChange={(v) => setReleaseType(v as typeof releaseType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Exam Results</SelectItem>
                  <SelectItem value="assignment">Assignment Grades</SelectItem>
                  <SelectItem value="term_report">Term Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {releaseType === 'exam' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Exam</label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {publishedExams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Class (Optional)</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.stream && `- ${cls.stream}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject (Optional)</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Notify Parents</span>
                </div>
                <Switch checked={notifyParents} onCheckedChange={setNotifyParents} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Notify Students</span>
                </div>
                <Switch checked={notifyStudents} onCheckedChange={setNotifyStudents} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this release..."
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRelease}
              disabled={createRelease.isPending || (releaseType === 'exam' && !selectedExam)}
            >
              {createRelease.isPending ? 'Releasing...' : 'Release Results'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
