import { useState } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAcademicYears, useCreateAcademicYear, useCreateTerm, useDeleteAcademicYear, useDeleteTerm, useSetCurrentAcademicYear } from '@/hooks/useAcademicYears';
import { RoleAwareStepCard } from '@/components/onboarding/RoleAwareStepCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Trash2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CalendarTemplateSelector } from '@/components/onboarding/CalendarTemplateSelector';

export function AcademicCalendarStep() {
  const { institutionId } = useInstitution();
  const { isStepCompleted } = useOnboarding();
  const { data: academicYears } = useAcademicYears(institutionId);
  const createAcademicYear = useCreateAcademicYear();
  const createTerm = useCreateTerm();
  const deleteAcademicYear = useDeleteAcademicYear();
  const deleteTerm = useDeleteTerm();
  const setCurrentYear = useSetCurrentAcademicYear();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTermDialogOpen, setIsTermDialogOpen] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  const [yearForm, setYearForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  const [termForm, setTermForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  const handleCreateYear = async () => {
    if (!yearForm.name || !yearForm.startDate || !yearForm.endDate || !institutionId) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    try {
      await createAcademicYear.mutateAsync({
        institution_id: institutionId,
        name: yearForm.name,
        start_date: yearForm.startDate,
        end_date: yearForm.endDate,
        is_current: !academicYears || academicYears.length === 0,
      });
      setYearForm({ name: '', startDate: '', endDate: '' });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleApplyTemplate = async (data: { 
    year: { name: string; startDate: string; endDate: string }; 
    terms: { name: string; startDate: string; endDate: string }[] 
  }) => {
    if (!institutionId) return;

    setIsApplyingTemplate(true);
    try {
      // Create the academic year
      const yearResult = await createAcademicYear.mutateAsync({
        institution_id: institutionId,
        name: data.year.name,
        start_date: data.year.startDate,
        end_date: data.year.endDate,
        is_current: !academicYears || academicYears.length === 0,
      });

      // Create all terms
      for (let i = 0; i < data.terms.length; i++) {
        const term = data.terms[i];
        await createTerm.mutateAsync({
          name: term.name,
          academic_year_id: yearResult.id,
          institution_id: institutionId,
          start_date: term.startDate,
          end_date: term.endDate,
          sequence_order: i + 1,
          is_current: i === 0, // First term is current
        });
      }

      toast({ 
        title: 'Academic calendar created!', 
        description: `Created ${data.year.name} with ${data.terms.length} terms` 
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const handleCreateTerm = async () => {
    if (!termForm.name || !termForm.startDate || !termForm.endDate || !selectedYearId || !institutionId) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const selectedYear = academicYears?.find(y => y.id === selectedYearId);
    const existingTerms = selectedYear?.terms || [];

    try {
      await createTerm.mutateAsync({
        name: termForm.name,
        academic_year_id: selectedYearId,
        institution_id: institutionId,
        start_date: termForm.startDate,
        end_date: termForm.endDate,
        sequence_order: existingTerms.length + 1,
        is_current: false,
      });
      setTermForm({ name: '', startDate: '', endDate: '' });
      setIsTermDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSetCurrent = async (yearId: string) => {
    if (!institutionId) return;
    try {
      await setCurrentYear.mutateAsync({ yearId, institutionId });
      toast({ title: 'Current year updated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const hasErrors = !academicYears || academicYears.length === 0;

  return (
    <RoleAwareStepCard
      stepId="academic_calendar"
      title="Academic Calendar"
      description="Set up your academic years and terms. This structures your entire school calendar."
      isCompleted={isStepCompleted('academic_calendar')}
      hasErrors={hasErrors}
    >
      <div className="space-y-6">
        {/* Quick Setup Template - Only show if no years exist */}
        {(!academicYears || academicYears.length === 0) && (
          <CalendarTemplateSelector 
            onApplyTemplate={handleApplyTemplate}
            isApplying={isApplyingTemplate}
            existingYearsCount={academicYears?.length || 0}
          />
        )}

        {/* Academic Years */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Academic Years</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={academicYears && academicYears.length > 0 ? "default" : "outline"}>
                <Plus className="h-4 w-4 mr-2" />
                Add Year Manually
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Academic Year</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Year Name</Label>
                  <Input
                    value={yearForm.name}
                    onChange={(e) => setYearForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., 2024/2025"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={yearForm.startDate}
                      onChange={(e) => setYearForm(p => ({ ...p, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={yearForm.endDate}
                      onChange={(e) => setYearForm(p => ({ ...p, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateYear} disabled={createAcademicYear.isPending} className="w-full">
                  Create Year
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {academicYears && academicYears.length > 0 ? (
          <div className="space-y-4">
            {academicYears.map((year) => {
              const yearTerms = year.terms || [];
              return (
                <Card key={year.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {year.name}
                        {year.is_current && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Star className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {!year.is_current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetCurrent(year.id)}
                          >
                            Set as Current
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAcademicYear.mutate(year.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(year.start_date), 'MMM d, yyyy')} - {format(new Date(year.end_date), 'MMM d, yyyy')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Terms</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedYearId(year.id);
                            setIsTermDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Term
                        </Button>
                      </div>
                      {yearTerms.length > 0 ? (
                        <div className="grid gap-2">
                          {yearTerms.map((term) => (
                            <div
                              key={term.id}
                              className="flex items-center justify-between p-2 bg-muted rounded-md"
                            >
                              <div>
                                <p className="text-sm font-medium">{term.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(term.start_date), 'MMM d')} - {format(new Date(term.end_date), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deleteTerm.mutate(term.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No terms added yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Show template option to add more years */}
            <div className="pt-4">
              <CalendarTemplateSelector 
                onApplyTemplate={handleApplyTemplate}
                isApplying={isApplyingTemplate}
                existingYearsCount={academicYears?.length || 0}
              />
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No academic years configured</p>
              <p className="text-sm text-muted-foreground mb-4">
                Use Quick Setup above or create manually
              </p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Manually
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Term Dialog */}
      <Dialog open={isTermDialogOpen} onOpenChange={setIsTermDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Term</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Term Name</Label>
              <Input
                value={termForm.name}
                onChange={(e) => setTermForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Term 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={termForm.startDate}
                  onChange={(e) => setTermForm(p => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={termForm.endDate}
                  onChange={(e) => setTermForm(p => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={handleCreateTerm} disabled={createTerm.isPending} className="w-full">
              Add Term
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </RoleAwareStepCard>
  );
}
