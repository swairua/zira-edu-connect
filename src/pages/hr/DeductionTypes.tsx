import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ArrowLeft, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { useDeductionTypes, useDeleteDeductionType } from '@/hooks/usePayroll';
import { DeductionTypeDialog } from '@/components/hr/DeductionTypeDialog';
import { StatutorySetupWizard } from '@/components/hr/StatutorySetupWizard';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { DeductionType } from '@/hooks/usePayroll';

export default function DeductionTypes() {
  const { data: deductions, isLoading } = useDeductionTypes();
  const deleteDeduction = useDeleteDeductionType();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statutoryWizardOpen, setStatutoryWizardOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<DeductionType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (deduction: DeductionType) => {
    setSelectedDeduction(deduction);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedDeduction(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDeduction.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout title="Deduction Types">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/hr/payroll">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Deduction Types</h1>
            <p className="text-muted-foreground">Configure deductions that can be applied to staff salaries</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStatutoryWizardOpen(true)}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Setup Statutory
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Deduction Type
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deduction Types</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : deductions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No deduction types configured yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Default Amount</TableHead>
                    <TableHead>Statutory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductions?.map((deduction) => (
                    <TableRow key={deduction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{deduction.name}</div>
                          {deduction.description && (
                            <div className="text-sm text-muted-foreground">{deduction.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{deduction.code}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{deduction.calculation_type}</TableCell>
                      <TableCell className="text-right">
                        {deduction.calculation_type === 'percentage'
                          ? `${deduction.default_amount}%`
                          : formatCurrency(deduction.default_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={deduction.is_statutory ? 'default' : 'secondary'}>
                          {deduction.is_statutory ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={deduction.is_active ? 'default' : 'secondary'}>
                          {deduction.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(deduction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(deduction.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <DeductionTypeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          deduction={selectedDeduction}
        />

        <StatutorySetupWizard
          open={statutoryWizardOpen}
          onOpenChange={setStatutoryWizardOpen}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Deduction Type</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this deduction type? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
