import { useState } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useClasses, useCreateClass, useDeleteClass } from '@/hooks/useClasses';
import { RoleAwareStepCard } from '@/components/onboarding/RoleAwareStepCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Plus, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRESET_LEVELS = {
  primary: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  secondary: ['Form 1', 'Form 2', 'Form 3', 'Form 4'],
  mixed: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'],
};

const PRESET_STREAMS = ['A', 'B', 'C', 'D', 'East', 'West', 'North', 'South', 'Blue', 'Red', 'Green'];

export function ClassSetupStep() {
  const { institution, institutionId } = useInstitution();
  const { isStepCompleted } = useOnboarding();
  const { data: classes, isLoading } = useClasses(institutionId);
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  
  const [classForm, setClassForm] = useState({
    name: '',
    level: '',
    stream: '',
    capacity: '40',
  });

  const [bulkConfig, setBulkConfig] = useState({
    selectedLevels: [] as string[],
    selectedStreams: [] as string[],
    capacity: '40',
  });

  const handleCreateClass = async () => {
    if (!classForm.name || !classForm.level || !institutionId) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    try {
      await createClass.mutateAsync({
        institution_id: institutionId,
        name: classForm.name,
        level: classForm.level,
        stream: classForm.stream || undefined,
        capacity: parseInt(classForm.capacity) || 40,
      });
      setClassForm({ name: '', level: '', stream: '', capacity: '40' });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleBulkCreate = async () => {
    if (bulkConfig.selectedLevels.length === 0 || !institutionId) {
      toast({ title: 'Please select at least one level', variant: 'destructive' });
      return;
    }

    try {
      const classesToCreate = [];
      for (const level of bulkConfig.selectedLevels) {
        if (bulkConfig.selectedStreams.length > 0) {
          for (const stream of bulkConfig.selectedStreams) {
            classesToCreate.push({
              institution_id: institutionId,
              name: `${level} ${stream}`,
              level,
              stream,
              capacity: parseInt(bulkConfig.capacity) || 40,
            });
          }
        } else {
          classesToCreate.push({
            institution_id: institutionId,
            name: level,
            level,
            capacity: parseInt(bulkConfig.capacity) || 40,
          });
        }
      }

      for (const cls of classesToCreate) {
        await createClass.mutateAsync(cls);
      }

      toast({ title: 'Classes created', description: `Created ${classesToCreate.length} classes` });
      setBulkConfig({ selectedLevels: [], selectedStreams: [], capacity: '40' });
      setIsBulkDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const toggleLevel = (level: string) => {
    setBulkConfig(prev => ({
      ...prev,
      selectedLevels: prev.selectedLevels.includes(level)
        ? prev.selectedLevels.filter(l => l !== level)
        : [...prev.selectedLevels, level],
    }));
  };

  const toggleStream = (stream: string) => {
    setBulkConfig(prev => ({
      ...prev,
      selectedStreams: prev.selectedStreams.includes(stream)
        ? prev.selectedStreams.filter(s => s !== stream)
        : [...prev.selectedStreams, stream],
    }));
  };

  const institutionType = institution?.type || 'primary';
  const presetLevels = PRESET_LEVELS[institutionType as keyof typeof PRESET_LEVELS] || PRESET_LEVELS.primary;
  const hasErrors = !classes || classes.length === 0;

  return (
    <RoleAwareStepCard
      stepId="class_setup"
      title="Classes & Streams"
      description="Set up your class structure. Classes organize students and are used for attendance, exams, and fees."
      isCompleted={isStepCompleted('class_setup')}
      hasErrors={hasErrors}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-lg font-medium">Classes ({classes?.length || 0})</h3>
          <div className="flex gap-2">
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Bulk Create
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Bulk Create Classes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Select Levels</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {presetLevels.map((level) => (
                        <label
                          key={level}
                          className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted"
                        >
                          <Checkbox
                            checked={bulkConfig.selectedLevels.includes(level)}
                            onCheckedChange={() => toggleLevel(level)}
                          />
                          <span className="text-sm">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Select Streams (optional)</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {PRESET_STREAMS.map((stream) => (
                        <label
                          key={stream}
                          className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted"
                        >
                          <Checkbox
                            checked={bulkConfig.selectedStreams.includes(stream)}
                            onCheckedChange={() => toggleStream(stream)}
                          />
                          <span className="text-sm">{stream}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Capacity</Label>
                    <Input
                      type="number"
                      value={bulkConfig.capacity}
                      onChange={(e) => setBulkConfig(p => ({ ...p, capacity: e.target.value }))}
                    />
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      This will create{' '}
                      <strong>
                        {bulkConfig.selectedLevels.length * (bulkConfig.selectedStreams.length || 1)}
                      </strong>{' '}
                      classes
                    </p>
                  </div>
                  <Button onClick={handleBulkCreate} disabled={createClass.isPending} className="w-full">
                    Create Classes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Class</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Class Name *</Label>
                    <Input
                      value={classForm.name}
                      onChange={(e) => setClassForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g., Grade 1 A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Level *</Label>
                    <Select
                      value={classForm.level}
                      onValueChange={(v) => setClassForm(p => ({ ...p, level: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {presetLevels.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stream (optional)</Label>
                      <Input
                        value={classForm.stream}
                        onChange={(e) => setClassForm(p => ({ ...p, stream: e.target.value }))}
                        placeholder="e.g., A, East"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        value={classForm.capacity}
                        onChange={(e) => setClassForm(p => ({ ...p, capacity: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateClass} disabled={createClass.isPending} className="w-full">
                    Create Class
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {classes && classes.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Stream</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.level}</TableCell>
                    <TableCell>{cls.stream || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {cls.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteClass.mutate(cls.id)}
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
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No classes configured</p>
              <Button onClick={() => setIsBulkDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Quick Setup with Bulk Create
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleAwareStepCard>
  );
}
