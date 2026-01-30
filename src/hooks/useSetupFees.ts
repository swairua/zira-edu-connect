import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SetupFeeCatalogItem {
  id: string;
  service_type: 'setup' | 'migration' | 'integration' | 'training' | 'customization';
  name: string;
  description: string | null;
  base_price: number;
  price_type: 'flat' | 'per_unit' | 'per_hour' | 'per_day' | 'per_record';
  unit_label: string | null;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface InstitutionSetupFee {
  id: string;
  institution_id: string;
  fee_catalog_id: string | null;
  custom_name: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  discount_percentage: number;
  final_amount: number;
  status: 'quoted' | 'approved' | 'invoiced' | 'paid' | 'waived';
  notes: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  fee_catalog?: SetupFeeCatalogItem;
}

export interface SetupFeeSettings {
  base_setup_fee: number;
  data_migration_fee_per_record: number;
  data_migration_flat_fee: number;
  integration_fee_per_system: number;
  training_fee_per_day: number;
  customization_hourly_rate: number;
}

// Fetch all active setup fee catalog items
export function useSetupFeeCatalog() {
  return useQuery({
    queryKey: ['setup-fee-catalog'],
    queryFn: async (): Promise<SetupFeeCatalogItem[]> => {
      const { data, error } = await supabase
        .from('setup_fee_catalog')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SetupFeeCatalogItem[];
    },
  });
}

// Fetch setup fee settings from billing_settings
export function useSetupFeeSettings() {
  return useQuery({
    queryKey: ['setup-fee-settings'],
    queryFn: async (): Promise<SetupFeeSettings | null> => {
      const { data, error } = await supabase
        .from('billing_settings')
        .select('base_setup_fee, data_migration_fee_per_record, data_migration_flat_fee, integration_fee_per_system, training_fee_per_day, customization_hourly_rate')
        .limit(1)
        .single();

      if (error) throw error;
      return data as SetupFeeSettings;
    },
  });
}

// Update setup fee settings
export function useUpdateSetupFeeSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<SetupFeeSettings>) => {
      const { data: existing } = await supabase
        .from('billing_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('billing_settings')
          .update(settings)
          .eq('id', existing.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup-fee-settings'] });
      queryClient.invalidateQueries({ queryKey: ['billing-settings'] });
      toast.success('Setup fee settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update setup fee settings');
      console.error(error);
    },
  });
}

// Fetch institution setup fees
export function useInstitutionSetupFees(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['institution-setup-fees', institutionId],
    queryFn: async (): Promise<InstitutionSetupFee[]> => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('institution_setup_fees')
        .select(`
          *,
          fee_catalog:setup_fee_catalog(*)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as InstitutionSetupFee[];
    },
    enabled: !!institutionId,
  });
}

// Save institution setup fee
export function useSaveInstitutionSetupFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fee: {
      institution_id: string;
      fee_catalog_id?: string;
      custom_name?: string;
      quantity: number;
      unit_price: number;
      discount_percentage?: number;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('institution_setup_fees')
        .insert(fee);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institution-setup-fees', variables.institution_id] });
      toast.success('Setup fee added');
    },
    onError: (error) => {
      toast.error('Failed to add setup fee');
      console.error(error);
    },
  });
}

// Update institution setup fee status
export function useUpdateSetupFeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, institutionId }: { id: string; status: string; institutionId: string }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
      } else if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('institution_setup_fees')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return institutionId;
    },
    onSuccess: (institutionId) => {
      queryClient.invalidateQueries({ queryKey: ['institution-setup-fees', institutionId] });
      toast.success('Setup fee status updated');
    },
    onError: (error) => {
      toast.error('Failed to update setup fee status');
      console.error(error);
    },
  });
}

// Delete institution setup fee
export function useDeleteInstitutionSetupFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('institution_setup_fees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return institutionId;
    },
    onSuccess: (institutionId) => {
      queryClient.invalidateQueries({ queryKey: ['institution-setup-fees', institutionId] });
      toast.success('Setup fee removed');
    },
    onError: (error) => {
      toast.error('Failed to remove setup fee');
      console.error(error);
    },
  });
}

// Calculate total setup fees
export function calculateSetupFeeTotal(fees: InstitutionSetupFee[]): {
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
} {
  const subtotal = fees.reduce((sum, fee) => sum + fee.total_amount, 0);
  const finalTotal = fees.reduce((sum, fee) => sum + fee.final_amount, 0);
  const totalDiscount = subtotal - finalTotal;

  return { subtotal, totalDiscount, finalTotal };
}

// Service type labels
export const SERVICE_TYPE_LABELS: Record<string, string> = {
  setup: 'Platform Setup',
  migration: 'Data Migration',
  integration: 'Integration',
  training: 'Training',
  customization: 'Customization',
};

// Status labels and variants
export const SETUP_FEE_STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  quoted: { label: 'Quoted', variant: 'outline' },
  approved: { label: 'Approved', variant: 'secondary' },
  invoiced: { label: 'Invoiced', variant: 'default' },
  paid: { label: 'Paid', variant: 'default' },
  waived: { label: 'Waived', variant: 'secondary' },
};
