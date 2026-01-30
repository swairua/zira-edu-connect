import { useState } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSubjects, useCreateSubject, useDeleteSubject } from '@/hooks/useSubjects';
import { RoleAwareStepCard } from '@/components/onboarding/RoleAwareStepCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRESET_SUBJECTS = {
  primary: [
    { name: 'Mathematics', code: 'MATH', category: 'core' },
    { name: 'English', code: 'ENG', category: 'core' },
    { name: 'Kiswahili', code: 'KIS', category: 'core' },
    { name: 'Science', code: 'SCI', category: 'core' },
    { name: 'Social Studies', code: 'SST', category: 'core' },
    { name: 'Religious Education', code: 'CRE', category: 'elective' },
    { name: 'Creative Arts', code: 'ART', category: 'elective' },
    { name: 'Physical Education', code: 'PE', category: 'elective' },
    { name: 'Agriculture', code: 'AGR', category: 'elective' },
    { name: 'Home Science', code: 'HS', category: 'elective' },
  ],
  secondary: [
    { name: 'Mathematics', code: 'MATH', category: 'core' },
    { name: 'English', code: 'ENG', category: 'core' },
    { name: 'Kiswahili', code: 'KIS', category: 'core' },
    { name: 'Biology', code: 'BIO', category: 'science' },
    { name: 'Chemistry', code: 'CHEM', category: 'science' },
    { name: 'Physics', code: 'PHY', category: 'science' },
    { name: 'History', code: 'HIST', category: 'humanities' },
    { name: 'Geography', code: 'GEO', category: 'humanities' },
    { name: 'Business Studies', code: 'BS', category: 'technical' },
    { name: 'Computer Studies', code: 'CS', category: 'technical' },
    { name: 'Religious Education', code: 'CRE', category: 'elective' },
    { name: 'Agriculture', code: 'AGR', category: 'elective' },
  ],
};

export function SubjectSetupStep() {
  const { institution, institutionId } = useInstitution();
  const { isStepCompleted } = useOnboarding();
  const { data: subjects } = useSubjects(institutionId);
  const createSubject = useCreateSubject();
  const deleteSubject = useDeleteSubject();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    category: 'core',
  });

  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);

  const institutionType = institution?.type || 'primary';
  const presetSubjects = institutionType === 'secondary' 
    ? PRESET_SUBJECTS.secondary 
    : PRESET_SUBJECTS.primary;

  const handleCreateSubject = async () => {
    if (!subjectForm.name || !subjectForm.code || !institutionId) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    try {
      await createSubject.mutateAsync({
        institution_id: institutionId,
        name: subjectForm.name,
        code: subjectForm.code,
        category: subjectForm.category,
      });
      setSubjectForm({ name: '', code: '', category: 'core' });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleBulkCreate = async () => {
    if (selectedPresets.length === 0 || !institutionId) {
      toast({ title: 'Please select at least one subject', variant: 'destructive' });
      return;
    }

    try {
      const subjectsToCreate = presetSubjects.filter(s => selectedPresets.includes(s.code));
      for (const subject of subjectsToCreate) {
        await createSubject.mutateAsync({
          institution_id: institutionId,
          ...subject,
        });
      }
      toast({ title: 'Subjects created', description: `Created ${subjectsToCreate.length} subjects` });
      setSelectedPresets([]);
      setIsBulkDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const togglePreset = (code: string) => {
    setSelectedPresets(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code) 
        : [...prev, code]
    );
  };

  const selectAllPresets = () => {
    const existingCodes = subjects?.map(s => s.code) || [];
    const availableCodes = presetSubjects
      .filter(p => !existingCodes.includes(p.code))
      .map(p => p.code);
    setSelectedPresets(availableCodes);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'science': return 'bg-green-100 text-green-800';
      case 'humanities': return 'bg-purple-100 text-purple-800';
      case 'technical': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasErrors = !subjects || subjects.length === 0;

  return (
    <RoleAwareStepCard
      stepId="subject_setup"
      title="Subjects"
      description="Add the subjects taught in your school. These are used for exams, assignments, and grading."
      isCompleted={isStepCompleted('subject_setup')}
      hasErrors={hasErrors}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-lg font-medium">Subjects ({subjects?.length || 0})</h3>
          <div className="flex gap-2">
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add from Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Subjects from Templates</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={selectAllPresets}>
                      Select All Available
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                    {presetSubjects.map((subject) => {
                      const alreadyExists = subjects?.some(s => s.code === subject.code);
                      return (
                        <label
                          key={subject.code}
                          className={`flex items-center justify-between p-3 border rounded-md ${
                            alreadyExists ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedPresets.includes(subject.code)}
                              onCheckedChange={() => !alreadyExists && togglePreset(subject.code)}
                              disabled={alreadyExists}
                            />
                            <div>
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-xs text-muted-foreground">Code: {subject.code}</p>
                            </div>
                          </div>
                          <Badge className={getCategoryColor(subject.category)}>
                            {subject.category}
                          </Badge>
                        </label>
                      );
                    })}
                  </div>
                  <Button 
                    onClick={handleBulkCreate} 
                    disabled={createSubject.isPending || selectedPresets.length === 0} 
                    className="w-full"
                  >
                    Add {selectedPresets.length} Subject{selectedPresets.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Subject</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Name *</Label>
                    <Input
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject Code *</Label>
                      <Input
                        value={subjectForm.code}
                        onChange={(e) => setSubjectForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g., MATH"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={subjectForm.category}
                        onChange={(e) => setSubjectForm(p => ({ ...p, category: e.target.value }))}
                        placeholder="e.g., core, science"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateSubject} disabled={createSubject.isPending} className="w-full">
                    Create Subject
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {subjects && subjects.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(subject.category || 'core')}>
                        {subject.category || 'core'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSubject.mutate(subject.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No subjects configured</p>
              <Button onClick={() => setIsBulkDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subjects from Templates
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleAwareStepCard>
  );
}
