import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useActivityEnrollments } from '@/hooks/useActivityEnrollments';
import { useStudents } from '@/hooks/useStudents';
import { useInstitution } from '@/contexts/InstitutionContext';
import type { Activity } from '@/hooks/useActivities';

interface EnrollStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Activity[];
}

export default function EnrollStudentDialog({ open, onOpenChange, activities }: EnrollStudentDialogProps) {
  const { institution } = useInstitution();
  const { data: students = [] } = useStudents(institution?.id || null);
  const { enrollStudent } = useActivityEnrollments();
  const [activityId, setActivityId] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleSubmit = async () => {
    if (!activityId || !studentId) return;
    await enrollStudent.mutateAsync({ activity_id: activityId, student_id: studentId });
    onOpenChange(false);
    setActivityId('');
    setStudentId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Activity</Label>
              <Select value={activityId} onValueChange={setActivityId}>
                <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                <SelectContent>
                  {activities.filter(a => a.is_active).map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!activityId || !studentId || enrollStudent.isPending} className="w-full">
            {enrollStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enroll Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
