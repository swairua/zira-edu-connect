import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateTimetable } from '@/hooks/useTimetables';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export default function CreateTimetable() {
  const navigate = useNavigate();
  const { institutionId } = useInstitution();
  const createMutation = useCreateTimetable();
  const academicYearsQuery = useAcademicYears(institutionId);
  const academicYears = academicYearsQuery.data;
  const yearsLoading = academicYearsQuery.isLoading;

  const [formData, setFormData] = useState({
    name: '',
    timetable_type: 'main',
    academic_year_id: '',
    effective_from: '',
    effective_to: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.academic_year_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: formData.name,
        timetable_type: formData.timetable_type,
        academic_year_id: formData.academic_year_id,
        effective_from: formData.effective_from || null,
        effective_to: formData.effective_to || null,
        notes: formData.notes || null,
        status: 'draft',
      });
      toast.success('Timetable created successfully');
      navigate(`/timetable/${result.id}`);
    } catch (error) {
      toast.error('Failed to create timetable');
    }
  };

  return (
    <DashboardLayout title="Create Timetable">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Timetable</h1>
            <p className="text-muted-foreground">Set up a new timetable for your institution</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timetable Details
              </CardTitle>
              <CardDescription>
                Define the basic information for your timetable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Timetable Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Term 1 Main Timetable"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Timetable Type *</Label>
                  <Select
                    value={formData.timetable_type}
                    onValueChange={(value) => setFormData({ ...formData, timetable_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Timetable</SelectItem>
                      <SelectItem value="boarding_evening">Boarding Evening</SelectItem>
                      <SelectItem value="saturday">Saturday Classes</SelectItem>
                      <SelectItem value="exam">Exam Timetable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year *</Label>
                  <Select
                    value={formData.academic_year_id}
                    onValueChange={(value) => setFormData({ ...formData, academic_year_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearsLoading ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</div>
                      ) : academicYears?.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No academic years found</div>
                      ) : (
                        academicYears?.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.is_current && '(Current)'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effective_from">Effective From</Label>
                  <Input
                    id="effective_from"
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effective_to">Effective To</Label>
                  <Input
                    id="effective_to"
                    type="date"
                    value={formData.effective_to}
                    onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this timetable..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Timetable
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
