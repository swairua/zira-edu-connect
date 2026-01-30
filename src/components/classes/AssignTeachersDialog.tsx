import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Switch } from '@/components/ui/switch';
import { useClassTeachers, useAssignTeacher, useRemoveTeacherAssignment, useUpdateClassTeacher } from '@/hooks/useClassTeachers';
import { useTeachers } from '@/hooks/useStaff';
import { useSubjects } from '@/hooks/useSubjects';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Plus, Trash2, UserPlus, GraduationCap, BookOpen } from 'lucide-react';
import type { Class } from '@/hooks/useClasses';

interface AssignTeachersDialogProps {
  classData: Class;
  institutionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignTeachersDialog({ classData, institutionId, open, onOpenChange }: AssignTeachersDialogProps) {
  const { data: assignments = [], isLoading: assignmentsLoading } = useClassTeachers(classData.id);
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers(institutionId);
  const { data: subjects = [] } = useSubjects(institutionId);
  
  const assignTeacher = useAssignTeacher();
  const removeAssignment = useRemoveTeacherAssignment();
  const updateAssignment = useUpdateClassTeacher();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isClassTeacher, setIsClassTeacher] = useState(false);

  const handleAssign = async () => {
    if (!selectedTeacher) return;

    await assignTeacher.mutateAsync({
      class_id: classData.id,
      staff_id: selectedTeacher,
      subject_id: selectedSubject && selectedSubject !== 'all' ? selectedSubject : null,
      is_class_teacher: isClassTeacher,
      institution_id: institutionId,
    });

    setSelectedTeacher('');
    setSelectedSubject('');
    setIsClassTeacher(false);
    setShowAddForm(false);
  };

  const handleToggleClassTeacher = async (assignmentId: string, current: boolean) => {
    await updateAssignment.mutateAsync({ id: assignmentId, is_class_teacher: !current });
  };

  // Filter out already assigned teachers for the same subject
  const availableTeachers = teachers.filter(t => {
    if (!selectedSubject || selectedSubject === 'all') {
      // For "All Subjects", check if teacher is already assigned without a subject
      return !assignments.some(a => a.staff_id === t.id && !a.subject_id);
    }
    return !assignments.some(a => a.staff_id === t.id && a.subject_id === selectedSubject);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Assign Teachers - {classData.name}
          </DialogTitle>
          <DialogDescription>
            Assign teachers to this class and their subjects
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            {/* Current Assignments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Assigned Teachers</h4>
                <PermissionGate domain="system_settings" action="edit">
                  {!showAddForm && (
                    <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Teacher
                    </Button>
                  )}
                </PermissionGate>
              </div>

              {assignmentsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : assignments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No teachers assigned yet</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Class Teacher</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="font-medium">
                              {assignment.staff?.first_name} {assignment.staff?.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {assignment.staff?.employee_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            {assignment.subject ? (
                              <Badge variant="outline">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {assignment.subject.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">All Subjects</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <PermissionGate domain="system_settings" action="edit">
                              <Switch
                                checked={assignment.is_class_teacher}
                                onCheckedChange={() => handleToggleClassTeacher(assignment.id, assignment.is_class_teacher)}
                                disabled={updateAssignment.isPending}
                              />
                            </PermissionGate>
                          </TableCell>
                          <TableCell>
                            <PermissionGate domain="system_settings" action="delete">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeAssignment.mutate(assignment.id)}
                                disabled={removeAssignment.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGate>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </div>

            {/* Add Teacher Form */}
            {showAddForm && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Teacher Assignment
                </h4>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Teacher</Label>
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachersLoading ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : availableTeachers.length === 0 ? (
                          <SelectItem value="none" disabled>No available teachers</SelectItem>
                        ) : (
                          availableTeachers.map(teacher => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.first_name} {teacher.last_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject (Optional)</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="All subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="class-teacher"
                      checked={isClassTeacher}
                      onCheckedChange={setIsClassTeacher}
                    />
                    <Label htmlFor="class-teacher">Designate as Class Teacher</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssign} disabled={!selectedTeacher || assignTeacher.isPending}>
                    {assignTeacher.isPending ? 'Assigning...' : 'Assign Teacher'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
