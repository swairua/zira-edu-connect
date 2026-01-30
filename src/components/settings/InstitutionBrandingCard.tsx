import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2, Building2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export function InstitutionBrandingCard() {
  const { institution, refetch } = useInstitution();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [motto, setMotto] = useState((institution as any)?.motto || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoUrl = (institution as any)?.logo_url;
  const institutionInitials = institution?.name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SC';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !institution?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (500KB max)
    if (file.size > 500 * 1024) {
      toast.error('Image must be less than 500KB');
      return;
    }

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${institution.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('institution-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('institution-logos')
        .getPublicUrl(fileName);

      // Update institution record
      const { error: updateError } = await supabase
        .from('institutions')
        .update({ logo_url: publicUrl })
        .eq('id', institution.id);

      if (updateError) throw updateError;

      toast.success('Logo uploaded successfully');
      refetch?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo', { description: error.message });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!institution?.id) return;

    setIsUploading(true);
    try {
      // Update institution record to remove logo
      const { error: updateError } = await supabase
        .from('institutions')
        .update({ logo_url: null })
        .eq('id', institution.id);

      if (updateError) throw updateError;

      setPreviewUrl(null);
      toast.success('Logo removed');
      refetch?.();
    } catch (error: any) {
      toast.error('Failed to remove logo', { description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveMotto = async () => {
    if (!institution?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('institutions')
        .update({ motto: motto || null })
        .eq('id', institution.id);

      if (error) throw error;

      toast.success('Motto saved successfully');
      refetch?.();
    } catch (error: any) {
      toast.error('Failed to save motto', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          School Branding
        </CardTitle>
        <CardDescription>
          Customize your school logo and motto for report cards and documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Section */}
        <div className="space-y-3">
          <Label>School Logo</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-muted">
              <AvatarImage src={previewUrl || logoUrl} alt="School logo" />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {institutionInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </Button>
              {(logoUrl || previewUrl) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  disabled={isUploading}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                JPG or PNG, max 500KB. Recommended: 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Motto Section */}
        <div className="space-y-3">
          <Label htmlFor="motto">School Motto</Label>
          <div className="flex gap-2">
            <Input
              id="motto"
              placeholder="e.g., Excellence Through Knowledge"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              maxLength={100}
              className="flex-1"
            />
            <Button
              onClick={handleSaveMotto}
              disabled={isSaving || motto === ((institution as any)?.motto || '')}
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {motto.length}/100 characters. Displayed on report cards and official documents.
          </p>
        </div>

        {/* Preview */}
        {(logoUrl || previewUrl || motto) && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-2">Preview on Report Card:</p>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={previewUrl || logoUrl} alt="Preview" />
                <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                  {institutionInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{institution?.name}</p>
                {motto && <p className="text-xs text-muted-foreground italic">"{motto}"</p>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
