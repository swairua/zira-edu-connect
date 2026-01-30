import { useEffect, useState, useMemo } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { hasAnyRole, ADMIN_DASHBOARD_ROLES, FINANCE_ROLES, ACADEMIC_ROLES } from '@/lib/roles';
import { RoleAwareStepCard } from '@/components/onboarding/RoleAwareStepCard';
import { GoLiveChecklist, ChecklistItem } from '@/components/onboarding/GoLiveChecklist';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, PartyPopper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GoLiveStepProps {
  onGoLive: () => void;
  isGoingLive: boolean;
}

export function GoLiveStep({ onGoLive, isGoingLive }: GoLiveStepProps) {
  const { institutionId, institution } = useInstitution();
  const { isLocked } = useOnboarding();
  const { userRoles } = useAuth();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Determine role-based requirements
  const isAdmin = hasAnyRole(userRoles, ADMIN_DASHBOARD_ROLES);
  const isFinanceRole = hasAnyRole(userRoles, FINANCE_ROLES);
  const isAcademicRole = hasAnyRole(userRoles, ACADEMIC_ROLES);

  useEffect(() => {
    async function loadChecklist() {
      if (!institutionId) return;
      setIsLoading(true);

      // Fetch counts for checklist
      const [
        { count: academicYearsCount },
        { count: classesCount },
        { count: subjectsCount },
        { count: studentsCount },
        { count: staffCount },
        { count: feeItemsCount },
      ] = await Promise.all([
        supabase.from('academic_years').select('*', { count: 'exact', head: true }).eq('institution_id', institutionId),
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('institution_id', institutionId),
        supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('institution_id', institutionId),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('institution_id', institutionId),
        supabase.from('staff').select('*', { count: 'exact', head: true }).eq('institution_id', institutionId),
        supabase.from('fee_items').select('*', { count: 'exact', head: true }).eq('institution_id', institutionId),
      ]);

      // Build items based on role
      const items: ChecklistItem[] = [];

      // Always show profile for admins
      if (isAdmin) {
        items.push({
          id: 'profile',
          label: 'Institution Profile',
          description: institution?.email ? 'Profile configured' : 'Add email address',
          status: institution?.email ? 'complete' : 'incomplete',
          required: true,
        });
      }

      // Academic calendar - required for admins and academic roles
      if (isAdmin || isAcademicRole) {
        items.push({
          id: 'academic_years',
          label: 'Academic Calendar',
          description: (academicYearsCount || 0) > 0 ? 'Calendar configured' : 'Create at least one academic year',
          status: (academicYearsCount || 0) > 0 ? 'complete' : 'incomplete',
          required: true,
          count: academicYearsCount || 0,
        });
      }

      // Classes - required for admins and academic roles
      if (isAdmin || isAcademicRole) {
        items.push({
          id: 'classes',
          label: 'Classes',
          description: (classesCount || 0) > 0 ? 'Classes configured' : 'Create at least one class',
          status: (classesCount || 0) > 0 ? 'complete' : 'incomplete',
          required: true,
          count: classesCount || 0,
        });
      }

      // Subjects - optional for academic roles
      if (isAdmin || isAcademicRole) {
        items.push({
          id: 'subjects',
          label: 'Subjects',
          description: (subjectsCount || 0) > 0 ? 'Subjects configured' : 'Add subjects (optional)',
          status: (subjectsCount || 0) > 0 ? 'complete' : 'warning',
          required: false,
          count: subjectsCount || 0,
        });
      }

      // Fee structure - optional, but highlighted for finance roles
      if (isAdmin || isFinanceRole) {
        items.push({
          id: 'fee_items',
          label: 'Fee Structure',
          description: (feeItemsCount || 0) > 0 ? 'Fee structure configured' : 'Add fee items (optional)',
          status: (feeItemsCount || 0) > 0 ? 'complete' : 'warning',
          required: isFinanceRole && !isAdmin, // Required for finance-only roles
          count: feeItemsCount || 0,
        });
      }

      // Students - optional for admins
      if (isAdmin) {
        items.push({
          id: 'students',
          label: 'Students',
          description: (studentsCount || 0) > 0 ? 'Students enrolled' : 'Add students (can be done later)',
          status: (studentsCount || 0) > 0 ? 'complete' : 'warning',
          required: false,
          count: studentsCount || 0,
        });

        items.push({
          id: 'staff',
          label: 'Staff',
          description: (staffCount || 0) > 0 ? 'Staff added' : 'Add staff members (can be done later)',
          status: (staffCount || 0) > 0 ? 'complete' : 'warning',
          required: false,
          count: staffCount || 0,
        });
      }

      setChecklistItems(items);
      setIsLoading(false);
    }

    loadChecklist();
  }, [institutionId, institution, isAdmin, isFinanceRole, isAcademicRole]);

  const requiredComplete = checklistItems.filter(i => i.required && i.status === 'complete').length;
  const totalRequired = checklistItems.filter(i => i.required).length;
  const canGoLive = requiredComplete === totalRequired && !isLocked;

  if (isLocked) {
    return (
      <RoleAwareStepCard
        stepId="go_live"
        title="Go Live"
        description="Your school is live and operational!"
        isCompleted
      >
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-12 text-center">
            <PartyPopper className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-green-600 mb-4">
              Your school is now live. Students, parents, and staff can start using the system.
            </p>
          </CardContent>
        </Card>
      </RoleAwareStepCard>
    );
  }

  return (
    <RoleAwareStepCard
      stepId="go_live"
      title="Go Live"
      description="Review your setup and activate your school system."
    >
      <div className="space-y-6">
        <GoLiveChecklist items={isLoading ? [] : checklistItems} />

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6 text-center">
            <Rocket className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Go Live?</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Once you go live, the system will be activated for your school. 
              You can still add more data, but some settings will be locked.
            </p>
            <Button
              size="lg"
              onClick={onGoLive}
              disabled={!canGoLive || isGoingLive}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGoingLive ? 'Going Live...' : 'Go Live Now'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleAwareStepCard>
  );
}
