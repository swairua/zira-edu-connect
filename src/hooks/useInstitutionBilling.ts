import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InstitutionInvoice {
  id: string;
  institution_id: string;
  invoice_number: string;
  invoice_type: 'subscription' | 'addon' | 'renewal';
  billing_period_start: string | null;
  billing_period_end: string | null;
  plan_id: string | null;
  base_plan_amount: number;
  addons_amount: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  line_items: Array<{ description: string; amount: number; quantity?: number }>;
  notes: string | null;
  created_at: string;
}

export interface InstitutionPayment {
  id: string;
  institution_id: string;
  invoice_id: string | null;
  amount: number;
  currency: string;
  payment_type: 'plan_upgrade' | 'addon_purchase' | 'renewal';
  payment_method: 'mpesa' | 'bank_transfer' | 'card';
  payment_reference: string | null;
  mpesa_receipt: string | null;
  mpesa_phone: string | null;
  checkout_request_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, unknown>;
  created_at: string;
}

export type BillingCycleType = 'monthly' | 'termly' | 'annual';

export interface SubscriptionDetails {
  currentPlan: {
    id: string;
    name: string;
    monthlyPrice: number;
    termlyPrice: number;
    annualPrice: number;
    maxStudents: number;
    maxStaff: number;
    modules: string[];
    features: string[];
  } | null;
  usage: {
    studentCount: number;
    staffCount: number;
    studentLimit: number;
    staffLimit: number;
    studentPercentage: number;
    staffPercentage: number;
  };
  subscription: {
    status: string;
    startedAt: string | null;
    expiresAt: string | null;
    lastPaymentAt: string | null;
    billingCycle: BillingCycleType;
  };
  enabledModules: string[];
}

export function useInstitutionBilling(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['institution-billing', institutionId],
    queryFn: async (): Promise<SubscriptionDetails> => {
      if (!institutionId) throw new Error('Institution ID required');

      // Fetch institution with subscription details
      const { data: institution, error: instError } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', institutionId)
        .single();

      if (instError) throw instError;

      // Fetch current plan details
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', institution.subscription_plan)
        .single();

      const maxStudents = plan?.max_students ?? -1;
      const maxStaff = plan?.max_staff ?? -1;

      return {
        currentPlan: plan ? {
          id: plan.id,
          name: plan.name,
          monthlyPrice: plan.price_monthly,
          termlyPrice: (plan as any).price_termly || 0,
          annualPrice: plan.price_yearly,
          maxStudents: maxStudents,
          maxStaff: maxStaff,
          modules: plan.modules || [],
          features: Array.isArray(plan.features) ? plan.features as string[] : [],
        } : null,
        usage: {
          studentCount: institution.student_count || 0,
          staffCount: institution.staff_count || 0,
          studentLimit: maxStudents,
          staffLimit: maxStaff,
          studentPercentage: maxStudents > 0 ? ((institution.student_count || 0) / maxStudents) * 100 : 0,
          staffPercentage: maxStaff > 0 ? ((institution.staff_count || 0) / maxStaff) * 100 : 0,
        },
        subscription: {
          status: institution.status || 'active',
          startedAt: institution.subscription_started_at,
          expiresAt: institution.subscription_expires_at,
          lastPaymentAt: institution.last_payment_at,
          billingCycle: (institution as any).billing_cycle || 'annual',
        },
        enabledModules: institution.enabled_modules || [],
      };
    },
    enabled: !!institutionId,
  });
}

export function useInstitutionInvoices(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['institution-invoices', institutionId],
    queryFn: async () => {
      if (!institutionId) throw new Error('Institution ID required');

      const { data, error } = await supabase
        .from('institution_invoices')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as InstitutionInvoice[];
    },
    enabled: !!institutionId,
  });
}

export function useInstitutionPayments(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['institution-payments', institutionId],
    queryFn: async () => {
      if (!institutionId) throw new Error('Institution ID required');

      const { data, error } = await supabase
        .from('institution_payments')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InstitutionPayment[];
    },
    enabled: !!institutionId,
  });
}

export function useAvailablePlans() {
  return useQuery({
    queryKey: ['available-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useAvailableModules() {
  return useQuery({
    queryKey: ['available-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_pricing')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export interface InitiatePaymentResult {
  paymentId: string;
  checkoutRequestId: string;
  invoiceId: string;
}

export function useInitiateSubscriptionPayment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      institutionId: string;
      paymentType: 'plan_upgrade' | 'addon_purchase' | 'renewal';
      amount: number;
      phoneNumber: string;
      planId?: string;
      moduleId?: string;
      billingCycle?: BillingCycleType;
    }): Promise<InitiatePaymentResult> => {
      const { data, error } = await supabase.functions.invoke('subscription-payment', {
        body: params,
      });

      if (error) throw error;
      
      return {
        paymentId: data.paymentId,
        checkoutRequestId: data.checkoutRequestId,
        invoiceId: data.invoiceId,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-payments'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCheckPaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data, error } = await supabase
        .from('institution_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      return data as InstitutionPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-billing'] });
      queryClient.invalidateQueries({ queryKey: ['institution-payments'] });
      queryClient.invalidateQueries({ queryKey: ['institution-invoices'] });
    },
  });
}
