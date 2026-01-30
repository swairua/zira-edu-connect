import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export type ImportType = 'students' | 'parents' | 'staff' | 'opening_balances' | 'historical_grades' | 'historical_payments' | 'historical_attendance';
export type ImportStatus = 'pending' | 'validating' | 'validated' | 'importing' | 'completed' | 'failed' | 'rolled_back';

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface DataImport {
  id: string;
  institution_id: string;
  import_type: ImportType;
  file_name: string | null;
  file_url: string | null;
  status: ImportStatus;
  is_dry_run: boolean;
  total_rows: number;
  valid_rows: number;
  imported_rows: number;
  failed_rows: number;
  validation_errors: ValidationError[];
  imported_ids: string[];
  imported_by: string | null;
  validated_at: string | null;
  imported_at: string | null;
  rolled_back_at: string | null;
  rolled_back_by: string | null;
  created_at: string;
}

export interface OpeningBalance {
  id: string;
  institution_id: string;
  import_id: string | null;
  student_id: string | null;
  admission_number: string;
  balance_date: string;
  amount: number;
  description: string | null;
  created_at: string;
}

// Helper to convert DB response to typed DataImport
function mapDataImport(row: any): DataImport {
  return {
    ...row,
    import_type: row.import_type as ImportType,
    status: row.status as ImportStatus,
    validation_errors: (row.validation_errors || []) as ValidationError[],
  };
}

export function useDataImports() {
  const { institutionId } = useInstitution();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all imports for institution
  const { data: imports, isLoading } = useQuery({
    queryKey: ['data-imports', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('data_imports')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDataImport);
    },
    enabled: !!institutionId,
  });

  // Fetch imports by type
  const getImportsByType = (type: ImportType) => {
    return imports?.filter(i => i.import_type === type) || [];
  };

  // Create new import record
  const createImport = useMutation({
    mutationFn: async ({ 
      importType, 
      fileName,
      totalRows,
      isDryRun = false 
    }: { 
      importType: ImportType; 
      fileName: string;
      totalRows: number;
      isDryRun?: boolean;
    }) => {
      if (!institutionId || !user?.id) throw new Error('Missing required data');

      const { data, error } = await supabase
        .from('data_imports')
        .insert({
          institution_id: institutionId,
          import_type: importType,
          file_name: fileName,
          total_rows: totalRows,
          is_dry_run: isDryRun,
          imported_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return mapDataImport(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-imports', institutionId] });
    },
  });

  // Update import status and results
  const updateImport = useMutation({
    mutationFn: async ({ 
      importId, 
      updates 
    }: { 
      importId: string; 
      updates: {
        status?: string;
        valid_rows?: number;
        imported_rows?: number;
        failed_rows?: number;
        validation_errors?: Json;
        imported_ids?: string[];
        validated_at?: string;
        imported_at?: string;
      };
    }) => {
      const { error } = await supabase
        .from('data_imports')
        .update(updates)
        .eq('id', importId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-imports', institutionId] });
    },
  });

  // Rollback an import (delete imported records)
  const rollbackImport = useMutation({
    mutationFn: async (importId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const importRecord = imports?.find(i => i.id === importId);
      if (!importRecord) throw new Error('Import not found');

      // Check if institution is still in onboarding (can rollback)
      const { data: institution } = await supabase
        .from('institutions')
        .select('onboarding_status')
        .eq('id', institutionId)
        .single();

      if (institution?.onboarding_status === 'completed') {
        throw new Error('Cannot rollback after go-live. Please contact support.');
      }

      // Delete records based on import type
      if (importRecord.imported_ids && importRecord.imported_ids.length > 0) {
        const ids = importRecord.imported_ids;
        
        switch (importRecord.import_type) {
          case 'students': {
            const { error: deleteError } = await supabase
              .from('students')
              .delete()
              .in('id', ids);
            if (deleteError) throw deleteError;
            break;
          }
          case 'parents': {
            const { error: deleteError } = await supabase
              .from('parents')
              .delete()
              .in('id', ids);
            if (deleteError) throw deleteError;
            break;
          }
          case 'staff': {
            const { error: deleteError } = await supabase
              .from('staff')
              .delete()
              .in('id', ids);
            if (deleteError) throw deleteError;
            break;
          }
          case 'opening_balances': {
            const { error: deleteError } = await supabase
              .from('opening_balances')
              .delete()
              .in('id', ids);
            if (deleteError) throw deleteError;
            break;
          }
          case 'historical_grades': {
            const { error: deleteError } = await supabase
              .from('student_scores')
              .delete()
              .in('id', ids);
            if (deleteError) throw deleteError;
            break;
          }
          case 'historical_payments': {
            const { error: deleteError } = await supabase
              .from('student_payments')
              .delete()
              .in('id', ids);
            if (deleteError) throw deleteError;
            break;
          }
          case 'historical_attendance': {
            const { error: deleteError } = await supabase
              .from('attendance')
              .delete()
              .in('id', ids);
            if (deleteError) throw deleteError;
            break;
          }
          default:
            throw new Error('Unknown import type');
        }
      }

      // Update import status
      const { error } = await supabase
        .from('data_imports')
        .update({
          status: 'rolled_back',
          rolled_back_at: new Date().toISOString(),
          rolled_back_by: user.id,
        })
        .eq('id', importId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-imports', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: 'Import Rolled Back',
        description: 'All imported records have been removed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Rollback Failed',
        description: error.message || 'Failed to rollback import',
        variant: 'destructive',
      });
    },
  });

  // Fetch opening balances
  const { data: openingBalances } = useQuery({
    queryKey: ['opening-balances', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('opening_balances')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OpeningBalance[];
    },
    enabled: !!institutionId,
  });

  // Import opening balances
  const importOpeningBalances = useMutation({
    mutationFn: async ({ 
      balances, 
      importId 
    }: { 
      balances: Omit<OpeningBalance, 'id' | 'created_at' | 'institution_id' | 'import_id'>[]; 
      importId: string;
    }) => {
      if (!institutionId) throw new Error('No institution selected');

      const insertData = balances.map(b => ({
        ...b,
        institution_id: institutionId,
        import_id: importId,
      }));

      const { data, error } = await supabase
        .from('opening_balances')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Update import record with imported IDs
      updateImport.mutate({
        importId: variables.importId,
        updates: {
          status: 'completed',
          imported_rows: data.length,
          imported_ids: data.map(d => d.id),
          imported_at: new Date().toISOString(),
        },
      });
      queryClient.invalidateQueries({ queryKey: ['opening-balances', institutionId] });
    },
  });

  // Get import statistics
  const getImportStats = () => {
    const stats: Record<ImportType, { total: number; completed: number; failed: number }> = {
      students: { total: 0, completed: 0, failed: 0 },
      parents: { total: 0, completed: 0, failed: 0 },
      staff: { total: 0, completed: 0, failed: 0 },
      opening_balances: { total: 0, completed: 0, failed: 0 },
      historical_grades: { total: 0, completed: 0, failed: 0 },
      historical_payments: { total: 0, completed: 0, failed: 0 },
      historical_attendance: { total: 0, completed: 0, failed: 0 },
    };

    imports?.forEach(imp => {
      if (imp.status === 'completed') {
        stats[imp.import_type].completed += imp.imported_rows;
      } else if (imp.status === 'failed') {
        stats[imp.import_type].failed += imp.failed_rows;
      }
      stats[imp.import_type].total += imp.total_rows;
    });

    return stats;
  };

  return {
    imports,
    isLoading,
    getImportsByType,
    createImport,
    updateImport,
    rollbackImport,
    openingBalances,
    importOpeningBalances,
    getImportStats,
  };
}
