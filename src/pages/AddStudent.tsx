import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { useInstitution } from '@/contexts/InstitutionContext';
import { useCreateStudent } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useAdmissionNumberPreview, useGenerateAdmissionNumber } from '@/hooks/useAdmissionNumber';
import { LimitWarningBanner } from '@/components/subscription/LimitWarningBanner';
import { ArrowLeft, Loader2, Save, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const studentSchema = z.object({
  auto_generate_admission: z.boolean().default(true),
  admission_number: z.string().optional(),
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  class_id: z.string().optional(),
  admission_date: z.string().optional(),
  boarding_status: z.string().optional(),
}).refine(data => {
  // Either auto-generate is on, or admission number is provided
  return data.auto_generate_admission || (data.admission_number && data.admission_number.trim().length > 0);
}, {
  message: "Admission number is required when auto-generate is off",
  path: ["admission_number"]
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function AddStudent() {
  const navigate = useNavigate();
  const { institutionId } = useInstitution();
  const { data: classes = [] } = useClasses(institutionId);
  const createStudent = useCreateStudent();
  const { data: admissionPreview, isLoading: previewLoading } = useAdmissionNumberPreview();
  const generateAdmissionNumber = useGenerateAdmissionNumber();
  const { 
    canAddStudents, 
    isNearStudentLimit, 
    remainingStudentSlots, 
    planName 
  } = useSubscriptionLimits();

  const limitReached = !canAddStudents();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      auto_generate_admission: true,
      admission_number: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      nationality: 'Kenyan',
      class_id: '',
      admission_date: new Date().toISOString().split('T')[0],
      boarding_status: 'day',
    },
  });

  const autoGenerate = form.watch('auto_generate_admission');

  const onSubmit = async (data: StudentFormData) => {
    if (!institutionId) return;

    try {
      let admissionNumber = data.admission_number || '';
      
      // Generate admission number if auto-generate is enabled
      if (data.auto_generate_admission) {
        admissionNumber = await generateAdmissionNumber.mutateAsync();
      }

      await createStudent.mutateAsync({
        institution_id: institutionId,
        admission_number: admissionNumber,
        first_name: data.first_name,
        middle_name: data.middle_name || null,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        nationality: data.nationality || null,
        class_id: data.class_id || null,
        admission_date: data.admission_date || null,
        boarding_status: data.boarding_status || 'day',
        status: 'active',
      });

      navigate('/students');
    } catch (error) {
      // Error is already handled by onError callback in the mutation
      console.error('Failed to create student:', error);
    }
  };

  const isSubmitting = createStudent.isPending || generateAdmissionNumber.isPending;

  return (
    <DashboardLayout title="Add Student" subtitle="Register a new student">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Limit Warnings */}
        {limitReached && (
          <LimitWarningBanner
            type="students"
            remaining={remainingStudentSlots}
            planName={planName}
            isLimitReached={true}
          />
        )}
        {!limitReached && isNearStudentLimit && (
          <LimitWarningBanner
            type="students"
            remaining={remainingStudentSlots}
            planName={planName}
          />
        )}

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add New Student</h1>
            <p className="text-muted-foreground">Register a new student to the institution</p>
          </div>
        </div>

        {/* Form */}
        <Card className={limitReached ? 'opacity-60 pointer-events-none' : ''}>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Enter the student's personal and academic details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Admission Number Section */}
                <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                  <FormField
                    control={form.control}
                    name="auto_generate_admission"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Auto-generate Admission Number
                          </FormLabel>
                          <FormDescription>
                            Let the system create a unique admission number
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

                  {autoGenerate ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Next number:</span>
                      {previewLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Badge variant="secondary" className="font-mono text-base">
                          {admissionPreview || 'Loading...'}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="admission_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admission Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ADM-2024-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Name Fields */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Middle name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Personal Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kenyan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Academic Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="class_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="admission_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Boarding Status */}
                <FormField
                  control={form.control}
                  name="boarding_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Boarding Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select boarding status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="day">Day Student</SelectItem>
                          <SelectItem value="boarding">Boarding Student</SelectItem>
                          <SelectItem value="day_boarding">Day Boarding (Hybrid)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/students')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || limitReached}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Student
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
