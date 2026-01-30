import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useAllowanceTypes, useDeleteAllowanceType } from '@/hooks/usePayroll';
import { AllowanceTypeDialog } from '@/components/hr/AllowanceTypeDialog';
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
import type { AllowanceType } from '@/hooks/usePayroll';

export default function AllowanceTypes() {
  const { data: allowances, isLoading } = useAllowanceTypes();
  const deleteAllowance = useDeleteAllowanceType();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<AllowanceType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (allowance: AllowanceType) => {
    setSelectedAllowance(allowance);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedAllowance(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteAllowance.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout title="Allowance Types">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/hr/payroll">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Allowance Types</h1>
            <p className="text-muted-foreground">Configure allowances that can be assigned to staff</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Allowance Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Allowance Types</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : allowances?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No allowance types configured yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Default Amount</TableHead>
                    <TableHead>Taxable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allowances?.map((allowance) => (
                    <TableRow key={allowance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{allowance.name}</div>
                          {allowance.description && (
                            <div className="text-sm text-muted-foreground">{allowance.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{allowance.code}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{allowance.calculation_type}</TableCell>
                      <TableCell className="text-right">
                        {allowance.calculation_type === 'percentage'
                          ? `${allowance.default_amount}%`
                          : formatCurrency(allowance.default_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={allowance.is_taxable ? 'default' : 'secondary'}>
                          {allowance.is_taxable ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={allowance.is_active ? 'default' : 'secondary'}>
                          {allowance.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(allowance)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(allowance.id)}
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

        <AllowanceTypeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          allowance={selectedAllowance}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Allowance Type</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this allowance type? This action cannot be undone.
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
