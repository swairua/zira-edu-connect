import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  DollarSign, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Bus, 
  Building2, 
  Trophy, 
  Shirt, 
  Clock, 
  FileText,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, React.ElementType> = {
  academics: GraduationCap,
  finance: DollarSign,
  communication: MessageSquare,
  hr: Users,
  library: BookOpen,
  transport: Bus,
  hostel: Building2,
  activities: Trophy,
  uniforms: Shirt,
  timetable: Clock,
  reports: FileText,
};

interface ModuleCardProps {
  moduleId: string;
  displayName: string;
  description: string | null;
  tier: "core" | "addon" | "premium";
  price: number;
  currency: string;
  requiresModules: string[];
  isEnabled: boolean;
  activationType?: string | null;
  expiresAt?: string | null;
  onToggle: (enabled: boolean) => void;
  isLoading?: boolean;
  disabled?: boolean;
  missingDependencies?: string[];
}

export function ModuleCard({
  moduleId,
  displayName,
  description,
  tier,
  price,
  currency,
  requiresModules,
  isEnabled,
  activationType,
  expiresAt,
  onToggle,
  isLoading,
  disabled,
  missingDependencies = [],
}: ModuleCardProps) {
  const Icon = MODULE_ICONS[moduleId] || FileText;
  const hasMissingDeps = missingDependencies.length > 0;

  const getTierColor = () => {
    switch (tier) {
      case "core":
        return "bg-primary/10 text-primary border-primary/20";
      case "addon":
        return "bg-secondary text-secondary-foreground";
      case "premium":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatPrice = () => {
    if (tier === "core") return "Included";
    return `${currency} ${price.toLocaleString()}/mo`;
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      isEnabled && "ring-2 ring-primary/20 bg-primary/5",
      hasMissingDeps && !isEnabled && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{displayName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", getTierColor())}>
                  {tier === "core" ? "Core" : tier === "premium" ? "Premium" : "Add-on"}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatPrice()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Switch
                checked={isEnabled}
                onCheckedChange={onToggle}
                disabled={disabled || isLoading || (hasMissingDeps && !isEnabled)}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {description && (
          <CardDescription className="text-sm mb-3">{description}</CardDescription>
        )}
        
        {requiresModules.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2">
            <span className="font-medium">Requires:</span>{" "}
            {requiresModules.join(", ")}
          </div>
        )}

        {hasMissingDeps && !isEnabled && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
            <AlertTriangle className="h-3 w-3" />
            <span>Enable {missingDependencies.join(", ")} first</span>
          </div>
        )}

        {activationType && isEnabled && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {activationType === "plan_included" ? "Plan Included" : 
               activationType === "trial" ? "Trial" : 
               activationType === "addon" ? "Add-on" : "Manual"}
            </Badge>
          </div>
        )}

        {expiresAt && isEnabled && (
          <div className="text-xs text-amber-600 mt-2">
            Expires: {new Date(expiresAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
