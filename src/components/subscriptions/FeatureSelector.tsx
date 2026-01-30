import { getFeaturesByCategory } from '@/lib/subscription-catalog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FeatureSelectorProps {
  selected: string[];
  onChange: (features: string[]) => void;
}

export function FeatureSelector({ selected, onChange }: FeatureSelectorProps) {
  const featuresByCategory = getFeaturesByCategory();

  const handleToggle = (featureId: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, featureId]);
    } else {
      onChange(selected.filter(f => f !== featureId));
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Features <span className="text-muted-foreground font-normal">(Capabilities)</span>
      </Label>
      <div className="rounded-lg border p-3 space-y-4">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <div key={category} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
            <div className="grid gap-1">
              {features.map((feature) => {
                const isChecked = selected.includes(feature.id);
                
                return (
                  <label
                    key={feature.id}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => handleToggle(feature.id, !!checked)}
                    />
                    <span className="text-sm">{feature.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
