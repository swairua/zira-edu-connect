-- Add columns to leave_requests for enhanced functionality
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS half_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS half_day_period VARCHAR(10) CHECK (half_day_period IN ('morning', 'afternoon')),
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS approver_id UUID REFERENCES staff(id),
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Create leave approval workflow configuration table
CREATE TABLE IF NOT EXISTS leave_approval_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  department VARCHAR(255),
  approver_order INTEGER DEFAULT 1,
  approver_role VARCHAR(50) NOT NULL,
  approver_staff_id UUID REFERENCES staff(id),
  auto_approve_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leave_approval_workflow ENABLE ROW LEVEL SECURITY;

-- RLS for leave_approval_workflow - institution admins and HR can manage
CREATE POLICY "Institution admins can manage approval workflows"
ON leave_approval_workflow FOR ALL
USING (
  public.is_super_admin(auth.uid()) OR
  public.is_institution_admin(auth.uid(), institution_id) OR
  public.has_institution_role(auth.uid(), 'hr_manager', institution_id)
);

-- Update leave_requests RLS - staff can view their own requests
CREATE POLICY "Staff can view their own leave requests"
ON leave_requests FOR SELECT
USING (
  staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
);

-- Staff can insert requests for themselves
CREATE POLICY "Staff can submit their own leave requests"
ON leave_requests FOR INSERT
WITH CHECK (
  staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
);

-- Staff can update (cancel) their own pending requests
CREATE POLICY "Staff can cancel their own pending requests"
ON leave_requests FOR UPDATE
USING (
  staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid()) 
  AND status = 'pending'
)
WITH CHECK (
  staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
  AND status IN ('pending', 'cancelled')
);

-- Approvers can update requests assigned to them
CREATE POLICY "Approvers can update assigned requests"
ON leave_requests FOR UPDATE
USING (
  approver_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_staff_id ON leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_approver_id ON leave_requests(approver_id);
CREATE INDEX IF NOT EXISTS idx_leave_approval_workflow_institution ON leave_approval_workflow(institution_id);