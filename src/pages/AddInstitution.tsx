import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Constants } from '@/integrations/supabase/types';
import { ArrowLeft, Building2, MapPin, Phone, Globe, Save, Loader2, GraduationCap, Landmark, Lock } from 'lucide-react';
import { z } from 'zod';
import { CurriculumSelector } from '@/components/country/CurriculumSelector';
import { CurriculumId, getCurriculum, getDefaultCurriculumForCountry } from '@/lib/curriculum-config';
import { CountryCode } from '@/lib/country-config';

const countryNames: Record<string, string> = {
  KE: 'Kenya',
  UG: 'Uganda',
  TZ: 'Tanzania',
  RW: 'Rwanda',
  NG: 'Nigeria',
  GH: 'Ghana',
  ZA: 'South Africa',
};

const typeNames: Record<string, string> = {
  primary: 'Primary School',
  secondary: 'Secondary School',
  tvet: 'TVET Institution',
  college: 'College',
  university: 'University',
};

const planNames: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
  custom: 'Custom',
};

const institutionSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  code: z.string().trim().min(2, 'Code must be at least 2 characters').max(20, 'Code must be less than 20 characters').regex(/^[A-Z0-9-]+$/, 'Code must be uppercase letters, numbers, and hyphens only'),
  type: z.enum(['primary', 'secondary', 'tvet', 'college', 'university'] as const),
  ownership_type: z.enum(['public', 'private'] as const),
  country: z.enum(['KE', 'UG', 'TZ', 'RW', 'NG', 'GH', 'ZA'] as const),
  subscription_plan: z.enum(['starter', 'professional', 'enterprise', 'custom'] as const),
  curriculum: z.string().min(1, 'Curriculum is required'),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().max(20, 'Phone must be less than 20 characters').optional().or(z.literal('')),
  website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().trim().max(200, 'Address must be less than 200 characters').optional().or(z.literal('')),
  county: z.string().trim().max(50, 'County must be less than 50 characters').optional().or(z.literal('')),
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

type FormErrors = Partial<Record<keyof InstitutionFormData, string>>;

export default function AddInstitution() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<InstitutionFormData>({
    name: '',
    code: '',
    type: 'secondary',
    ownership_type: 'private',
    country: 'KE',
    subscription_plan: 'starter',
    curriculum: 'ke_cbc',
    email: '',
    phone: '',
    website: '',
    address: '',
    county: '',
  });

  // Update curriculum when country changes
  useEffect(() => {
    const defaultCurriculum = getDefaultCurriculumForCountry(formData.country as CountryCode);
    setFormData(prev => ({ ...prev, curriculum: defaultCurriculum }));
  }, [formData.country]);

  const handleChange = (field: keyof InstitutionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      institutionSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof InstitutionFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('institutions').insert({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        ownership_type: formData.ownership_type,
        country: formData.country,
        subscription_plan: formData.subscription_plan,
        curriculum: formData.curriculum,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        website: formData.website?.trim() || null,
        address: formData.address?.trim() || null,
        county: formData.county?.trim() || null,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Duplicate Entry',
            description: 'An institution with this code already exists.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Institution Created',
        description: `${formData.name} has been successfully added.`,
      });

      navigate('/institutions');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create institution.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Add Institution"
      subtitle="Register a new educational institution"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/institutions')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Institutions
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Nairobi Primary School"
                  disabled={isLoading}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Institution Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g. NPS-001"
                  disabled={isLoading}
                  className={errors.code ? 'border-destructive' : ''}
                />
                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                <p className="text-xs text-muted-foreground">Uppercase letters, numbers, and hyphens only</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Institution Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.institution_type.map((type) => (
                      <SelectItem key={type} value={type}>
                        {typeNames[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownership_type" className="flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  Ownership Type *
                </Label>
                <Select
                  value={formData.ownership_type}
                  onValueChange={(value) => handleChange('ownership_type', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.ownership_type ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select ownership type" />
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
                {errors.ownership_type && <p className="text-sm text-destructive">{errors.ownership_type}</p>}
                <p className="text-xs text-muted-foreground">
                  {formData.ownership_type === 'public' 
                    ? 'Government-funded school following MoE financial guidelines'
                    : 'Privately owned institution with flexible fee structures'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription_plan">Subscription Plan *</Label>
                <Select
                  value={formData.subscription_plan}
                  onValueChange={(value) => handleChange('subscription_plan', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.subscription_plan ? 'border-destructive' : ''}>
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
                {errors.subscription_plan && <p className="text-sm text-destructive">{errors.subscription_plan}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="curriculum" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Curriculum *
                </Label>
                <CurriculumSelector
                  value={formData.curriculum as CurriculumId}
                  onValueChange={(value) => handleChange('curriculum', value)}
                  countryCode={formData.country as CountryCode}
                  disabled={isLoading}
                />
                {errors.curriculum && <p className="text-sm text-destructive">{errors.curriculum}</p>}
                {formData.curriculum && (
                  <p className="text-xs text-muted-foreground">
                    {getCurriculum(formData.curriculum as CurriculumId)?.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleChange('country', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
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
                {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">County / Region</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) => handleChange('county', e.target.value)}
                  placeholder="e.g. Nairobi County"
                  disabled={isLoading}
                  className={errors.county ? 'border-destructive' : ''}
                />
                {errors.county && <p className="text-sm text-destructive">{errors.county}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter full address"
                  disabled={isLoading}
                  className={errors.address ? 'border-destructive' : ''}
                  rows={3}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="admin@school.edu"
                    disabled={isLoading}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+254 700 000 000"
                    disabled={isLoading}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://www.school.edu"
                      disabled={isLoading}
                      className={`pl-10 ${errors.website ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/institutions')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="gradient" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Institution
              </>
            )}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
