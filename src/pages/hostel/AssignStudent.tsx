import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ArrowRight,
  User,
  Bed,
  CheckCircle,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudents } from '@/hooks/useStudents';
import { useHostels, useAvailableBeds } from '@/hooks/useHostels';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useAllocateBed, useStudentAllocation } from '@/hooks/useBedAllocations';
import { useInstitution } from '@/contexts/InstitutionContext';
import { cn } from '@/lib/utils';

type Step = 'student' | 'bed' | 'confirm';

export default function AssignStudent() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedHostelId, setSelectedHostelId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const { institution } = useInstitution();
  const { data: students } = useStudents(institution?.id || null);
  const { data: hostels } = useHostels();
  const { data: academicYears } = useAcademicYears(institution?.id || null);
  const { data: availableBeds } = useAvailableBeds(selectedHostelId || undefined);
  const { data: existingAllocation } = useStudentAllocation(selectedStudentId || undefined);
  const allocateBed = useAllocateBed();

  const currentYear = academicYears?.find(y => y.is_current);
  
  // Filter students by boarding status (day or day_boarding) who don't have active allocations
  const eligibleStudents = students?.filter(s => 
    s.boarding_status !== 'boarding' &&
    (s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.admission_number?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 20);

  const selectedStudent = students?.find(s => s.id === selectedStudentId);
  const selectedBed = availableBeds?.find(b => b.id === selectedBedId);

  const handleSubmit = async () => {
    if (!selectedStudentId || !selectedBedId || !academicYearId) return;

    await allocateBed.mutateAsync({
      student_id: selectedStudentId,
      bed_id: selectedBedId,
      academic_year_id: academicYearId,
      start_date: startDate,
      notes: notes || undefined,
    });

    navigate('/hostel/allocations');
  };

  const canProceedFromStudent = selectedStudentId && !existingAllocation;
  const canProceedFromBed = selectedBedId && academicYearId;

  return (
    <DashboardLayout
      title="Assign Student to Bed"
      subtitle="Allocate a boarding bed to a student"
      actions={
        <Button variant="outline" asChild>
          <Link to="/hostel/allocations">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {(['student', 'bed', 'confirm'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-medium transition-colors",
                  step === s ? "bg-primary text-primary-foreground" :
                  (['student', 'bed', 'confirm'].indexOf(step) > i) ? "bg-green-500 text-white" :
                  "bg-muted text-muted-foreground"
                )}
              >
                {(['student', 'bed', 'confirm'].indexOf(step) > i) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div className={cn(
                  "w-16 h-0.5 mx-2",
                  (['student', 'bed', 'confirm'].indexOf(step) > i) ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step: Select Student */}
        {step === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Student
              </CardTitle>
              <CardDescription>
                Choose a day student to assign to a boarding bed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or admission number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {existingAllocation && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-700">
                  This student already has an active bed allocation. End the current allocation first.
                </div>
              )}

              <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                {eligibleStudents?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No eligible students found
                  </p>
                ) : (
                  eligibleStudents?.map((student) => (
                    <div
                      key={student.id}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedStudentId === student.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-muted-foreground/30"
                      )}
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.admission_number} • {student.class?.name}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {student.boarding_status === 'day' ? 'Day Student' : 'Day/Boarding'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setStep('bed')} 
                  disabled={!canProceedFromStudent}
                >
                  Next: Select Bed <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Select Bed */}
        {step === 'bed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Select Bed
              </CardTitle>
              <CardDescription>
                Choose a hostel and available bed for {selectedStudent?.first_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Academic Year *</Label>
                  <Select value={academicYearId} onValueChange={setAcademicYearId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears?.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} {year.is_current && '(Current)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Filter by Hostel</Label>
                  <Select value={selectedHostelId || 'all'} onValueChange={(v) => setSelectedHostelId(v === 'all' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All hostels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Hostels</SelectItem>
                      {hostels?.map((hostel) => (
                        <SelectItem key={hostel.id} value={hostel.id}>
                          {hostel.name} ({hostel.gender})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Available Beds</Label>
                <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                  {availableBeds?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No available beds found
                    </p>
                  ) : (
                    availableBeds?.map((bed) => (
                      <div
                        key={bed.id}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-colors",
                          selectedBedId === bed.id 
                            ? "border-primary bg-primary/5" 
                            : "hover:border-muted-foreground/30"
                        )}
                        onClick={() => setSelectedBedId(bed.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {bed.room?.hostel?.name} - Room {bed.room?.room_number}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Bed {bed.bed_number} • {bed.room?.floor || 'Ground'} Floor
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {bed.room?.hostel?.gender}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about this allocation..."
                  rows={2}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('student')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button 
                  onClick={() => setStep('confirm')} 
                  disabled={!canProceedFromBed}
                >
                  Next: Confirm <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Confirm Allocation
              </CardTitle>
              <CardDescription>
                Review the details before confirming the bed assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Student</p>
                  <p className="font-medium">{selectedStudent?.first_name} {selectedStudent?.last_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStudent?.admission_number}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Bed Assignment</p>
                  <p className="font-medium">{selectedBed?.room?.hostel?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Room {selectedBed?.room?.room_number}, Bed {selectedBed?.bed_number}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Academic Year</p>
                  <p className="font-medium">
                    {academicYears?.find(y => y.id === academicYearId)?.name}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Start Date</p>
                  <p className="font-medium">{startDate}</p>
                </div>
              </div>

              {notes && (
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{notes}</p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> This assignment will automatically update the student's boarding status and may generate boarding fees based on your fee configuration.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('bed')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={allocateBed.isPending}
                >
                  {allocateBed.isPending ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
