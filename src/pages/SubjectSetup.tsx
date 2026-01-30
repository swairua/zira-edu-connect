import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject, Subject } from '@/hooks/useSubjects';
import { useCurriculum } from '@/hooks/useCurriculum';
import { useSubjectCompliance, useDefaultCurriculumLevel } from '@/hooks/useCurriculumSubjects';
import { SubjectProposalWizard } from '@/components/subjects/SubjectProposalWizard';
import { getCurriculumSubjectConfig, getCategoryColor, getCategoryLabel } from '@/lib/curriculum-subjects';
import { CurriculumId } from '@/lib/curriculum-config';
import { BookOpen, Plus, Search, Trash2, Pencil, Sparkles, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';

const subjectCategories = [
  { value: 'core', label: 'Core' },
  { value: 'elective', label: 'Elective' },
  { value: 'optional', label: 'Optional' },
  { value: 'technical', label: 'Technical' },
  { value: 'language', label: 'Language' },
  { value: 'science', label: 'Science' },
  { value: 'humanities', label: 'Humanities' },
  { value: 'arts', label: 'Arts' },
];

export default function SubjectSetup() {
  const { institutionId, institution } = useInstitution();
  const { data: subjects = [], isLoading } = useSubjects(institutionId);
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  // Access curriculum from institution settings
  const curriculumId = institution?.curriculum as CurriculumId | undefined;
  const { curriculum } = useCurriculum(curriculumId);
  const defaultLevel = useDefaultCurriculumLevel(curriculumId, institution?.type);
  const compliance = useSubjectCompliance(institutionId, curriculumId, defaultLevel);
  const hasCurriculumConfig = curriculumId ? !!getCurriculumSubjectConfig(curriculumId) : false;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    category: '',
  });

  const handleSubmit = async () => {
    if (!institutionId) return;

    await createSubject.mutateAsync({
      institution_id: institutionId,
      name: form.name,
      code: form.code,
      category: form.category || undefined,
    });

    setForm({ name: '', code: '', category: '' });
    setIsDialogOpen(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setForm({
      name: subject.name,
      code: subject.code,
      category: subject.category || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSubject) return;

    await updateSubject.mutateAsync({
      id: editingSubject.id,
      name: form.name,
      code: form.code,
      category: form.category || undefined,
    });

    setForm({ name: '', code: '', category: '' });
    setEditingSubject(null);
    setIsEditDialogOpen(false);
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      !search ||
      subject.name.toLowerCase().includes(search.toLowerCase()) ||
      subject.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || subject.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeVariant = (category: string | null | undefined) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      core: 'default',
      elective: 'secondary',
      optional: 'outline',
      technical: 'secondary',
      language: 'secondary',
      science: 'default',
      humanities: 'outline',
      arts: 'outline',
    };
    return variants[category || ''] || 'outline';
  };

  return (
    <DashboardLayout title="Subject Setup" subtitle="Configure subjects for your institution">
      <div className="space-y-6">
        {/* Curriculum Context Banner */}
        {curriculum && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {curriculum.shortName} Curriculum
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {curriculum.name}
                    </p>
                  </div>
                </div>
                {hasCurriculumConfig && (
                  <PermissionGate domain="academics" action="create">
                    <Button
                      variant="default"
                      className="gap-2"
                      onClick={() => setIsWizardOpen(true)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Setup from Curriculum
                    </Button>
                  </PermissionGate>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Subjects</h1>
            <p className="text-muted-foreground">
              Manage subjects for {institution?.name || 'your institution'}
            </p>
          </div>
          <div className="flex gap-2">
            <PermissionGate domain="academics" action="create">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                    <DialogDescription>Create a new subject for your curriculum</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Subject Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Mathematics"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="code">Subject Code</Label>
                        <Input
                          id="code"
                          placeholder="e.g., MATH"
                          value={form.code}
                          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={form.category}
                          onValueChange={(value) => setForm({ ...form, category: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjectCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={createSubject.isPending || !form.name || !form.code}
                    >
                      {createSubject.isPending ? 'Creating...' : 'Add Subject'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </PermissionGate>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {subjectCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Subjects</p>
                  <p className="text-2xl font-bold">{subjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Core Subjects</p>
                  <p className="text-2xl font-bold">
                    {subjects.filter((s) => s.category === 'core').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <BookOpen className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Electives</p>
                  <p className="text-2xl font-bold">
                    {subjects.filter((s) => s.category === 'elective' || s.category === 'optional')
                      .length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Curriculum Compliance Card */}
          {hasCurriculumConfig && compliance.total > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Curriculum Compliance</p>
                    {compliance.percentage === 100 ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{compliance.percentage}%</span>
                    <span className="text-sm text-muted-foreground">
                      ({compliance.configured}/{compliance.total})
                    </span>
                  </div>
                  <Progress value={compliance.percentage} className="h-2" />
                  {compliance.missing.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Missing: {compliance.missing.slice(0, 3).map(s => s.name).join(', ')}
                      {compliance.missing.length > 3 && ` +${compliance.missing.length - 3} more`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Empty State with Wizard CTA */}
        {!isLoading && subjects.length === 0 && hasCurriculumConfig && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Get Started with {curriculum?.shortName} Subjects</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                We've prepared a list of recommended subjects based on the {curriculum?.name}. 
                Review and select the ones relevant to your institution.
              </p>
              <PermissionGate domain="academics" action="create">
                <Button className="mt-6 gap-2" onClick={() => setIsWizardOpen(true)}>
                  <Sparkles className="h-4 w-4" />
                  Setup Subjects from Curriculum
                </Button>
              </PermissionGate>
            </CardContent>
          </Card>
        )}

        {/* Subjects Table */}
        {(isLoading || subjects.length > 0 || !hasCurriculumConfig) && (
          <Card>
            <CardHeader>
              <CardTitle>All Subjects</CardTitle>
              <CardDescription>
                {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No subjects found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {search || categoryFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Add your first subject to get started'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-mono font-medium">{subject.code}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>
                          {subject.category ? (
                            <Badge variant={getCategoryBadgeVariant(subject.category)}>
                              {subject.category}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={subject.is_active ? 'default' : 'secondary'}>
                            {subject.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <PermissionGate domain="academics" action="edit">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(subject)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </PermissionGate>
                            <PermissionGate domain="academics" action="delete">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteSubject.mutate(subject.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingSubject(null);
          setForm({ name: '', code: '', category: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update subject details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Subject Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Mathematics"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Subject Code</Label>
                <Input
                  id="edit-code"
                  placeholder="e.g., MATH"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateSubject.isPending || !form.name || !form.code}
            >
              {updateSubject.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Proposal Wizard */}
      {curriculumId && institutionId && (
        <SubjectProposalWizard
          open={isWizardOpen}
          onOpenChange={setIsWizardOpen}
          institutionId={institutionId}
          curriculumId={curriculumId}
          curriculumName={curriculum?.shortName || 'Curriculum'}
          institutionType={institution?.type}
        />
      )}
    </DashboardLayout>
  );
}
