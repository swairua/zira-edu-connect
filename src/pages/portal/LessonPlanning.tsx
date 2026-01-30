import { useState } from 'react';
import { Plus, Filter, BookOpen, Calendar } from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LessonPlanCard } from '@/components/lesson-plans/LessonPlanCard';
import { SchemeOfWorkCard } from '@/components/lesson-plans/SchemeOfWorkCard';
import { CreateLessonPlanDialog } from '@/components/lesson-plans/CreateLessonPlanDialog';
import { CreateSchemeDialog } from '@/components/lesson-plans/CreateSchemeDialog';
import { useLessonPlans, useCloneLessonPlan, useSubmitLessonPlan } from '@/hooks/useLessonPlans';
import { useSchemesOfWork } from '@/hooks/useSchemesOfWork';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { LessonPlanStatus } from '@/types/lesson-plans';

export default function LessonPlanning() {
  const [activeTab, setActiveTab] = useState('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LessonPlanStatus | 'all'>('all');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateScheme, setShowCreateScheme] = useState(false);

  const { data: profile } = useStaffProfile();
  
  const { data: lessonPlansRaw = [], isLoading: plansLoading } = useLessonPlans({
    teacherId: profile?.id,
  });
  
  const { data: schemes = [], isLoading: schemesLoading } = useSchemesOfWork({
    teacherId: profile?.id,
  });

  const cloneMutation = useCloneLessonPlan();
  const submitMutation = useSubmitLessonPlan();

  // Cast raw data - the raw rows have compatible structure, just typed as unknown
  const lessonPlans = lessonPlansRaw.map(plan => ({
    ...plan,
    lesson_objectives: Array.isArray(plan.lesson_objectives) ? plan.lesson_objectives as string[] : [],
    lesson_development: Array.isArray(plan.lesson_development) ? plan.lesson_development : [],
    teaching_aids: Array.isArray(plan.teaching_aids) ? plan.teaching_aids : [],
    learning_resources: Array.isArray(plan.learning_resources) ? plan.learning_resources : [],
    teaching_methods: Array.isArray(plan.teaching_methods) ? plan.teaching_methods as string[] : [],
    core_competencies: Array.isArray(plan.core_competencies) ? plan.core_competencies as string[] : [],
    values: Array.isArray(plan.values) ? plan.values as string[] : [],
    pertinent_contemporary_issues: Array.isArray(plan.pertinent_contemporary_issues) ? plan.pertinent_contemporary_issues as string[] : null,
    assessment_methods: Array.isArray(plan.assessment_methods) ? plan.assessment_methods : [],
  }));

  const handleClone = (planId: string) => {
    cloneMutation.mutate({ sourceId: planId, newDate: new Date().toISOString().split('T')[0] }, {
      onSuccess: () => toast.success('Lesson plan cloned successfully'),
      onError: () => toast.error('Failed to clone lesson plan'),
    });
  };

  const handleSubmit = (planId: string) => {
    submitMutation.mutate(planId, {
      onSuccess: () => toast.success('Lesson plan submitted for approval'),
      onError: () => toast.error('Failed to submit lesson plan'),
    });
  };

  const filteredPlans = lessonPlans.filter(plan => {
    const matchesSearch = plan.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    draft: lessonPlans.filter(p => p.status === 'draft').length,
    submitted: lessonPlans.filter(p => p.status === 'submitted').length,
    approved: lessonPlans.filter(p => p.status === 'approved').length,
  };

  return (
    <PortalLayout 
      title="Lesson Planning" 
      subtitle="Plan lessons aligned to CBC strands and sub-strands"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lessonPlans.length}</p>
                  <p className="text-sm text-muted-foreground">Total Plans</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.draft}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.submitted}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="plans">Lesson Plans</TabsTrigger>
              <TabsTrigger value="schemes">Schemes of Work</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              {activeTab === 'plans' ? (
                <Button onClick={() => setShowCreatePlan(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Plan
                </Button>
              ) : (
                <Button onClick={() => setShowCreateScheme(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Scheme
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="plans" className="space-y-4">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'draft', 'submitted', 'approved', 'rejected'] as const).map((status) => (
                <Badge
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              ))}
            </div>

            {plansLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPlans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Lesson Plans Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first lesson plan to get started with CBC-aligned teaching.
                  </p>
                  <Button onClick={() => setShowCreatePlan(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Lesson Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlans.map((plan) => (
                  <LessonPlanCard
                    key={plan.id}
                    plan={plan}
                    onClone={() => handleClone(plan.id)}
                    onSubmit={() => handleSubmit(plan.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schemes" className="space-y-4">
            {schemesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : schemes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Schemes of Work</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a scheme of work to plan your term's teaching activities.
                  </p>
                  <Button onClick={() => setShowCreateScheme(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Scheme
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {schemes.map((scheme) => (
                  <SchemeOfWorkCard
                    key={scheme.id}
                    scheme={scheme}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateLessonPlanDialog
        open={showCreatePlan}
        onOpenChange={setShowCreatePlan}
      />
      <CreateSchemeDialog
        open={showCreateScheme}
        onOpenChange={setShowCreateScheme}
      />
    </PortalLayout>
  );
}
