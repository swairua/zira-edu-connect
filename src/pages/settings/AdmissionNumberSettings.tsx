import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsBackHeader } from '@/components/settings/SettingsBackHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  useAdmissionNumberConfig, 
  useAdmissionNumberPreview, 
  useUpdateAdmissionNumberConfig,
  type AdmissionNumberConfig 
} from '@/hooks/useAdmissionNumber';
import { Hash, Loader2, Save, Sparkles } from 'lucide-react';

const configSchema = z.object({
  auto_generate: z.boolean(),
  prefix: z.string().min(1, 'Prefix is required'),
  format: z.enum(['prefix_year_seq', 'year_prefix_seq', 'prefix_seq']),
  separator: z.enum(['/', '-', 'none']),
  sequence_padding: z.coerce.number().min(2).max(6),
  include_year: z.boolean(),
  year_format: z.enum(['full', 'short']),
  next_sequence: z.coerce.number().min(1),
});

type ConfigFormData = z.infer<typeof configSchema>;

const formatExamples: Record<string, string> = {
  'prefix_year_seq': '{Prefix}/{Year}/{Sequence}',
  'year_prefix_seq': '{Year}/{Prefix}/{Sequence}',
  'prefix_seq': '{Prefix}/{Sequence}',
};

export default function AdmissionNumberSettings() {
  const { data: config, isLoading: configLoading } = useAdmissionNumberConfig();
  const { data: preview, isLoading: previewLoading } = useAdmissionNumberPreview();
  const updateConfig = useUpdateAdmissionNumberConfig();

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      auto_generate: true,
      prefix: '',
      format: 'prefix_year_seq',
      separator: '/',
      sequence_padding: 3,
      include_year: true,
      year_format: 'full',
      next_sequence: 1,
    },
  });

  // Sync form with fetched config
  useEffect(() => {
    if (config) {
      form.reset({
        auto_generate: config.auto_generate,
        prefix: config.prefix,
        format: config.format,
        separator: config.separator,
        sequence_padding: config.sequence_padding,
        include_year: config.include_year,
        year_format: config.year_format,
        next_sequence: config.next_sequence,
      });
    }
  }, [config, form]);

  const onSubmit = async (data: ConfigFormData) => {
    await updateConfig.mutateAsync(data as AdmissionNumberConfig);
  };

  const selectedFormat = form.watch('format');

  if (configLoading) {
    return (
      <DashboardLayout title="Admission Number Settings" subtitle="Configure how admission numbers are generated">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admission Number Settings" subtitle="Configure how admission numbers are generated">
      <div className="mx-auto max-w-2xl space-y-6">
        <SettingsBackHeader title="Admission Number Settings" />

        {/* Preview Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Next Admission Number Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {previewLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Badge variant="secondary" className="font-mono text-xl px-4 py-2">
                  {preview || 'Loading...'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This is what the next automatically generated admission number will look like.
            </p>
          </CardContent>
        </Card>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Format Configuration
            </CardTitle>
            <CardDescription>
              Customize how admission numbers are structured for your institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Auto Generate Toggle */}
                <FormField
                  control={form.control}
                  name="auto_generate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Auto-Generation</FormLabel>
                        <FormDescription>
                          When enabled, new students will have admission numbers generated automatically
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Prefix */}
                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefix</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., KPS, STU, ADM" {...field} />
                      </FormControl>
                      <FormDescription>
                        Usually the school code or abbreviation (e.g., KPS for Kahawa Primary School)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Format */}
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number Format</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prefix_year_seq">
                            Prefix/Year/Sequence (KPS/2026/001)
                          </SelectItem>
                          <SelectItem value="year_prefix_seq">
                            Year/Prefix/Sequence (2026/KPS/001)
                          </SelectItem>
                          <SelectItem value="prefix_seq">
                            Prefix/Sequence only (KPS/001)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Pattern: {formatExamples[selectedFormat]}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Separator */}
                <FormField
                  control={form.control}
                  name="separator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Separator</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select separator" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="/">Slash (/)</SelectItem>
                          <SelectItem value="-">Dash (-)</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Character used to separate parts of the admission number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sequence Padding */}
                <FormField
                  control={form.control}
                  name="sequence_padding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sequence Digits</FormLabel>
                      <Select onValueChange={field.onChange} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select padding" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2">2 digits (01, 99)</SelectItem>
                          <SelectItem value="3">3 digits (001, 999)</SelectItem>
                          <SelectItem value="4">4 digits (0001, 9999)</SelectItem>
                          <SelectItem value="5">5 digits (00001, 99999)</SelectItem>
                          <SelectItem value="6">6 digits (000001, 999999)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How many digits to use for the sequence number (with leading zeros)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Year Options */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="include_year"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Include Year</FormLabel>
                          <FormDescription>
                            Add the year to the number
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year_format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Format</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full">Full (2026)</SelectItem>
                            <SelectItem value="short">Short (26)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Current Sequence */}
                <FormField
                  control={form.control}
                  name="next_sequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Sequence Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        The next number in the sequence. Increase this if you're migrating from an existing system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateConfig.isPending}
                    className="gap-2"
                  >
                    {updateConfig.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Settings
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
