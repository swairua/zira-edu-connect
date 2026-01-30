import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SmsBundle {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  bonus_credits: number;
  currency: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface InstitutionSmsCredits {
  id: string;
  institution_id: string;
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  low_balance_threshold: number;
  last_topup_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SmsCreditTransaction {
  id: string;
  institution_id: string;
  transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'adjustment';
  credits: number;
  balance_after: number;
  bundle_id: string | null;
  payment_id: string | null;
  sms_log_id: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

// Fetch all SMS bundles
export function useSmsBundles() {
  return useQuery({
    queryKey: ['sms-bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_bundles')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as SmsBundle[];
    },
  });
}

// Fetch active SMS bundles only
export function useActiveSmsBundles() {
  return useQuery({
    queryKey: ['sms-bundles', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_bundles')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as SmsBundle[];
    },
  });
}

// Fetch institution SMS credits
export function useInstitutionSmsCredits(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['institution-sms-credits', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      
      const { data, error } = await supabase
        .from('institution_sms_credits')
        .select('*')
        .eq('institution_id', institutionId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as InstitutionSmsCredits | null;
    },
    enabled: !!institutionId,
  });
}

// Fetch all institutions with SMS credits (for platform billing)
export function useAllInstitutionSmsCredits() {
  return useQuery({
    queryKey: ['all-institution-sms-credits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_sms_credits')
        .select(`
          *,
          institution:institutions(id, name, code)
        `)
        .order('remaining_credits', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
}

// Fetch SMS credit transactions for an institution
export function useSmsCreditTransactions(institutionId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: ['sms-credit-transactions', institutionId, limit],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('sms_credit_transactions')
        .select(`
          *,
          bundle:sms_bundles(name)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
  });
}

// Fetch SMS credit purchases for an institution (for tracking purchase status)
export function useSmsCreditPurchases(institutionId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ['sms-credit-purchases', institutionId, limit],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('sms_credit_purchases')
        .select(`
          *,
          bundle:sms_bundles(name, credits, bonus_credits)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
    refetchInterval: (query) => {
      // Auto-refetch if there are pending purchases
      const purchases = query.state.data as any[] | undefined;
      const hasPending = purchases?.some(p => p.status === 'pending' || p.status === 'processing');
      return hasPending ? 5000 : false;
    },
  });
}

// Create or update SMS bundle
export function useUpsertSmsBundle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (bundle: Partial<SmsBundle> & { name: string; price: number; credits: number }) => {
      if (bundle.id) {
        const { id, ...updates } = bundle;
        const { data, error } = await supabase
          .from('sms_bundles')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('sms_bundles')
          .insert(bundle)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sms-bundles'] });
      toast({
        title: 'Success',
        description: variables.id ? 'SMS bundle updated' : 'SMS bundle created',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save SMS bundle',
        variant: 'destructive',
      });
      console.error('SMS bundle error:', error);
    },
  });
}

// Toggle SMS bundle active status
export function useToggleSmsBundleActive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('sms_bundles')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sms-bundles'] });
      toast({
        title: 'Success',
        description: `Bundle ${variables.is_active ? 'activated' : 'deactivated'}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update bundle status',
        variant: 'destructive',
      });
      console.error('Toggle bundle error:', error);
    },
  });
}

// Add SMS credits to institution (admin action)
export function useAddSmsCredits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      institutionId,
      credits,
      bundleId,
      paymentId,
      description,
    }: {
      institutionId: string;
      credits: number;
      bundleId?: string;
      paymentId?: string;
      description?: string;
    }) => {
      // First, get or create the institution's credit record
      const { data: existing } = await supabase
        .from('institution_sms_credits')
        .select('*')
        .eq('institution_id', institutionId)
        .single();
      
      const currentBalance = existing?.total_credits ?? 0;
      const currentUsed = existing?.used_credits ?? 0;
      const newTotal = currentBalance + credits;
      const newBalance = newTotal - currentUsed;
      
      // Upsert the credit record
      const { error: creditError } = await supabase
        .from('institution_sms_credits')
        .upsert({
          institution_id: institutionId,
          total_credits: newTotal,
          used_credits: currentUsed,
          last_topup_at: new Date().toISOString(),
        });
      
      if (creditError) throw creditError;
      
      // Record the transaction
      const { error: txError } = await supabase
        .from('sms_credit_transactions')
        .insert({
          institution_id: institutionId,
          transaction_type: 'purchase',
          credits,
          balance_after: newBalance,
          bundle_id: bundleId,
          payment_id: paymentId,
          description: description || 'SMS credits purchased',
        });
      
      if (txError) throw txError;
      
      return { newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-sms-credits'] });
      queryClient.invalidateQueries({ queryKey: ['all-institution-sms-credits'] });
      queryClient.invalidateQueries({ queryKey: ['sms-credit-transactions'] });
      toast({
        title: 'Success',
        description: 'SMS credits added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add SMS credits',
        variant: 'destructive',
      });
      console.error('Add credits error:', error);
    },
  });
}

// Calculate effective rate per SMS for a bundle
export function calculateSmsRate(bundle: SmsBundle): number {
  const totalCredits = bundle.credits + bundle.bonus_credits;
  return totalCredits > 0 ? bundle.price / totalCredits : 0;
}

// Get SMS balance status
export function getSmsBalanceStatus(credits: InstitutionSmsCredits | null): 'healthy' | 'low' | 'critical' | 'empty' {
  if (!credits) return 'empty';
  
  const remaining = credits.remaining_credits;
  const threshold = credits.low_balance_threshold;
  
  if (remaining <= 0) return 'empty';
  if (remaining <= threshold / 2) return 'critical';
  if (remaining <= threshold) return 'low';
  return 'healthy';
}
