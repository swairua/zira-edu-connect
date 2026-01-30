import { Badge } from '@/components/ui/badge';
import { MODULE_CATALOG, type ModuleId } from '@/lib/subscription-catalog';
import { cn } from '@/lib/utils';
import { LucideIcon, HelpCircle } from 'lucide-react';

interface EnabledModuleBadgeProps {
  moduleId: string;
  tier?: 'core' | 'addon' | 'premium';
}

// Tier-based color classes using semantic tokens
const tierStyles: Record<string, string> = {
  core: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
  addon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15',
  premium: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/15',
};

export function EnabledModuleBadge({ moduleId, tier = 'core' }: EnabledModuleBadgeProps) {
  const catalogEntry = MODULE_CATALOG[moduleId as ModuleId];
  
  // Fallback for modules not in catalog
  const Icon: LucideIcon = catalogEntry?.icon || HelpCircle;
  const label = catalogEntry?.label || moduleId.charAt(0).toUpperCase() + moduleId.slice(1);

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1.5 px-2.5 py-1 font-medium transition-colors cursor-default",
        tierStyles[tier]
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
