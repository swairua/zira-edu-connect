import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Settings2, 
  Clock, 
  Users, 
  BookOpen, 
  Building2, 
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import { useTimetableConstraints, useCreateConstraint, useDeleteConstraint } from '@/hooks/useTimetableConstraints';
import { useStaff } from '@/hooks/useStaff';
import { useSubjects } from '@/hooks/useSubjects';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

const CONSTRAINT_TYPES = [
  { value: 'teacher', label: 'Teacher Preference', icon: Users },
  { value: 'subject', label: 'Subject Requirement', icon: BookOpen },
  { value: 'room', label: 'Room Restriction', icon: Building2 },
  { value: 'general', label: 'General Rule', icon: Settings2 },
];

export default function TimetableGenerator() {
  const navigate = useNavigate();
  const { institution } = useInstitution();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const { data: constraints = [], isLoading } = useTimetableConstraints();
  const { data: staff = [] } = useStaff(institution?.id || null);
  const { data: subjects = [] } = useSubjects(institution?.id || null);
  const createConstraint = useCreateConstraint();
  const deleteConstraint = useDeleteConstraint();

  const [newConstraint, setNewConstraint] = useState({
    constraint_type: 'teacher' as 'teacher' | 'subject' | 'room' | 'general',
    name: '',
    priority: 1,
    config: {} as Record<string, unknown>,
  });

  // Filter to teachers (staff with teaching designation or department)
  const teachers = staff.filter(s => 
    s.department?.toLowerCase().includes('teaching') || 
    s.designation?.toLowerCase().includes('teacher')
  );

  const handleAddConstraint = async () => {
    if (!institution?.id || !newConstraint.name) return;

    await createConstraint.mutateAsync({
      institution_id: institution.id,
      ...newConstraint,
    });

    setShowAddDialog(false);
    setNewConstraint({
      constraint_type: 'teacher',
      name: '',
      priority: 1,
      config: {},
    });
  };

  const startGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          toast.success('Timetable generated successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getConstraintTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      teacher: 'bg-blue-100 text-blue-800',
      subject: 'bg-green-100 text-green-800',
      room: 'bg-purple-100 text-purple-800',
      general: 'bg-orange-100 text-orange-800',
    };
    return <Badge className={colors[type] || 'bg-gray-100'}>{type}</Badge>;
  };

  return (
    <AdminLayout title="Timetable Generator" subtitle="Auto-generate optimal timetables">
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Configure constraints and generate timetables automatically
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Constraint
            </Button>
            <Button
              onClick={startGeneration}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating... {generationProgress}%
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Timetable
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <Card className="border-primary">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Generating Timetable...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Constraints Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CONSTRAINT_TYPES.map(type => {
            const Icon = type.icon;
            const count = constraints.filter(c => c.constraint_type === type.value).length;
            return (
              <Card key={type.value}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{count}</div>
                      <p className="text-sm text-muted-foreground">{type.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Constraints Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Constraints</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="subject">Subject</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : constraints.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Settings2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No constraints configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Add constraints to customize timetable generation
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Constraint
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {constraints.map(constraint => (
                  <Card key={constraint.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getConstraintTypeBadge(constraint.constraint_type)}
                            <span className="font-medium">{constraint.name}</span>
                            {constraint.is_active ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Priority: {constraint.priority}
                          </p>
                          {constraint.config && Object.keys(constraint.config).length > 0 && (
                            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                              {JSON.stringify(constraint.config, null, 2)}
                            </pre>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteConstraint.mutate(constraint.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {['teacher', 'subject', 'general'].map(type => (
            <TabsContent key={type} value={type} className="mt-4">
              <div className="space-y-4">
                {constraints
                  .filter(c => c.constraint_type === type)
                  .map(constraint => (
                    <Card key={constraint.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{constraint.name}</span>
                            <p className="text-sm text-muted-foreground">
                              Priority: {constraint.priority}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteConstraint.mutate(constraint.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {constraints.filter(c => c.constraint_type === type).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No {type} constraints configured
                  </p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Add Constraint Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Constraint</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <div>
                <Label>Constraint Type *</Label>
                <Select
                  value={newConstraint.constraint_type}
                  onValueChange={(v) => setNewConstraint({
                    ...newConstraint,
                    constraint_type: v as typeof newConstraint.constraint_type,
                    config: {},
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSTRAINT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Name *</Label>
                <Input
                  value={newConstraint.name}
                  onChange={(e) => setNewConstraint({ ...newConstraint, name: e.target.value })}
                  placeholder="e.g., Max 6 periods per day for teachers"
                />
              </div>

              <div>
                <Label>Priority (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={newConstraint.priority}
                  onChange={(e) => setNewConstraint({
                    ...newConstraint,
                    priority: parseInt(e.target.value) || 1,
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher priority constraints are satisfied first
                </p>
              </div>

              {/* Teacher-specific config */}
              {newConstraint.constraint_type === 'teacher' && (
                <>
                  <div>
                    <Label>Teacher (optional)</Label>
                    <Select
                      value={newConstraint.config.teacher_id as string || ''}
                      onValueChange={(v) => setNewConstraint({
                        ...newConstraint,
                        config: { ...newConstraint.config, teacher_id: v },
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All teachers" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.first_name} {t.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Max Periods Per Day</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={newConstraint.config.max_periods_per_day as number || 6}
                      onChange={(e) => setNewConstraint({
                        ...newConstraint,
                        config: {
                          ...newConstraint.config,
                          max_periods_per_day: parseInt(e.target.value),
                        },
                      })}
                    />
                  </div>
                </>
              )}

              {/* Subject-specific config */}
              {newConstraint.constraint_type === 'subject' && (
                <>
                  <div>
                    <Label>Subject (optional)</Label>
                    <Select
                      value={newConstraint.config.subject_id as string || ''}
                      onValueChange={(v) => setNewConstraint({
                        ...newConstraint,
                        config: { ...newConstraint.config, subject_id: v },
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newConstraint.config.requires_double_period as boolean || false}
                      onCheckedChange={(checked) => setNewConstraint({
                        ...newConstraint,
                        config: { ...newConstraint.config, requires_double_period: checked },
                      })}
                    />
                    <Label>Requires Double Period</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newConstraint.config.prefer_morning as boolean || false}
                      onCheckedChange={(checked) => setNewConstraint({
                        ...newConstraint,
                        config: { ...newConstraint.config, prefer_morning: checked },
                      })}
                    />
                    <Label>Prefer Morning Sessions</Label>
                  </div>
                </>
              )}

              {/* General config */}
              {newConstraint.constraint_type === 'general' && (
                <>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newConstraint.config.no_consecutive_same_subject as boolean || false}
                      onCheckedChange={(checked) => setNewConstraint({
                        ...newConstraint,
                        config: { ...newConstraint.config, no_consecutive_same_subject: checked },
                      })}
                    />
                    <Label>No Consecutive Same Subject</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newConstraint.config.spread_subjects_evenly as boolean || false}
                      onCheckedChange={(checked) => setNewConstraint({
                        ...newConstraint,
                        config: { ...newConstraint.config, spread_subjects_evenly: checked },
                      })}
                    />
                    <Label>Spread Subjects Evenly Across Week</Label>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddConstraint}
                disabled={!newConstraint.name || createConstraint.isPending}
              >
                {createConstraint.isPending ? 'Adding...' : 'Add Constraint'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
