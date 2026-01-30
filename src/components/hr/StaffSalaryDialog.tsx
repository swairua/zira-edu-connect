import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useCreateStaffSalary, type StaffSalary } from '@/hooks/usePayroll';
import type { Staff } from '@/hooks/useStaff';

interface StaffSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string | null;
  existingSalaries: StaffSalary[];
  allStaff: Staff[];
}

interface FormData {
  staff_id: string;
  basic_salary: number;
}

export function StaffSalaryDialog({
  open,
  onOpenChange,
  staffId,
  existingSalaries,
  allStaff,
}: StaffSalaryDialogProps) {
  const createSalary = useCreateStaffSalary();
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      staff_id: '',
      basic_salary: 0,
    },
  });

  const selectedStaffId = watch('staff_id');

  useEffect(() => {
    if (open) {
      if (staffId) {
        const existingSalary = existingSalaries.find(s => s.staff_id === staffId);
        reset({
          staff_id: staffId,
          basic_salary: existingSalary?.basic_salary || 0,
        });
      } else {
        reset({
          staff_id: '',
          basic_salary: 0,
        });
      }
    }
  }, [open, staffId, existingSalaries, reset]);

  const onSubmit = async (data: FormData) => {
    await createSalary.mutateAsync({
      staff_id: data.staff_id,
      basic_salary: data.basic_salary,
    });
    onOpenChange(false);
  };

  // Filter staff for dropdown - only show active staff
  const availableStaff = allStaff.filter(
    s => s.is_active !== false && !s.deleted_at
  );

  const selectedStaff = availableStaff.find(s => s.id === selectedStaffId);
  const existingSalary = existingSalaries.find(s => s.staff_id === selectedStaffId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingSalary ? 'Update Staff Salary' : 'Set Staff Salary'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff_id">Staff Member</Label>
              <Select
                value={selectedStaffId}
                onValueChange={(value) => setValue('staff_id', value)}
                disabled={!!staffId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {availableStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.first_name} {staff.last_name}
                      {staff.employee_number && ` (${staff.employee_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStaff && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="font-medium">{selectedStaff.first_name} {selectedStaff.last_name}</div>
                <div className="text-muted-foreground">
                  {selectedStaff.department} • {selectedStaff.designation}
                </div>
                {existingSalary && (
                  <div className="mt-2 text-muted-foreground">
                    Current salary: KES {existingSalary.basic_salary.toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="basic_salary">Basic Salary (KES)</Label>
              <Input
                id="basic_salary"
                type="number"
                min={0}
                step={100}
                {...register('basic_salary', {
                  required: 'Salary is required',
                  min: { value: 0, message: 'Salary must be positive' },
                  valueAsNumber: true,
                })}
                placeholder="Enter basic salary"
              />
              {errors.basic_salary && (
                <p className="text-sm text-destructive">{errors.basic_salary.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSalary.isPending || !selectedStaffId}>
                {createSalary.isPending ? 'Saving...' : existingSalary ? 'Update Salary' : 'Set Salary'}
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
