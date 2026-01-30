import { MODULE_CATALOG, ModuleId } from '@/lib/subscription-catalog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ModuleSelectorProps {
  selected: string[];
  onChange: (modules: string[]) => void;
}

export function ModuleSelector({ selected, onChange }: ModuleSelectorProps) {
  const handleToggle = (moduleId: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, moduleId]);
    } else {
      onChange(selected.filter(m => m !== moduleId));
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Modules <span className="text-muted-foreground font-normal">(Controls app access)</span>
      </Label>
      <div className="grid gap-2 rounded-lg border p-3">
        {Object.values(MODULE_CATALOG).map((module) => {
          const Icon = module.icon;
          const isChecked = selected.includes(module.id);
          
          return (
            <label
              key={module.id}
              className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => handleToggle(module.id, !!checked)}
                className="mt-0.5"
              />
              <div className="flex items-start gap-2 flex-1">
                <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">{module.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
