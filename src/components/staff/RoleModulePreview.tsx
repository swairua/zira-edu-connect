import { MODULE_CATALOG, type ModuleId } from '@/lib/subscription-catalog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Default modules by role (same as in useStaffModuleAccess)
const ROLE_DEFAULT_MODULES: Record<string, string[]> = {
  institution_owner: ['academics', 'finance', 'hr', 'communication', 'reports', 'library', 'transport', 'hostel', 'inventory'],
  institution_admin: ['academics', 'finance', 'hr', 'communication', 'reports'],
  finance_officer: ['finance', 'reports'],
  accountant: ['finance'],
  bursar: ['finance', 'reports'],
  academic_director: ['academics', 'reports'],
  teacher: ['academics'],
  hr_manager: ['hr'],
  ict_admin: ['academics', 'finance', 'hr', 'communication', 'reports'],
  librarian: ['library'],
};

interface RoleModulePreviewProps {
  role: string;
  className?: string;
  compact?: boolean;
}

export function RoleModulePreview({ role, className, compact = false }: RoleModulePreviewProps) {
  const modules = ROLE_DEFAULT_MODULES[role] || [];
  
  if (modules.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No default modules for this role
      </p>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {modules.map((moduleId) => {
          const module = MODULE_CATALOG[moduleId as ModuleId];
          if (!module) return null;
          return (
            <Badge key={moduleId} variant="secondary" className="text-xs">
              {module.label}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-muted-foreground">
        Modules included with this role:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {modules.map((moduleId) => {
          const module = MODULE_CATALOG[moduleId as ModuleId];
          if (!module) return null;
          const Icon = module.icon;
          return (
            <Badge 
              key={moduleId} 
              variant="outline" 
              className="gap-1.5 py-1"
            >
              <Icon className="h-3 w-3" />
              {module.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

export function getRoleModules(role: string): string[] {
  return ROLE_DEFAULT_MODULES[role] || [];
}
