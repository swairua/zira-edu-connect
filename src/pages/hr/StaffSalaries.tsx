import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Wallet, ArrowLeft } from 'lucide-react';
import { useStaffSalaries, useCreateStaffSalary } from '@/hooks/usePayroll';
import { useStaff } from '@/hooks/useStaff';
import { useInstitution } from '@/contexts/InstitutionContext';
import { StaffSalaryDialog } from '@/components/hr/StaffSalaryDialog';
import { Link } from 'react-router-dom';

export default function StaffSalaries() {
  const { institution } = useInstitution();
  const { data: salaries, isLoading: salariesLoading } = useStaffSalaries();
  const { data: staff, isLoading: staffLoading } = useStaff(institution?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const isLoading = salariesLoading || staffLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get staff without current salary
  const staffWithoutSalary = staff?.filter(
    s => s.is_active !== false && !s.deleted_at &&
    !salaries?.some(sal => sal.staff_id === s.id)
  ) || [];

  const filteredSalaries = salaries?.filter(s => {
    const name = `${s.staff?.first_name} ${s.staff?.last_name}`.toLowerCase();
    const empNo = s.staff?.employee_number?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase()) || empNo.includes(searchTerm.toLowerCase());
  }) || [];

  const handleAddSalary = (staffId?: string) => {
    setSelectedStaffId(staffId || null);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout title="Staff Salaries">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/hr/payroll">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Staff Salaries</h1>
            <p className="text-muted-foreground">Manage basic salaries for all staff members</p>
          </div>
        </div>

        {/* Staff without salary warning */}
        {staffWithoutSalary.length > 0 && (
          <Card className="border-warning bg-warning/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Staff Missing Salary Information ({staffWithoutSalary.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {staffWithoutSalary.slice(0, 5).map(s => (
                  <Badge
                    key={s.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleAddSalary(s.id)}
                  >
                    {s.first_name} {s.last_name}
                  </Badge>
                ))}
                {staffWithoutSalary.length > 5 && (
                  <Badge variant="secondary">+{staffWithoutSalary.length - 5} more</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Salary Directory</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button onClick={() => handleAddSalary()}>
                <Plus className="h-4 w-4 mr-2" />
                Set Salary
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredSalaries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No matching staff found' : 'No salary records yet'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-right">Basic Salary</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {salary.staff?.first_name} {salary.staff?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {salary.staff?.employee_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{salary.staff?.department || '-'}</TableCell>
                      <TableCell>{salary.staff?.designation || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(salary.basic_salary)}
                      </TableCell>
                      <TableCell>
                        {new Date(salary.effective_from).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddSalary(salary.staff_id)}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <StaffSalaryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          staffId={selectedStaffId}
          existingSalaries={salaries || []}
          allStaff={staff || []}
        />
      </div>
    </DashboardLayout>
  );
}
