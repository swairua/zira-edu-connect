import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { CreateStaffLoginDialog } from '@/components/staff/CreateStaffLoginDialog';
import { EditStaffDialog } from '@/components/staff/EditStaffDialog';
import { EditStaffRoleDialog } from '@/components/staff/EditStaffRoleDialog';
import { StaffRolesManager } from '@/components/staff/StaffRolesManager';
import { ManageStaffModulesDialog } from '@/components/staff/ManageStaffModulesDialog';
import { StaffImportDialog } from '@/components/imports/StaffImportDialog';
import { BulkStaffUpdateDialog } from '@/components/staff/BulkStaffUpdateDialog';
import { StaffPermissionsTab } from '@/components/staff/StaffPermissionsTab';
import { StaffAccessOverviewCard } from '@/components/staff/StaffAccessOverviewCard';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useStaff, useCreateStaff, useStaffDepartments, type Staff as StaffType } from '@/hooks/useStaff';
import { getDesignationSuggestions } from '@/lib/staff-utils';
import { Users, Plus, Search, Filter, Mail, Phone, Building, MoreHorizontal, KeyRound, UserCheck, Pencil, Send, Loader2, Shield, Check, ChevronsUpDown, Upload, Package, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { AppRole } from '@/types/database';

export default function Staff() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { institutionId, institution } = useInstitution();
  const departments = useStaffDepartments();
  
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStaffImportOpen, setIsStaffImportOpen] = useState(false);
  const [isStaffUpdateOpen, setIsStaffUpdateOpen] = useState(false);
  const [staffForLogin, setStaffForLogin] = useState<StaffType | null>(null);
  const [staffToEdit, setStaffToEdit] = useState<StaffType | null>(null);
  const [staffForRoleEdit, setStaffForRoleEdit] = useState<{ staff: StaffType; role: string } | null>(null);
  const [staffForRolesManager, setStaffForRolesManager] = useState<StaffType | null>(null);
  const [staffForModules, setStaffForModules] = useState<{ staff: StaffType; role: AppRole | null } | null>(null);
  const [resendingEmailFor, setResendingEmailFor] = useState<string | null>(null);
  const [designationOpen, setDesignationOpen] = useState(false);

  const { data: staff = [], isLoading } = useStaff(institutionId, {
    search,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    isActive: true,
  });

  const createStaff = useCreateStaff();

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
  });

  // Get designation suggestions based on selected department
  const designationSuggestions = useMemo(() => {
    return getDesignationSuggestions(form.department);
  }, [form.department]);

  // Fetch staff roles for users who have logins
  const { data: staffRoles = {} } = useQuery({
    queryKey: ['staff-roles', institutionId, staff.map(s => s.user_id).join(',')],
    queryFn: async () => {
      if (!institutionId) return {};
      
      const staffWithUsers = staff.filter(s => s.user_id);
      if (staffWithUsers.length === 0) return {};
      
      const userIds = staffWithUsers.map(s => s.user_id).filter(Boolean);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
        .eq('institution_id', institutionId);
      
      if (error) throw error;
      
      return (data || []).reduce((acc, item) => {
        acc[item.user_id] = item.role;
        return acc;
      }, {} as Record<string, string>);
    },
    enabled: !!institutionId && staff.some(s => s.user_id),
  });

  const handleLoginCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['staff', institutionId] });
  };

  const handleResendWelcomeEmail = async (member: StaffType) => {
    if (!member.email) {
      toast.error('Staff member has no email address');
      return;
    }

    setResendingEmailFor(member.id);

    try {
      const { data, error } = await supabase.functions.invoke('resend-welcome-email', {
          body: {
            email: member.email,
            firstName: member.first_name,
            lastName: member.last_name,
            role: member.designation || member.department || 'Staff',
            loginUrl: `${window.location.origin}/auth`,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        // Check if email is Yahoo or Outlook and show appropriate message
        const emailDomain = member.email.toLowerCase();
        const isYahooOrOutlook = emailDomain.includes('@yahoo') || emailDomain.includes('@outlook') || emailDomain.includes('@hotmail');
        
        toast.success('Welcome email sent', {
          description: isYahooOrOutlook 
            ? `Email sent to ${member.email}. Please ask them to check their Spam/Junk folder.`
            : `Email sent to ${member.email}`,
        });
      } catch (error: any) {
        console.error('Error resending welcome email:', error);
        toast.error('Failed to send email', { description: error.message });
      } finally {
        setResendingEmailFor(null);
      }
    };

  const handleSubmit = async () => {
    if (!institutionId) return;

    await createStaff.mutateAsync({
      institution_id: institutionId,
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name || undefined,
      employee_number: form.employee_number,
      email: form.email || undefined,
      phone: form.phone || undefined,
      department: form.department || undefined,
      designation: form.designation || undefined,
      employment_type: form.employment_type || undefined,
      date_joined: form.date_joined || undefined,
    });

    setForm({
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
    });
    setIsDialogOpen(false);
  };

  const getDepartmentBadgeVariant = (dept: string | null | undefined) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      Teaching: 'default',
      Administration: 'secondary',
      Finance: 'secondary',
      IT: 'outline',
    };
    return variants[dept || ''] || 'outline';
  };

  // Stats
  const totalStaff = staff.length;
  const teachingStaff = staff.filter(
    (s) => s.department === 'Teaching' || s.department === 'Academic'
  ).length;
  const nonTeachingStaff = totalStaff - teachingStaff;

  return (
    <DashboardLayout title="Staff" subtitle="Manage institution staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground">
              Manage staff for {institution?.name || 'your institution'}
            </p>
          </div>
          <PermissionGate domain="staff_hr" action="create">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsStaffUpdateOpen(true)} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Bulk Update
              </Button>
              <Button variant="outline" onClick={() => setIsStaffImportOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Import
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Staff
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Add New Staff Member</DialogTitle>
                  <DialogDescription>Enter staff member details</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input
                        id="middle_name"
                        value={form.middle_name}
                        onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="employee_number">Employee Number *</Label>
                      <Input
                        id="employee_number"
                        placeholder="e.g., EMP001"
                        value={form.employee_number}
                        onChange={(e) => setForm({ ...form, employee_number: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date_joined">Date Joined</Label>
                      <Input
                        id="date_joined"
                        type="date"
                        value={form.date_joined}
                        onChange={(e) => setForm({ ...form, date_joined: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={form.department}
                        onValueChange={(value) => setForm({ ...form, department: value })}
                      >
                        <SelectTrigger id="department">
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
                      <Label htmlFor="designation">Designation / Title</Label>
                      <Popover open={designationOpen} onOpenChange={setDesignationOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={designationOpen}
                            className="justify-between font-normal"
                          >
                            {form.designation || "Select or type designation..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search or type designation..." 
                              value={form.designation}
                              onValueChange={(value) => setForm({ ...form, designation: value })}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <p className="py-2 px-3 text-sm text-muted-foreground">
                                  Press enter to use "{form.designation}"
                                </p>
                              </CommandEmpty>
                              {designationSuggestions.length > 0 && (
                                <CommandGroup heading="Suggestions">
                                  {designationSuggestions.map((designation) => (
                                    <CommandItem
                                      key={designation}
                                      value={designation}
                                      onSelect={(currentValue) => {
                                        setForm({ ...form, designation: currentValue });
                                        setDesignationOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.designation === designation ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {designation}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {!form.department && (
                        <p className="text-xs text-muted-foreground">
                          Select a department first for suggestions
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select
                      value={form.employment_type}
                      onValueChange={(value) => setForm({ ...form, employment_type: value })}
                    >
                      <SelectTrigger id="employment_type">
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
                  </div>
                </div>
                <DialogFooter className="flex-shrink-0">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      createStaff.isPending ||
                      !form.first_name ||
                      !form.last_name ||
                      !form.employee_number
                    }
                  >
                    {createStaff.isPending ? 'Adding...' : 'Add Staff'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </PermissionGate>
        </div>

        {/* Staff Import Dialog */}
        {institutionId && (
          <StaffImportDialog
            open={isStaffImportOpen}
            onOpenChange={(open) => {
              setIsStaffImportOpen(open);
              if (!open) queryClient.invalidateQueries({ queryKey: ['staff'] });
            }}
            institutionId={institutionId}
          />
        )}

        {/* Access Overview Card */}
        <StaffAccessOverviewCard staff={staff} staffRoles={staffRoles} />

        {/* Tabs for Directory and Permissions */}
        <Tabs defaultValue="directory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="directory">Directory</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>
                  {staff.length} staff member{staff.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search staff..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 sm:w-64"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : staff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No staff found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {search || departmentFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add your first staff member to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => {
                      // Format: "Designation - NumericCode" e.g. "Headteacher - 01"
                      const numericCode = member.employee_number?.replace(/\D/g, '').slice(-2).padStart(2, '0') || member.employee_number;
                      const formattedCode = member.designation 
                        ? `${member.designation} - ${numericCode || '--'}`
                        : member.employee_number || '--';
                      return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium" title={`Raw: ${member.employee_number}`}>
                          {formattedCode}
                        </TableCell>
                        <TableCell>
                          {member.first_name} {member.middle_name} {member.last_name}
                        </TableCell>
                        <TableCell>
                          {member.department ? (
                            <Badge variant={getDepartmentBadgeVariant(member.department)}>
                              {member.department}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{member.designation || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {member.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {member.email}
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={member.is_active ? 'default' : 'secondary'}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {member.user_id && (
                              <Badge variant="outline" className="gap-1">
                                <UserCheck className="h-3 w-3" />
                                Login
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <PermissionGate domain="staff_hr" action="edit">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setStaffToEdit(member)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                {!member.user_id && member.email && (
                                  <DropdownMenuItem onClick={() => setStaffForLogin(member)}>
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Create Login
                                  </DropdownMenuItem>
                                )}
                                {!member.user_id && !member.email && (
                                  <DropdownMenuItem disabled className="text-muted-foreground">
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Add email first
                                  </DropdownMenuItem>
                                )}
                                {member.user_id && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => setStaffForRolesManager(member)}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      Manage Roles
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        const role = staffRoles[member.user_id!] as AppRole || null;
                                        setStaffForModules({ staff: member, role });
                                      }}
                                    >
                                      <Package className="mr-2 h-4 w-4" />
                                      Manage Modules
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {member.user_id && member.email && (
                                  <DropdownMenuItem 
                                    onClick={() => handleResendWelcomeEmail(member)}
                                    disabled={resendingEmailFor === member.id}
                                  >
                                    {resendingEmailFor === member.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="mr-2 h-4 w-4" />
                                    )}
                                    Resend Welcome Email
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </PermissionGate>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="permissions">
            {institutionId && (
              <StaffPermissionsTab 
                staff={staff} 
                staffRoles={staffRoles} 
                institutionId={institutionId} 
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Create Login Dialog */}
        {staffForLogin && (
          <CreateStaffLoginDialog
            staff={staffForLogin}
            open={!!staffForLogin}
            onOpenChange={(open) => !open && setStaffForLogin(null)}
            onSuccess={handleLoginCreated}
          />
        )}

        {/* Edit Staff Dialog */}
        {staffToEdit && (
          <EditStaffDialog
            staff={staffToEdit}
            open={!!staffToEdit}
            onOpenChange={(open) => !open && setStaffToEdit(null)}
            onSuccess={handleLoginCreated}
          />
        )}

        {/* Edit Staff Role Dialog */}
        {staffForRoleEdit && (
          <EditStaffRoleDialog
            staff={staffForRoleEdit.staff}
            currentRole={staffForRoleEdit.role}
            open={!!staffForRoleEdit}
            onOpenChange={(open) => !open && setStaffForRoleEdit(null)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['staff-roles', institutionId] });
            }}
          />
        )}

        {/* Staff Roles Manager Dialog */}
        {staffForRolesManager && (
          <StaffRolesManager
            staff={staffForRolesManager}
            open={!!staffForRolesManager}
            onOpenChange={(open) => !open && setStaffForRolesManager(null)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['staff-roles', institutionId] });
            }}
          />
        )}

        {/* Manage Staff Modules Dialog */}
        {staffForModules && (
          <ManageStaffModulesDialog
            staff={staffForModules.staff}
            staffRole={staffForModules.role}
            open={!!staffForModules}
            onOpenChange={(open) => !open && setStaffForModules(null)}
          />
        )}

        {/* Bulk Staff Update Dialog */}
        {institutionId && (
          <BulkStaffUpdateDialog
            open={isStaffUpdateOpen}
            onOpenChange={setIsStaffUpdateOpen}
            institutionId={institutionId}
            staff={staff}
            institutionName={institution?.name}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
