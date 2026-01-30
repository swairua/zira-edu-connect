import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useInstitution } from '@/contexts/InstitutionContext';
import {
  useAcademicYears,
  useCreateAcademicYear,
  useCreateTerm,
  useSetCurrentAcademicYear,
  useSetCurrentTerm,
} from '@/hooks/useAcademicYears';
import { Calendar, Plus, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AcademicSetup() {
  const { institutionId, institution } = useInstitution();
  const { data: academicYears = [], isLoading } = useAcademicYears(institutionId);
  const createYear = useCreateAcademicYear();
  const createTerm = useCreateTerm();
  const setCurrentYear = useSetCurrentAcademicYear();
  const setCurrentTerm = useSetCurrentTerm();

  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [isTermDialogOpen, setIsTermDialogOpen] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  const [yearForm, setYearForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  const [termForm, setTermForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    sequence_order: 1,
    is_current: false,
  });

  const toggleYearExpanded = (yearId: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(yearId)) {
      newExpanded.delete(yearId);
    } else {
      newExpanded.add(yearId);
    }
    setExpandedYears(newExpanded);
  };

  const handleCreateYear = async () => {
    if (!institutionId) return;
    
    await createYear.mutateAsync({
      institution_id: institutionId,
      ...yearForm,
    });
    
    setYearForm({ name: '', start_date: '', end_date: '', is_current: false });
    setIsYearDialogOpen(false);
  };

  const handleCreateTerm = async () => {
    if (!institutionId || !selectedYearId) return;
    
    await createTerm.mutateAsync({
      institution_id: institutionId,
      academic_year_id: selectedYearId,
      ...termForm,
    });
    
    setTermForm({ name: '', start_date: '', end_date: '', sequence_order: 1, is_current: false });
    setIsTermDialogOpen(false);
    setSelectedYearId(null);
  };

  const openTermDialog = (yearId: string, existingTermsCount: number) => {
    setSelectedYearId(yearId);
    setTermForm((prev) => ({ ...prev, sequence_order: existingTermsCount + 1 }));
    setIsTermDialogOpen(true);
  };

  return (
    <DashboardLayout title="Academic Setup" subtitle="Configure academic years and terms">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Academic Calendar</h1>
            <p className="text-muted-foreground">
              Manage academic years and terms for {institution?.name || 'your institution'}
            </p>
          </div>
          <PermissionGate domain="system_settings" action="create">
            <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Academic Year
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Create Academic Year</DialogTitle>
                  <DialogDescription>
                    Add a new academic year to the calendar
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="year-name">Year Name</Label>
                      <Input
                        id="year-name"
                        placeholder="e.g., 2024/2025"
                        value={yearForm.name}
                        onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={yearForm.start_date}
                          onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={yearForm.end_date}
                          onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-current"
                        checked={yearForm.is_current}
                        onCheckedChange={(checked) => setYearForm({ ...yearForm, is_current: checked })}
                      />
                      <Label htmlFor="is-current">Set as current academic year</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-shrink-0">
                  <Button variant="outline" onClick={() => setIsYearDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateYear} disabled={createYear.isPending}>
                    {createYear.isPending ? 'Creating...' : 'Create Year'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>

        {/* Academic Years List */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Years</CardTitle>
            <CardDescription>
              {academicYears.length} academic year{academicYears.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : academicYears.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No academic years</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first academic year to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {academicYears.map((year) => (
                  <div key={year.id} className="rounded-lg border">
                    <div
                      className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50"
                      onClick={() => toggleYearExpanded(year.id)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedYears.has(year.id) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{year.name}</span>
                            {year.is_current && (
                              <Badge variant="default" className="gap-1">
                                <Star className="h-3 w-3" />
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(year.start_date), 'MMM d, yyyy')} -{' '}
                            {format(new Date(year.end_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{year.terms?.length || 0} terms</Badge>
                        {!year.is_current && institutionId && (
                          <PermissionGate domain="system_settings" action="edit">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentYear.mutate({ yearId: year.id, institutionId });
                              }}
                            >
                              Set Current
                            </Button>
                          </PermissionGate>
                        )}
                      </div>
                    </div>
                    
                    {expandedYears.has(year.id) && (
                      <div className="border-t bg-muted/30 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-medium">Terms</h4>
                          <PermissionGate domain="system_settings" action="create">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTermDialog(year.id, year.terms?.length || 0)}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add Term
                            </Button>
                          </PermissionGate>
                        </div>
                        
                        {year.terms && year.terms.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Term</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {year.terms
                                .sort((a, b) => a.sequence_order - b.sequence_order)
                                .map((term) => (
                                  <TableRow key={term.id}>
                                    <TableCell className="font-medium">{term.name}</TableCell>
                                    <TableCell>
                                      {format(new Date(term.start_date), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                      {format(new Date(term.end_date), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                      {term.is_current ? (
                                        <Badge variant="default" className="gap-1">
                                          <Star className="h-3 w-3" />
                                          Current
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">Inactive</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {!term.is_current && institutionId && (
                                        <PermissionGate domain="system_settings" action="edit">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              setCurrentTerm.mutate({ termId: term.id, institutionId })
                                            }
                                          >
                                            Set Current
                                          </Button>
                                        </PermissionGate>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="py-4 text-center text-sm text-muted-foreground">
                            No terms added yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Term Dialog */}
      <Dialog open={isTermDialogOpen} onOpenChange={setIsTermDialogOpen}>
        <DialogContent className="max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add Term</DialogTitle>
            <DialogDescription>Add a new term to the academic year</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="term-name">Term Name</Label>
                <Input
                  id="term-name"
                  placeholder="e.g., Term 1"
                  value={termForm.name}
                  onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="term-start">Start Date</Label>
                  <Input
                    id="term-start"
                    type="date"
                    value={termForm.start_date}
                    onChange={(e) => setTermForm({ ...termForm, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="term-end">End Date</Label>
                  <Input
                    id="term-end"
                    type="date"
                    value={termForm.end_date}
                    onChange={(e) => setTermForm({ ...termForm, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="term-current"
                  checked={termForm.is_current}
                  onCheckedChange={(checked) => setTermForm({ ...termForm, is_current: checked })}
                />
                <Label htmlFor="term-current">Set as current term</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setIsTermDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTerm} disabled={createTerm.isPending}>
              {createTerm.isPending ? 'Adding...' : 'Add Term'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
