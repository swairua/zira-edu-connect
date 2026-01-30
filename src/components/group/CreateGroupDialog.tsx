import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInstitutionGroup } from '@/hooks/useInstitutionGroup';
import { Loader2, Building2 } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types';

const countryNames: Record<string, string> = {
  KE: 'Kenya',
  UG: 'Uganda',
  TZ: 'Tanzania',
  RW: 'Rwanda',
  NG: 'Nigeria',
  GH: 'Ghana',
  ZA: 'South Africa',
};

const planNames: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
  custom: 'Custom',
};

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialInstitutionId?: string;
  initialInstitutionName?: string;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  initialInstitutionId,
  initialInstitutionName,
}: CreateGroupDialogProps) {
  const navigate = useNavigate();
  const { createGroup } = useInstitutionGroup();
  
  const [formData, setFormData] = useState({
    name: initialInstitutionName ? `${initialInstitutionName} Group` : '',
    code: '',
    primary_country: 'KE' as 'KE' | 'UG' | 'TZ' | 'RW' | 'NG' | 'GH' | 'ZA',
    subscription_plan: 'professional' as 'starter' | 'professional' | 'enterprise' | 'custom',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createGroup.mutateAsync({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        primary_country: formData.primary_country,
        subscription_plan: formData.subscription_plan,
      });
      
      onOpenChange(false);
      
      // If we have an initial institution, redirect to campuses page to add it
      if (result?.id) {
        navigate(`/group/campuses?newGroup=${result.id}${initialInstitutionId ? `&addInstitution=${initialInstitutionId}` : ''}`);
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Create School Group
          </DialogTitle>
          <DialogDescription>
            Create a new group to manage multiple campuses under one organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name *</Label>
            <Input
              id="group-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. ABC Schools Group"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-code">Group Code *</Label>
            <Input
              id="group-code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="e.g. ABC-GRP"
              required
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for the group (uppercase)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary-country">Primary Country *</Label>
            <Select
              value={formData.primary_country}
              onValueChange={(value) => handleChange('primary_country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.country_code.map((code) => (
                  <SelectItem key={code} value={code}>
                    {countryNames[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription-plan">Subscription Plan *</Label>
            <Select
              value={formData.subscription_plan}
              onValueChange={(value) => handleChange('subscription_plan', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.subscription_plan.map((plan) => (
                  <SelectItem key={plan} value={plan}>
                    {planNames[plan]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createGroup.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createGroup.isPending}>
              {createGroup.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
