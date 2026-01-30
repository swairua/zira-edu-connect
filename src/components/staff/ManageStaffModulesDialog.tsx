import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useStaffModuleAccess } from '@/hooks/useStaffModuleAccess';
import { useModuleWithConfig } from '@/hooks/useModuleConfig';
import { useInstitution } from '@/contexts/InstitutionContext';
import { MODULE_CATALOG, ModuleId } from '@/lib/subscription-catalog';
import { format, addMonths, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  DollarSign, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Library,
  Bus,
  Hotel,
  Package,
  Trophy,
  Loader2,
  Shield,
  Info,
  CalendarIcon,
  Clock,
} from 'lucide-react';
import { roleLabels, type AppRole } from '@/types/database';

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  user_id?: string | null;
  department?: string | null;
  designation?: string | null;
}

interface ManageStaffModulesDialogProps {
  staff: Staff | null;
  staffRole?: AppRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODULE_ICONS: Record<string, React.ElementType> = {
  academics: BookOpen,
  finance: DollarSign,
  hr: Users,
  communication: MessageSquare,
  reports: BarChart3,
  settings: Settings,
  library: Library,
  transport: Bus,
  hostel: Hotel,
  inventory: Package,
  activities: Trophy,
};

type ExpirationOption = 'never' | 'end_of_term' | 'end_of_month' | 'custom';

export function ManageStaffModulesDialog({
  staff,
  staffRole,
  open,
  onOpenChange,
}: ManageStaffModulesDialogProps) {
  const { institution } = useInstitution();
  const institutionId = institution?.id;
  
  const { 
    modules: institutionModules, 
    isLoading: modulesLoading 
  } = useModuleWithConfig(institutionId);
  
  const {
    accessibleModules,
    roleDefaultModules,
    hasExplicitAccess,
    explicitAccess,
    grantAccess,
    revokeAccess,
    isLoading: accessLoading,
  } = useStaffModuleAccess(staff?.user_id || undefined, institutionId);

  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [expirations, setExpirations] = useState<Record<string, string | null>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset pending changes when dialog opens
  useEffect(() => {
    if (open) {
      setPendingChanges({});
      // Initialize expirations from existing explicit access
      const initialExpirations: Record<string, string | null> = {};
      explicitAccess.forEach(access => {
        initialExpirations[access.module_id] = access.expires_at;
      });
      setExpirations(initialExpirations);
    }
  }, [open, staff?.id, explicitAccess]);

  if (!staff) return null;

  const isLoading = modulesLoading || accessLoading;

  // Get enabled modules for this institution
  const enabledModules = institutionModules?.filter(m => m.is_enabled) || [];

  // Check if a module is currently accessible (considering pending changes)
  const isModuleAccessible = (moduleId: string): boolean => {
    if (pendingChanges[moduleId] !== undefined) {
      return pendingChanges[moduleId];
    }
    return accessibleModules.includes(moduleId);
  };

  // Check if module access comes from role (can't be removed via UI)
  const isFromRole = (moduleId: string): boolean => {
    return roleDefaultModules.includes(moduleId);
  };

  // Get expiration date for a module
  const getExpiration = (moduleId: string): string | null => {
    return expirations[moduleId] || null;
  };

  // Set expiration for a module
  const handleExpirationChange = (moduleId: string, option: ExpirationOption, customDate?: Date) => {
    let expiresAt: string | null = null;
    
    switch (option) {
      case 'never':
        expiresAt = null;
        break;
      case 'end_of_month':
        expiresAt = endOfMonth(new Date()).toISOString();
        break;
      case 'end_of_term':
        // Approximate: 3 months from now
        expiresAt = addMonths(new Date(), 3).toISOString();
        break;
      case 'custom':
        if (customDate) {
          expiresAt = customDate.toISOString();
        }
        break;
    }

    setExpirations(prev => ({
      ...prev,
      [moduleId]: expiresAt,
    }));
    
    // Mark as changed if it's an explicit grant
    if (!isFromRole(moduleId) && (hasExplicitAccess(moduleId) || pendingChanges[moduleId])) {
      setPendingChanges(prev => ({
        ...prev,
        [moduleId]: true,
      }));
    }
  };

  // Toggle module access
  const handleToggle = (moduleId: string, checked: boolean) => {
    setPendingChanges(prev => ({
      ...prev,
      [moduleId]: checked,
    }));
    
    // Reset expiration if unchecking
    if (!checked) {
      setExpirations(prev => ({
        ...prev,
        [moduleId]: null,
      }));
    }
  };

  // Save all changes
  const handleSave = async () => {
    if (!staff.user_id || !institutionId) return;

    setIsSaving(true);
    try {
      for (const [moduleId, shouldHaveAccess] of Object.entries(pendingChanges)) {
        const currentlyHasExplicit = hasExplicitAccess(moduleId);
        const expiration = expirations[moduleId];
        
        if (shouldHaveAccess && !isFromRole(moduleId)) {
          // Grant or update access with expiration
          await grantAccess.mutateAsync({
            userId: staff.user_id,
            institutionId,
            moduleId,
            expiresAt: expiration || undefined,
          });
        } else if (!shouldHaveAccess && currentlyHasExplicit) {
          // Revoke explicit access
          await revokeAccess.mutateAsync({
            userId: staff.user_id,
            institutionId,
            moduleId,
          });
        }
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving module access:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Module Access</DialogTitle>
          <DialogDescription>
            {staff.first_name} {staff.last_name}
            {staffRole && (
              <Badge variant="secondary" className="ml-2">
                {roleLabels[staffRole] || staffRole}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !staff.user_id ? (
          <div className="rounded-lg border border-warning bg-warning/10 p-4 text-center">
            <Info className="mx-auto h-8 w-8 text-warning" />
            <p className="mt-2 text-sm text-muted-foreground">
              This staff member doesn't have a login account yet. 
              Create a login first to manage module access.
            </p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {enabledModules.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No modules enabled for this institution.
              </p>
            ) : (
              enabledModules.map(module => {
                const moduleId = module.module_id as ModuleId;
                const catalogInfo = MODULE_CATALOG[moduleId];
                const Icon = MODULE_ICONS[moduleId] || Package;
                const accessible = isModuleAccessible(moduleId);
                const fromRole = isFromRole(moduleId);
                const explicit = hasExplicitAccess(moduleId);
                const expiration = getExpiration(moduleId);
                const isExpiringSoon = expiration && new Date(expiration) < addMonths(new Date(), 1);

                return (
                  <div
                    key={moduleId}
                    className={`rounded-lg border p-3 transition-colors ${
                      accessible ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`module-${moduleId}`}
                        checked={accessible}
                        disabled={fromRole}
                        onCheckedChange={(checked) => handleToggle(moduleId, checked as boolean)}
                      />
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`module-${moduleId}`}
                            className="font-medium text-sm cursor-pointer"
                          >
                            {catalogInfo?.label || moduleId}
                          </label>
                          {fromRole && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="mr-1 h-3 w-3" />
                              Role
                            </Badge>
                          )}
                          {explicit && !fromRole && (
                            <Badge variant="secondary" className="text-xs">
                              Granted
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {catalogInfo?.description || 'Module access'}
                        </p>
                      </div>
                    </div>

                    {/* Expiration UI - only show for explicit grants */}
                    {accessible && !fromRole && (
                      <div className="mt-3 ml-12 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <Label className="text-xs text-muted-foreground">Expires:</Label>
                        <Select
                          value={expiration ? 'custom' : 'never'}
                          onValueChange={(value) => handleExpirationChange(moduleId, value as ExpirationOption)}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-xs">
                            <SelectValue placeholder="Never" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="end_of_month">End of Month</SelectItem>
                            <SelectItem value="end_of_term">End of Term</SelectItem>
                            <SelectItem value="custom">Custom Date</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {expiration && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "h-7 text-xs gap-1",
                                  isExpiringSoon && "border-warning text-warning"
                                )}
                              >
                                <CalendarIcon className="h-3 w-3" />
                                {format(new Date(expiration), 'MMM d, yyyy')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={new Date(expiration)}
                                onSelect={(date) => date && handleExpirationChange(moduleId, 'custom', date)}
                                initialFocus
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving || !staff.user_id}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
