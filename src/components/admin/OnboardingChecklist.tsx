import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { hasAnyRole } from '@/lib/roles';
import {
  ADMIN_DASHBOARD_ROLES,
  FINANCE_ROLES,
  ACADEMIC_ROLES,
} from '@/lib/roles';
import type { SetupProgress } from '@/hooks/useInstitutionDashboard';

interface OnboardingChecklistProps {
  progress: SetupProgress;
}

interface ChecklistItem {
  key: keyof Omit<SetupProgress, 'completionPercentage'>;
  label: string;
  path: string;
  allowedRoles: readonly string[];
}

// Role-based checklist items
const ALL_CHECKLIST_ITEMS: ChecklistItem[] = [
  { 
    key: 'hasAcademicYear', 
    label: 'Create Academic Year', 
    path: '/academic-setup',
    allowedRoles: [...ADMIN_DASHBOARD_ROLES, ...ACADEMIC_ROLES],
  },
  { 
    key: 'hasCurrentTerm', 
    label: 'Set Current Term', 
    path: '/academic-setup',
    allowedRoles: [...ADMIN_DASHBOARD_ROLES, ...ACADEMIC_ROLES],
  },
  { 
    key: 'hasClasses', 
    label: 'Configure Classes', 
    path: '/classes',
    allowedRoles: [...ADMIN_DASHBOARD_ROLES, ...ACADEMIC_ROLES],
  },
  { 
    key: 'hasSubjects', 
    label: 'Add Subjects', 
    path: '/subjects',
    allowedRoles: [...ADMIN_DASHBOARD_ROLES, ...ACADEMIC_ROLES],
  },
  { 
    key: 'hasFeeItems', 
    label: 'Set Up Fee Structure', 
    path: '/fees',
    allowedRoles: [...ADMIN_DASHBOARD_ROLES, ...FINANCE_ROLES],
  },
  { 
    key: 'hasStudents', 
    label: 'Enroll Students', 
    path: '/students/new',
    allowedRoles: [...ADMIN_DASHBOARD_ROLES],
  },
  { 
    key: 'hasStaff', 
    label: 'Add Staff Members', 
    path: '/staff',
    allowedRoles: [...ADMIN_DASHBOARD_ROLES],
  },
];

export function OnboardingChecklist({ progress }: OnboardingChecklistProps) {
  const navigate = useNavigate();
  const { userRoles, rolesLoading } = useAuth();
  
  // Filter checklist items based on user roles
  const checklistItems = useMemo(() => {
    // Don't show any items until roles are loaded - prevents showing fee structure to teachers
    if (!userRoles || userRoles.length === 0) {
      return [];
    }
    
    const userRoleNames = userRoles.map(r => r.role);
    return ALL_CHECKLIST_ITEMS.filter(item => 
      item.allowedRoles.some(role => userRoleNames.includes(role))
    );
  }, [userRoles]);

  // Calculate completion based on visible items only
  const visibleCompletedCount = checklistItems.filter(item => progress[item.key]).length;
  const visibleCompletionPercentage = checklistItems.length > 0 
    ? Math.round((visibleCompletedCount / checklistItems.length) * 100) 
    : 100;

  const [isExpanded, setIsExpanded] = useState(visibleCompletionPercentage < 100);
  
  const isComplete = visibleCompletionPercentage === 100;

  // Show skeleton while roles are loading
  if (rolesLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-2 w-full mt-4" />
        </CardHeader>
      </Card>
    );
  }

  if (isComplete && !isExpanded) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {isComplete ? '🎉 Setup Complete!' : 'Complete Your Setup'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Progress value={visibleCompletionPercentage} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground">
            {visibleCompletionPercentage}%
          </span>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-2">
          <div className="grid gap-2">
            {checklistItems.map((item) => {
              const isChecked = progress[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => !isChecked && navigate(item.path)}
                  disabled={isChecked}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                    isChecked
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                      : 'hover:bg-muted cursor-pointer'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full',
                      isChecked
                        ? 'bg-green-500 text-white'
                        : 'border-2 border-muted-foreground/30'
                    )}
                  >
                    {isChecked ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3 opacity-0" />
                    )}
                  </div>
                  <span className={cn('text-sm', isChecked && 'line-through opacity-70')}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
