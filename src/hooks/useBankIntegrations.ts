import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BankIntegration {
  id: string;
  bank_code: string;
  bank_name: string;
  provider_type: 'bank_api' | 'mobile_money' | 'card_processor';
  credentials: Record<string, unknown>;
  oauth_settings: Record<string, unknown>;
  webhook_config: Record<string, unknown>;
  environment: 'sandbox' | 'production';
  is_active: boolean;
  supported_countries: string[];
  api_base_url: string | null;
  health_status: 'healthy' | 'degraded' | 'down' | 'unknown';
  last_health_check: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstitutionBankAccount {
  id: string;
  institution_id: string;
  platform_integration_id: string;
  account_number: string | null;
  account_name: string | null;
  paybill_number: string | null;
  till_number: string | null;
  account_reference: string | null;
  fee_type_mappings: unknown[];
  campus_mappings: string[];
  academic_year_id: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  platform_bank_integrations?: BankIntegration;
}

export interface CreateBankIntegrationInput {
  bank_code: string;
  bank_name: string;
  provider_type: 'bank_api' | 'mobile_money' | 'card_processor';
  credentials?: Record<string, unknown>;
  oauth_settings?: Record<string, unknown>;
  webhook_config?: Record<string, unknown>;
  environment?: 'sandbox' | 'production';
  is_active?: boolean;
  supported_countries?: string[];
  api_base_url?: string;
}

export interface UpdateBankIntegrationInput {
  id: string;
  bank_name?: string;
  credentials?: Record<string, unknown>;
  oauth_settings?: Record<string, unknown>;
  webhook_config?: Record<string, unknown>;
  environment?: 'sandbox' | 'production';
  is_active?: boolean;
  supported_countries?: string[];
  api_base_url?: string;
}

// Fetch all platform bank integrations
export function useBankIntegrations() {
  return useQuery({
    queryKey: ['bank-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_bank_integrations')
        .select('*')
        .order('bank_name');

      if (error) throw error;
      return data as BankIntegration[];
    },
  });
}

// Fetch single bank integration
export function useBankIntegration(id: string | null) {
  return useQuery({
    queryKey: ['bank-integration', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('platform_bank_integrations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as BankIntegration;
    },
    enabled: !!id,
  });
}

// Create bank integration
export function useCreateBankIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBankIntegrationInput) => {
      const { data, error } = await supabase
        .from('platform_bank_integrations')
        .insert(input as never)
        .select()
        .single();

      if (error) throw error;
      return data as BankIntegration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-integrations'] });
      toast.success('Bank integration created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create bank integration: ${error.message}`);
    },
  });
}

// Update bank integration
export function useUpdateBankIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateBankIntegrationInput) => {
      const { data, error } = await supabase
        .from('platform_bank_integrations')
        .update(input as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as BankIntegration;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['bank-integration', data.id] });
      toast.success('Bank integration updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bank integration: ${error.message}`);
    },
  });
}

// Toggle bank integration active status
export function useToggleBankIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('platform_bank_integrations')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as BankIntegration;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['bank-integration', data.id] });
      toast.success(`Bank integration ${data.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle bank integration: ${error.message}`);
    },
  });
}

// Fetch institution bank accounts
export function useInstitutionBankAccounts(institutionId: string | null) {
  return useQuery({
    queryKey: ['institution-bank-accounts', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('institution_bank_accounts')
        .select('*, platform_bank_integrations(*)')
        .eq('institution_id', institutionId)
        .order('created_at');

      if (error) throw error;
      return data as InstitutionBankAccount[];
    },
    enabled: !!institutionId,
  });
}

// Get active integrations for an institution to enable
export function useAvailableBankIntegrations() {
  return useQuery({
    queryKey: ['available-bank-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_bank_integrations')
        .select('*')
        .eq('is_active', true)
        .order('bank_name');

      if (error) throw error;
      return data as BankIntegration[];
    },
  });
}

// Enable bank for institution
export function useEnableInstitutionBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      institutionId,
      integrationId,
      accountDetails,
    }: {
      institutionId: string;
      integrationId: string;
      accountDetails?: {
        account_number?: string;
        account_name?: string;
        paybill_number?: string;
        till_number?: string;
        account_reference?: string;
      };
    }) => {
      const { data, error } = await supabase
        .from('institution_bank_accounts')
        .upsert({
          institution_id: institutionId,
          platform_integration_id: integrationId,
          is_enabled: true,
          ...accountDetails,
        }, {
          onConflict: 'institution_id,platform_integration_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institution-bank-accounts', variables.institutionId] });
      toast.success('Bank enabled for institution');
    },
    onError: (error: Error) => {
      toast.error(`Failed to enable bank: ${error.message}`);
    },
  });
}

// Update institution bank account
export function useUpdateInstitutionBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      account_number?: string;
      account_name?: string;
      paybill_number?: string;
      till_number?: string;
      account_reference?: string;
      fee_type_mappings?: Record<string, unknown>[];
      campus_mappings?: string[];
      academic_year_id?: string;
      is_enabled?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('institution_bank_accounts')
        .update(input as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as InstitutionBankAccount;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['institution-bank-accounts', data.institution_id] });
      toast.success('Bank account updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bank account: ${error.message}`);
    },
  });
}

// Get connected institutions count for a bank integration
export function useBankIntegrationStats(integrationId: string | null) {
  return useQuery({
    queryKey: ['bank-integration-stats', integrationId],
    queryFn: async () => {
      if (!integrationId) return { connectedCount: 0, enabledCount: 0 };
      
      const { count: connectedCount, error: connectedError } = await supabase
        .from('institution_bank_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('platform_integration_id', integrationId);

      if (connectedError) throw connectedError;

      const { count: enabledCount, error: enabledError } = await supabase
        .from('institution_bank_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('platform_integration_id', integrationId)
        .eq('is_enabled', true);

      if (enabledError) throw enabledError;

      return {
        connectedCount: connectedCount || 0,
        enabledCount: enabledCount || 0,
      };
    },
    enabled: !!integrationId,
  });
}
