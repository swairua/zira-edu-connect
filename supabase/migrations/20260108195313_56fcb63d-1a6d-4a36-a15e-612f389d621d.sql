-- Drop existing "ALL" policies and create separate INSERT/UPDATE/DELETE policies with correct action

-- staff_salaries
DROP POLICY IF EXISTS "Users with HR permission can manage staff salaries" ON public.staff_salaries;

CREATE POLICY "Users with HR permission can insert staff salaries" ON public.staff_salaries
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can update staff salaries" ON public.staff_salaries
  FOR UPDATE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can delete staff salaries" ON public.staff_salaries
  FOR DELETE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'delete', institution_id)
  );

-- payroll_settings
DROP POLICY IF EXISTS "Users with HR permission can manage payroll settings" ON public.payroll_settings;

CREATE POLICY "Users with HR permission can insert payroll settings" ON public.payroll_settings
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can update payroll settings" ON public.payroll_settings
  FOR UPDATE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

-- salary_structures
DROP POLICY IF EXISTS "Users with HR permission can manage salary structures" ON public.salary_structures;

CREATE POLICY "Users with HR permission can insert salary structures" ON public.salary_structures
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can update salary structures" ON public.salary_structures
  FOR UPDATE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can delete salary structures" ON public.salary_structures
  FOR DELETE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'delete', institution_id)
  );

-- allowance_types
DROP POLICY IF EXISTS "Users with HR permission can manage allowance types" ON public.allowance_types;

CREATE POLICY "Users with HR permission can insert allowance types" ON public.allowance_types
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can update allowance types" ON public.allowance_types
  FOR UPDATE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can delete allowance types" ON public.allowance_types
  FOR DELETE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'delete', institution_id)
  );

-- deduction_types
DROP POLICY IF EXISTS "Users with HR permission can manage deduction types" ON public.deduction_types;

CREATE POLICY "Users with HR permission can insert deduction types" ON public.deduction_types
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can update deduction types" ON public.deduction_types
  FOR UPDATE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can delete deduction types" ON public.deduction_types
  FOR DELETE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'delete', institution_id)
  );

-- staff_allowances
DROP POLICY IF EXISTS "Users with HR permission can manage staff allowances" ON public.staff_allowances;

CREATE POLICY "Users with HR permission can insert staff allowances" ON public.staff_allowances
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can update staff allowances" ON public.staff_allowances
  FOR UPDATE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can delete staff allowances" ON public.staff_allowances
  FOR DELETE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'delete', institution_id)
  );

-- staff_deductions
DROP POLICY IF EXISTS "Users with HR permission can manage staff deductions" ON public.staff_deductions;

CREATE POLICY "Users with HR permission can insert staff deductions" ON public.staff_deductions
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can update staff deductions" ON public.staff_deductions
  FOR UPDATE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can delete staff deductions" ON public.staff_deductions
  FOR DELETE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'delete', institution_id)
  );

-- payroll_runs
DROP POLICY IF EXISTS "Users with HR permission can manage payroll runs" ON public.payroll_runs;

CREATE POLICY "Users with HR permission can insert payroll runs" ON public.payroll_runs
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can update payroll runs" ON public.payroll_runs
  FOR UPDATE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can delete payroll runs" ON public.payroll_runs
  FOR DELETE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'delete', institution_id)
  );

-- payslips
DROP POLICY IF EXISTS "Users with HR permission can manage payslips" ON public.payslips;

CREATE POLICY "Users with HR permission can insert payslips" ON public.payslips
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

CREATE POLICY "Users with HR permission can update payslips" ON public.payslips
  FOR UPDATE USING (
    public.is_super_admin(auth.uid()) OR 
    public.has_permission(auth.uid(), 'staff_hr', 'edit', institution_id)
  );

-- payslip_items
DROP POLICY IF EXISTS "Users with HR permission can manage payslip items" ON public.payslip_items;

CREATE POLICY "Users with HR permission can insert payslip items" ON public.payslip_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.payslips p
      WHERE p.id = payslip_id
      AND (public.is_super_admin(auth.uid()) OR public.has_permission(auth.uid(), 'staff_hr', 'edit', p.institution_id))
    )
  );

CREATE POLICY "Users with HR permission can update payslip items" ON public.payslip_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.payslips p
      WHERE p.id = payslip_id
      AND (public.is_super_admin(auth.uid()) OR public.has_permission(auth.uid(), 'staff_hr', 'edit', p.institution_id))
    )
  );