import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { MODULE_CATALOG, type ModuleId } from '@/lib/subscription-catalog';

interface ModuleDiscoveryTipProps {
  enabledModules: string[];
  onBrowse: () => void;
}

export function ModuleDiscoveryTip({ enabledModules, onBrowse }: ModuleDiscoveryTipProps) {
  const allModuleIds = Object.keys(MODULE_CATALOG) as ModuleId[];
  const availableModules = allModuleIds.filter(
    (id) => !enabledModules.includes(id)
  );

  if (availableModules.length === 0) {
    return null;
  }

  // Get top 2-3 suggested modules to highlight
  const suggestedModules = availableModules
    .slice(0, 3)
    .map((id) => MODULE_CATALOG[id].label);

  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 mt-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {availableModules.length} more module{availableModules.length > 1 ? 's' : ''} available
          </p>
          <p className="text-xs text-muted-foreground truncate">
            Extend with {suggestedModules.join(', ')}
            {availableModules.length > 3 ? '...' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBrowse} className="shrink-0">
          Browse
        </Button>
      </div>
    </div>
  );
}
