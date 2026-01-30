import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { EditClassDialog } from '@/components/classes/EditClassDialog';
import { AssignTeachersDialog } from '@/components/classes/AssignTeachersDialog';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useClasses, useCreateClass, useDeleteClass, type Class } from '@/hooks/useClasses';
import { useTeachers } from '@/hooks/useStaff';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { Building, MoreHorizontal, Pencil, Plus, Search, Trash2, Users, UserPlus } from 'lucide-react';

const classLevels = [
  { value: 'PP1', label: 'PP1' },
  { value: 'PP2', label: 'PP2' },
  { value: 'Grade 1', label: 'Grade 1' },
  { value: 'Grade 2', label: 'Grade 2' },
  { value: 'Grade 3', label: 'Grade 3' },
  { value: 'Grade 4', label: 'Grade 4' },
  { value: 'Grade 5', label: 'Grade 5' },
  { value: 'Grade 6', label: 'Grade 6' },
  { value: 'Grade 7', label: 'Grade 7' },
  { value: 'Grade 8', label: 'Grade 8' },
  { value: 'Form 1', label: 'Form 1' },
  { value: 'Form 2', label: 'Form 2' },
  { value: 'Form 3', label: 'Form 3' },
  { value: 'Form 4', label: 'Form 4' },
  { value: 'Year 1', label: 'Year 1' },
  { value: 'Year 2', label: 'Year 2' },
  { value: 'Year 3', label: 'Year 3' },
  { value: 'Year 4', label: 'Year 4' },
];

export default function ClassSetup() {
  const { institutionId, institution } = useInstitution();
  const { data: classes = [], isLoading } = useClasses(institutionId);
  const { data: teachers = [] } = useTeachers(institutionId);
  const { data: academicYears = [] } = useAcademicYears(institutionId);
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [assigningTeachersClass, setAssigningTeachersClass] = useState<Class | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    level: '',
    stream: '',
    capacity: '',
    academic_year_id: '',
    class_teacher_id: '',
  });

  const handleSubmit = async () => {
    if (!institutionId) return;

    await createClass.mutateAsync({
      institution_id: institutionId,
      name: form.name,
      level: form.level,
      stream: form.stream || undefined,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
      academic_year_id: form.academic_year_id || undefined,
      class_teacher_id: form.class_teacher_id || undefined,
    });

    setForm({
      name: '',
      level: '',
      stream: '',
      capacity: '',
      academic_year_id: '',
      class_teacher_id: '',
    });
    setIsDialogOpen(false);
  };

  const filteredClasses = classes.filter((cls) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      cls.name.toLowerCase().includes(searchLower) ||
      cls.level.toLowerCase().includes(searchLower) ||
      cls.stream?.toLowerCase().includes(searchLower)
    );
  });

  // Group classes by level
  const groupedClasses = filteredClasses.reduce(
    (acc, cls) => {
      const level = cls.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(cls);
      return acc;
    },
    {} as Record<string, typeof classes>
  );

  return (
    <DashboardLayout title="Class Structure" subtitle="Configure classes and streams">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Classes</h1>
            <p className="text-muted-foreground">
              Manage classes and streams for {institution?.name || 'your institution'}
            </p>
          </div>
          <PermissionGate domain="system_settings" action="create">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>
                    Add a new class to your institution
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Form 1 East"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="level">Level</Label>
                      <Select
                        value={form.level}
                        onValueChange={(value) => setForm({ ...form, level: value })}
                      >
                        <SelectTrigger id="level">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {classLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stream">Stream (Optional)</Label>
                      <Input
                        id="stream"
                        placeholder="e.g., East, A, Blue"
                        value={form.stream}
                        onChange={(e) => setForm({ ...form, stream: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="e.g., 45"
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="academic-year">Academic Year</Label>
                      <Select
                        value={form.academic_year_id}
                        onValueChange={(value) => setForm({ ...form, academic_year_id: value })}
                      >
                        <SelectTrigger id="academic-year">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.name} {year.is_current && '(Current)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="teacher">Class Teacher</Label>
                    <Select
                      value={form.class_teacher_id}
                      onValueChange={(value) => setForm({ ...form, class_teacher_id: value })}
                    >
                      <SelectTrigger id="teacher">
                        <SelectValue placeholder="Assign class teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createClass.isPending || !form.name || !form.level}
                  >
                    {createClass.isPending ? 'Creating...' : 'Create Class'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Classes */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : Object.keys(groupedClasses).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No classes found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {search ? 'Try adjusting your search' : 'Create your first class to get started'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedClasses)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([level, levelClasses]) => (
                <Card key={level}>
                  <CardHeader>
                    <CardTitle className="text-lg">{level}</CardTitle>
                    <CardDescription>
                      {levelClasses.length} class{levelClasses.length !== 1 ? 'es' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Stream</TableHead>
                          <TableHead>Class Teacher</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {levelClasses.map((cls) => (
                          <TableRow key={cls.id}>
                            <TableCell className="font-medium">{cls.name}</TableCell>
                            <TableCell>{cls.stream || '-'}</TableCell>
                            <TableCell>
                              {cls.class_teacher
                                ? `${cls.class_teacher.first_name} ${cls.class_teacher.last_name}`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {cls.capacity ? (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  {cls.capacity}
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <PermissionGate domain="system_settings" action="edit">
                                    <DropdownMenuItem onClick={() => setAssigningTeachersClass(cls)}>
                                      <UserPlus className="mr-2 h-4 w-4" />
                                      Assign Teachers
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEditingClass(cls)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                  </PermissionGate>
                                  <PermissionGate domain="system_settings" action="delete">
                                    <DropdownMenuItem 
                                      onClick={() => deleteClass.mutate(cls.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </PermissionGate>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Edit Class Dialog */}
        {editingClass && institutionId && (
          <EditClassDialog
            classData={editingClass}
            open={!!editingClass}
            onOpenChange={(open) => !open && setEditingClass(null)}
            institutionId={institutionId}
          />
        )}

        {/* Assign Teachers Dialog */}
        {assigningTeachersClass && institutionId && (
          <AssignTeachersDialog
            classData={assigningTeachersClass}
            institutionId={institutionId}
            open={!!assigningTeachersClass}
            onOpenChange={(open) => !open && setAssigningTeachersClass(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
