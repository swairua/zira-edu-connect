import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUpdateStaff, useStaffDepartments, type Staff } from '@/hooks/useStaff';

interface EditStaffDialogProps {
  staff: Staff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditStaffDialog({ staff, open, onOpenChange, onSuccess }: EditStaffDialogProps) {
  const departments = useStaffDepartments();
  const updateStaff = useUpdateStaff();

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    employee_number: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    employment_type: 'permanent',
    date_joined: '',
    is_active: true,
  });

  useEffect(() => {
    if (staff && open) {
      setForm({
        first_name: staff.first_name || '',
        middle_name: staff.middle_name || '',
        last_name: staff.last_name || '',
        employee_number: staff.employee_number || '',
        email: staff.email || '',
        phone: staff.phone || '',
        department: staff.department || '',
        designation: staff.designation || '',
        employment_type: staff.employment_type || 'permanent',
        date_joined: staff.date_joined || '',
        is_active: staff.is_active ?? true,
      });
    }
  }, [staff, open]);

  const handleSubmit = async () => {
    await updateStaff.mutateAsync({
      id: staff.id,
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name || null,
      employee_number: form.employee_number,
      email: form.email || null,
      phone: form.phone || null,
      department: form.department || null,
      designation: form.designation || null,
      employment_type: form.employment_type || null,
      date_joined: form.date_joined || null,
      is_active: form.is_active,
    });

    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update details for {staff.first_name} {staff.last_name}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_first_name">First Name *</Label>
              <Input
                id="edit_first_name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_middle_name">Middle Name</Label>
              <Input
                id="edit_middle_name"
                value={form.middle_name}
                onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_last_name">Last Name *</Label>
              <Input
                id="edit_last_name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_employee_number">Employee Number *</Label>
              <Input
                id="edit_employee_number"
                value={form.employee_number}
                onChange={(e) => setForm({ ...form, employee_number: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_date_joined">Date Joined</Label>
              <Input
                id="edit_date_joined"
                type="date"
                value={form.date_joined}
                onChange={(e) => setForm({ ...form, date_joined: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                placeholder="Required for login creation"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_department">Department</Label>
              <Select
                value={form.department}
                onValueChange={(value) => setForm({ ...form, department: value })}
              >
                <SelectTrigger id="edit_department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_designation">Designation / Title</Label>
              <Input
                id="edit_designation"
                placeholder="e.g., Teacher, Head of Department"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_employment_type">Employment Type</Label>
              <Select
                value={form.employment_type}
                onValueChange={(value) => setForm({ ...form, employment_type: value })}
              >
                <SelectTrigger id="edit_employment_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2 pt-6">
              <Label htmlFor="edit_is_active">Active Status</Label>
              <Switch
                id="edit_is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              updateStaff.isPending ||
              !form.first_name ||
              !form.last_name ||
              !form.employee_number
            }
          >
            {updateStaff.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
