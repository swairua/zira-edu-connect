import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

// Types
export interface PayrollSettings {
  id: string;
  institution_id: string;
  pay_day: number;
  currency: string;
  auto_generate: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalaryStructure {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  base_salary: number;
  min_salary: number | null;
  max_salary: number | null;
  is_active: boolean;
  created_at: string;
}

export interface StaffSalary {
  id: string;
  staff_id: string;
  institution_id: string;
  salary_structure_id: string | null;
  basic_salary: number;
  effective_from: string;
  effective_to: string | null;
  is_current: boolean;
  created_at: string;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_number: string;
    department: string;
    designation: string;
  };
}

export interface AllowanceType {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  description: string | null;
  calculation_type: 'fixed' | 'percentage';
  default_amount: number;
  is_taxable: boolean;
  is_active: boolean;
  created_at: string;
}

export interface DeductionType {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  description: string | null;
  calculation_type: 'fixed' | 'percentage';
  default_amount: number;
  is_statutory: boolean;
  is_active: boolean;
  created_at: string;
}

export interface StaffAllowance {
  id: string;
  staff_id: string;
  institution_id: string;
  allowance_type_id: string;
  amount: number;
  calculation_type: 'fixed' | 'percentage';
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  allowance_type?: AllowanceType;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface StaffDeduction {
  id: string;
  staff_id: string;
  institution_id: string;
  deduction_type_id: string;
  amount: number;
  calculation_type: 'fixed' | 'percentage';
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  deduction_type?: DeductionType;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface PayrollRun {
  id: string;
  institution_id: string;
  month: number;
  year: number;
  status: 'draft' | 'processing' | 'completed' | 'cancelled';
  total_staff: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  processed_at: string | null;
  processed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface Payslip {
  id: string;
  payroll_run_id: string;
  staff_id: string;
  institution_id: string;
  basic_salary: number;
  total_allowances: number;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  status: 'generated' | 'sent' | 'paid';
  payment_date: string | null;
  payment_method: string | null;
  payment_ref: string | null;
  created_at: string;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_number: string;
    department: string;
  };
  payroll_run?: PayrollRun;
}

export interface PayslipItem {
  id: string;
  payslip_id: string;
  item_type: 'allowance' | 'deduction';
  type_id: string | null;
  name: string;
  amount: number;
}

// Payroll Settings Hooks
export function usePayrollSettings() {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['payroll-settings', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return null;
      
      const { data, error } = await supabase
        .from('payroll_settings')
        .select('*')
        .eq('institution_id', institution.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as PayrollSettings | null;
    },
    enabled: !!institution?.id,
  });
}

export function useUpsertPayrollSettings() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  
  return useMutation({
    mutationFn: async (settings: Partial<PayrollSettings>) => {
      if (!institution?.id) throw new Error('No institution');
      
      const { data, error } = await supabase
        .from('payroll_settings')
        .upsert({
          institution_id: institution.id,
          ...settings,
        }, { onConflict: 'institution_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-settings'] });
      toast.success('Settings saved');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Salary Structures Hooks
export function useSalaryStructures() {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['salary-structures', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('salary_structures')
        .select('*')
        .eq('institution_id', institution.id)
        .order('name');
      
      if (error) throw error;
      return data as SalaryStructure[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  
  return useMutation({
    mutationFn: async (data: Omit<SalaryStructure, 'id' | 'institution_id' | 'created_at'>) => {
      if (!institution?.id) throw new Error('No institution');
      
      const { data: result, error } = await supabase
        .from('salary_structures')
        .insert({ ...data, institution_id: institution.id })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      toast.success('Salary structure created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Staff Salaries Hooks
export function useStaffSalaries() {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['staff-salaries', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('staff_salaries')
        .select(`
          *,
          staff:staff_id (
            id,
            first_name,
            last_name,
            employee_number,
            department,
            designation
          )
        `)
        .eq('institution_id', institution.id)
        .eq('is_current', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StaffSalary[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateStaffSalary() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  
  return useMutation({
    mutationFn: async (data: { staff_id: string; basic_salary: number; salary_structure_id?: string }) => {
      if (!institution?.id) throw new Error('No institution');
      
      // First, mark any existing current salary as not current
      await supabase
        .from('staff_salaries')
        .update({ is_current: false, effective_to: new Date().toISOString().split('T')[0] })
        .eq('staff_id', data.staff_id)
        .eq('is_current', true);
      
      // Create new salary record
      const { data: result, error } = await supabase
        .from('staff_salaries')
        .insert({
          ...data,
          institution_id: institution.id,
          is_current: true,
          effective_from: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-salaries'] });
      toast.success('Staff salary updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Allowance Types Hooks
export function useAllowanceTypes() {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['allowance-types', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('allowance_types')
        .select('*')
        .eq('institution_id', institution.id)
        .order('name');
      
      if (error) throw error;
      return data as AllowanceType[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateAllowanceType() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  
  return useMutation({
    mutationFn: async (data: Omit<AllowanceType, 'id' | 'institution_id' | 'created_at'>) => {
      if (!institution?.id) throw new Error('No institution');
      
      const { data: result, error } = await supabase
        .from('allowance_types')
        .insert({ ...data, institution_id: institution.id })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowance-types'] });
      toast.success('Allowance type created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateAllowanceType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AllowanceType> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('allowance_types')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowance-types'] });
      toast.success('Allowance type updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteAllowanceType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('allowance_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowance-types'] });
      toast.success('Allowance type deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Deduction Types Hooks
export function useDeductionTypes() {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['deduction-types', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('deduction_types')
        .select('*')
        .eq('institution_id', institution.id)
        .order('name');
      
      if (error) throw error;
      return data as DeductionType[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateDeductionType() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  
  return useMutation({
    mutationFn: async (data: Omit<DeductionType, 'id' | 'institution_id' | 'created_at'>) => {
      if (!institution?.id) throw new Error('No institution');
      
      const { data: result, error } = await supabase
        .from('deduction_types')
        .insert({ ...data, institution_id: institution.id })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduction-types'] });
      toast.success('Deduction type created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateDeductionType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<DeductionType> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('deduction_types')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduction-types'] });
      toast.success('Deduction type updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteDeductionType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deduction_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduction-types'] });
      toast.success('Deduction type deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Staff Allowances Hooks
export function useStaffAllowances(staffId?: string) {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['staff-allowances', institution?.id, staffId],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      let query = supabase
        .from('staff_allowances')
        .select(`
          *,
          allowance_type:allowance_type_id (*),
          staff:staff_id (id, first_name, last_name)
        `)
        .eq('institution_id', institution.id)
        .eq('is_active', true);
      
      if (staffId) {
        query = query.eq('staff_id', staffId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StaffAllowance[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateStaffAllowance() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  
  return useMutation({
    mutationFn: async (data: Omit<StaffAllowance, 'id' | 'institution_id' | 'is_active' | 'allowance_type' | 'staff'>) => {
      if (!institution?.id) throw new Error('No institution');
      
      const { data: result, error } = await supabase
        .from('staff_allowances')
        .insert({ ...data, institution_id: institution.id })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-allowances'] });
      toast.success('Allowance assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteStaffAllowance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff_allowances')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-allowances'] });
      toast.success('Allowance removed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Staff Deductions Hooks
export function useStaffDeductions(staffId?: string) {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['staff-deductions', institution?.id, staffId],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      let query = supabase
        .from('staff_deductions')
        .select(`
          *,
          deduction_type:deduction_type_id (*),
          staff:staff_id (id, first_name, last_name)
        `)
        .eq('institution_id', institution.id)
        .eq('is_active', true);
      
      if (staffId) {
        query = query.eq('staff_id', staffId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StaffDeduction[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreateStaffDeduction() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  
  return useMutation({
    mutationFn: async (data: Omit<StaffDeduction, 'id' | 'institution_id' | 'is_active' | 'deduction_type' | 'staff'>) => {
      if (!institution?.id) throw new Error('No institution');
      
      const { data: result, error } = await supabase
        .from('staff_deductions')
        .insert({ ...data, institution_id: institution.id })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-deductions'] });
      toast.success('Deduction assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteStaffDeduction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff_deductions')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-deductions'] });
      toast.success('Deduction removed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Payroll Runs Hooks
export function usePayrollRuns() {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['payroll-runs', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('institution_id', institution.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data as PayrollRun[];
    },
    enabled: !!institution?.id,
  });
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  
  return useMutation({
    mutationFn: async (data: { month: number; year: number }) => {
      if (!institution?.id) throw new Error('No institution');
      
      const { data: result, error } = await supabase
        .from('payroll_runs')
        .insert({
          ...data,
          institution_id: institution.id,
          status: 'draft',
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Payroll run created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useProcessPayrollRun() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (payrollRunId: string) => {
      if (!institution?.id) throw new Error('No institution');
      
      // Get all staff with current salaries
      const { data: staffSalaries, error: salaryError } = await supabase
        .from('staff_salaries')
        .select(`
          *,
          staff:staff_id (
            id,
            first_name,
            last_name,
            employee_number,
            is_active,
            deleted_at
          )
        `)
        .eq('institution_id', institution.id)
        .eq('is_current', true);
      
      if (salaryError) throw salaryError;
      
      // Filter to only active, non-deleted staff
      const activeStaffSalaries = staffSalaries?.filter(
        (s: any) => s.staff?.is_active !== false && !s.staff?.deleted_at
      ) || [];
      
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      
      // Process each staff member
      for (const staffSalary of activeStaffSalaries) {
        const basicSalary = Number(staffSalary.basic_salary);
        
        // Get staff allowances
        const { data: allowances } = await supabase
          .from('staff_allowances')
          .select('*, allowance_type:allowance_type_id (*)')
          .eq('staff_id', staffSalary.staff_id)
          .eq('is_active', true);
        
        // Get staff deductions
        const { data: deductions } = await supabase
          .from('staff_deductions')
          .select('*, deduction_type:deduction_type_id (*)')
          .eq('staff_id', staffSalary.staff_id)
          .eq('is_active', true);
        
        // Calculate totals
        let staffTotalAllowances = 0;
        let staffTotalDeductions = 0;
        
        const payslipItems: { item_type: 'allowance' | 'deduction'; type_id: string; name: string; amount: number }[] = [];
        
        for (const allowance of allowances || []) {
          const amount = allowance.calculation_type === 'percentage'
            ? (basicSalary * Number(allowance.amount)) / 100
            : Number(allowance.amount);
          staffTotalAllowances += amount;
          payslipItems.push({
            item_type: 'allowance',
            type_id: allowance.allowance_type_id,
            name: allowance.allowance_type?.name || 'Allowance',
            amount,
          });
        }
        
        for (const deduction of deductions || []) {
          const amount = deduction.calculation_type === 'percentage'
            ? (basicSalary * Number(deduction.amount)) / 100
            : Number(deduction.amount);
          staffTotalDeductions += amount;
          payslipItems.push({
            item_type: 'deduction',
            type_id: deduction.deduction_type_id,
            name: deduction.deduction_type?.name || 'Deduction',
            amount,
          });
        }
        
        const grossSalary = basicSalary + staffTotalAllowances;
        const netSalary = grossSalary - staffTotalDeductions;
        
        totalGross += grossSalary;
        totalDeductions += staffTotalDeductions;
        totalNet += netSalary;
        
        // Create payslip
        const { data: payslip, error: payslipError } = await supabase
          .from('payslips')
          .insert({
            payroll_run_id: payrollRunId,
            staff_id: staffSalary.staff_id,
            institution_id: institution.id,
            basic_salary: basicSalary,
            total_allowances: staffTotalAllowances,
            gross_salary: grossSalary,
            total_deductions: staffTotalDeductions,
            net_salary: netSalary,
            status: 'generated',
          })
          .select()
          .single();
        
        if (payslipError) throw payslipError;
        
        // Create payslip items
        if (payslipItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('payslip_items')
            .insert(payslipItems.map(item => ({
              ...item,
              payslip_id: payslip.id,
            })));
          
          if (itemsError) throw itemsError;
        }
      }
      
      // Update payroll run with totals
      const { error: updateError } = await supabase
        .from('payroll_runs')
        .update({
          status: 'completed',
          total_staff: activeStaffSalaries.length,
          total_gross: totalGross,
          total_deductions: totalDeductions,
          total_net: totalNet,
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .eq('id', payrollRunId);
      
      if (updateError) throw updateError;
      
      return { totalStaff: activeStaffSalaries.length, totalNet };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      toast.success(`Payroll processed for ${result.totalStaff} staff members`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Payslips Hooks
export function usePayslips(payrollRunId?: string) {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['payslips', institution?.id, payrollRunId],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      let query = supabase
        .from('payslips')
        .select(`
          *,
          staff:staff_id (
            id,
            first_name,
            last_name,
            employee_number,
            department
          ),
          payroll_run:payroll_run_id (*)
        `)
        .eq('institution_id', institution.id);
      
      if (payrollRunId) {
        query = query.eq('payroll_run_id', payrollRunId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Payslip[];
    },
    enabled: !!institution?.id,
  });
}

export function usePayslipItems(payslipId: string) {
  return useQuery({
    queryKey: ['payslip-items', payslipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payslip_items')
        .select('*')
        .eq('payslip_id', payslipId)
        .order('item_type')
        .order('name');
      
      if (error) throw error;
      return data as PayslipItem[];
    },
    enabled: !!payslipId,
  });
}

// Dashboard Stats Hook
export function usePayrollDashboard() {
  const { institution } = useInstitution();
  
  return useQuery({
    queryKey: ['payroll-dashboard', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return null;
      
      // Get staff with salaries
      const { data: salaries } = await supabase
        .from('staff_salaries')
        .select('basic_salary, staff:staff_id (is_active, deleted_at)')
        .eq('institution_id', institution.id)
        .eq('is_current', true);
      
      const activeSalaries = salaries?.filter(
        (s: any) => s.staff?.is_active !== false && !s.staff?.deleted_at
      ) || [];
      
      // Get latest completed payroll run
      const { data: latestRun } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('institution_id', institution.id)
        .eq('status', 'completed')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      // Get payroll settings
      const { data: settings } = await supabase
        .from('payroll_settings')
        .select('*')
        .eq('institution_id', institution.id)
        .maybeSingle();
      
      // Calculate projected totals
      let projectedGross = 0;
      for (const salary of activeSalaries) {
        projectedGross += Number(salary.basic_salary);
      }
      
      return {
        staffOnPayroll: activeSalaries.length,
        projectedGross,
        latestRun: latestRun as PayrollRun | null,
        settings: settings as PayrollSettings | null,
      };
    },
    enabled: !!institution?.id,
  });
}
