import { useState, useEffect } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { RoleAwareStepCard } from '@/components/onboarding/RoleAwareStepCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurriculumSelector } from '@/components/country/CurriculumSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Phone, Globe, MapPin, GraduationCap, Landmark, Lock } from 'lucide-react';
import { CurriculumId, getCurriculum } from '@/lib/curriculum-config';
import { CountryCode } from '@/lib/country-config';

type OwnershipType = 'public' | 'private';

export function InstitutionProfileStep() {
  const { institution, institutionId, refetch } = useInstitution();
  const { progress, isStepCompleted } = useOnboarding();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    county: '',
    type: 'primary',
    ownership_type: 'private' as OwnershipType,
    curriculum: 'ke_cbc' as CurriculumId,
  });

  const countryCode = (institution?.country || 'KE') as CountryCode;

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name || '',
        email: institution.email || '',
        phone: institution.phone || '',
        website: institution.website || '',
        address: institution.address || '',
        county: institution.county || '',
        type: institution.type || 'primary',
        ownership_type: (institution.ownership_type as OwnershipType) || 'private',
        curriculum: ((institution as any).curriculum || 'ke_cbc') as CurriculumId,
      });
    }
  }, [institution]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-save on blur
  const handleBlur = async () => {
    if (!institutionId) return;
    
    try {
      const { error } = await supabase
        .from('institutions')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          address: formData.address,
          county: formData.county,
          type: formData.type as any,
          ownership_type: formData.ownership_type,
          curriculum: formData.curriculum,
        })
        .eq('id', institutionId);

      if (error) throw error;
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error saving',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const hasErrors = !formData.name || !formData.email;

  const selectedCurriculum = getCurriculum(formData.curriculum);

  return (
    <RoleAwareStepCard
      stepId="institution_profile"
      title="Institution Profile"
      description="Set up your school's basic information. This will appear on reports and communications."
      isCompleted={isStepCompleted('institution_profile')}
      hasErrors={hasErrors}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            School Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., Sunshine Primary School"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., info@school.edu"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., +254 700 000 000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website
          </Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., www.school.edu"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Physical Address
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., 123 Education Street, Nairobi"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="county">County/Region</Label>
          <Input
            id="county"
            value={formData.county}
            onChange={(e) => handleChange('county', e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., Nairobi"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Institution Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => {
              handleChange('type', value);
              handleBlur();
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary School</SelectItem>
              <SelectItem value="secondary">Secondary School</SelectItem>
              <SelectItem value="tvet">TVET Institution</SelectItem>
              <SelectItem value="college">College</SelectItem>
              <SelectItem value="university">University</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownership_type" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Ownership Type
          </Label>
          <Select
            value={formData.ownership_type}
            onValueChange={(value) => {
              handleChange('ownership_type', value);
              handleBlur();
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-info" />
                  <span>Public School</span>
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-secondary" />
                  <span>Private School</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {formData.ownership_type === 'public' 
              ? 'Government-funded with MoE guidelines'
              : 'Privately owned with flexible fees'}
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="curriculum" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Curriculum
          </Label>
          <CurriculumSelector
            value={formData.curriculum}
            onValueChange={(value) => {
              handleChange('curriculum', value);
              handleBlur();
            }}
            countryCode={countryCode}
          />
          {selectedCurriculum && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedCurriculum.description}
            </p>
          )}
        </div>
      </div>
    </RoleAwareStepCard>
  );
}
