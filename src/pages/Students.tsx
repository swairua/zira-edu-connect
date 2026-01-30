import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { BulkStudentImportDialog } from '@/components/students/BulkStudentImportDialog';
import { BulkStudentUpdateDialog } from '@/components/students/BulkStudentUpdateDialog';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useStudents, useStudentStats } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  UserPlus,
  GraduationCap,
  UserCheck,
  UserX,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { format } from 'date-fns';

export default function Students() {
  const navigate = useNavigate();
  const { institutionId, institution } = useInstitution();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);

  const { data: students = [], isLoading } = useStudents(institutionId, {
    search: search || undefined,
    classId: classFilter !== 'all' ? classFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const { data: classes = [] } = useClasses(institutionId);
  const { data: stats } = useStudentStats(institutionId);

  // Get existing admission numbers for validation
  const existingAdmissionNumbers = students.map((s) => s.admission_number);

  const getStatusBadge = (status: string | null | undefined) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Active', variant: 'default' },
      graduated: { label: 'Graduated', variant: 'secondary' },
      transferred: { label: 'Transferred', variant: 'outline' },
      suspended: { label: 'Suspended', variant: 'destructive' },
      withdrawn: { label: 'Withdrawn', variant: 'destructive' },
    };
    const config = statusMap[status || 'active'] || statusMap.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Students" subtitle="Manage student records">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">
              Manage student records for {institution?.name || 'your institution'}
            </p>
          </div>
          <PermissionGate domain="students" action="create">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBulkUpdateOpen(true)} className="gap-2" disabled={students.length === 0}>
                <RefreshCw className="h-4 w-4" />
                Bulk Update
              </Button>
              <Button variant="outline" onClick={() => setIsBulkImportOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Import
              </Button>
              <Button onClick={() => navigate('/students/new')} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Student
              </Button>
            </div>
          </PermissionGate>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats?.active || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                  <GraduationCap className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Male</p>
                  <p className="text-2xl font-bold">{stats?.male || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <UserX className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Female</p>
                  <p className="text-2xl font-bold">{stats?.female || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Student Records</CardTitle>
                <CardDescription>
                  {students.length} student{students.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 sm:w-64"
                  />
                </div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
                <PermissionGate domain="students" action="export">
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </PermissionGate>
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
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No students found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {search || classFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first student'}
                </p>
                <PermissionGate domain="students" action="create">
                  <Button onClick={() => navigate('/students/new')} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Student
                  </Button>
                </PermissionGate>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Admission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/students/${student.id}`)}
                      >
                        <TableCell className="font-medium">
                          {student.admission_number}
                        </TableCell>
                        <TableCell>
                          {student.first_name} {student.middle_name || ''} {student.last_name}
                        </TableCell>
                        <TableCell>
                          {student.class?.name || '-'}
                        </TableCell>
                        <TableCell className="capitalize">
                          {student.gender || '-'}
                        </TableCell>
                        <TableCell>
                          {student.admission_date
                            ? format(new Date(student.admission_date), 'dd MMM yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/students/${student.id}`);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bulk Import Dialog */}
      {institutionId && (
        <BulkStudentImportDialog
          open={isBulkImportOpen}
          onOpenChange={setIsBulkImportOpen}
          institutionId={institutionId}
          existingAdmissionNumbers={existingAdmissionNumbers}
        />
      )}

      {/* Bulk Update Dialog */}
      {institutionId && (
        <BulkStudentUpdateDialog
          open={isBulkUpdateOpen}
          onOpenChange={setIsBulkUpdateOpen}
          institutionId={institutionId}
          students={students}
          institutionName={institution?.name}
        />
      )}
    </DashboardLayout>
  );
}
