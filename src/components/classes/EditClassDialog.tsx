import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUpdateClass, type Class } from '@/hooks/useClasses';
import { useTeachers } from '@/hooks/useStaff';
import { useAcademicYears } from '@/hooks/useAcademicYears';

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

interface EditClassDialogProps {
  classData: Class;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
}

export function EditClassDialog({ classData, open, onOpenChange, institutionId }: EditClassDialogProps) {
  const { data: teachers = [] } = useTeachers(institutionId);
  const { data: academicYears = [] } = useAcademicYears(institutionId);
  const updateClass = useUpdateClass();

  const [form, setForm] = useState({
    name: '',
    level: '',
    stream: '',
    capacity: '',
    academic_year_id: '',
    class_teacher_id: '',
  });

  // Reset form when classData changes
  useEffect(() => {
    if (classData) {
      setForm({
        name: classData.name || '',
        level: classData.level || '',
        stream: classData.stream || '',
        capacity: classData.capacity?.toString() || '',
        academic_year_id: classData.academic_year_id || '',
        class_teacher_id: classData.class_teacher_id || '',
      });
    }
  }, [classData]);

  const handleSubmit = async () => {
    await updateClass.mutateAsync({
      id: classData.id,
      name: form.name,
      level: form.level,
      stream: form.stream || null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      academic_year_id: form.academic_year_id || null,
      class_teacher_id: form.class_teacher_id || null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Update class details
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Class Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Form 1 East"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-level">Level</Label>
              <Select
                value={form.level}
                onValueChange={(value) => setForm({ ...form, level: value })}
              >
                <SelectTrigger id="edit-level">
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
              <Label htmlFor="edit-stream">Stream (Optional)</Label>
              <Input
                id="edit-stream"
                placeholder="e.g., East, A, Blue"
                value={form.stream}
                onChange={(e) => setForm({ ...form, stream: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                placeholder="e.g., 45"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-academic-year">Academic Year</Label>
              <Select
                value={form.academic_year_id}
                onValueChange={(value) => setForm({ ...form, academic_year_id: value })}
              >
                <SelectTrigger id="edit-academic-year">
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
            <Label htmlFor="edit-teacher">Class Teacher</Label>
            <Select
              value={form.class_teacher_id}
              onValueChange={(value) => setForm({ ...form, class_teacher_id: value })}
            >
              <SelectTrigger id="edit-teacher">
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
        </ScrollArea>
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateClass.isPending || !form.name || !form.level}
          >
            {updateClass.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
