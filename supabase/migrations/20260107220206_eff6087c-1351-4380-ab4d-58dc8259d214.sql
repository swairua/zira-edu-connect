
-- =====================================================
-- HOSTEL & BOARDING MANAGEMENT MODULE
-- =====================================================

-- 1. Add boarding_status to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS boarding_status text DEFAULT 'day' 
  CHECK (boarding_status IN ('day', 'boarding', 'day_boarding'));

-- 2. Create hostels table
CREATE TABLE public.hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'mixed')),
  description text,
  location text,
  warden_staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  capacity integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(institution_id, code)
);

-- 3. Create hostel_rooms table
CREATE TABLE public.hostel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  floor text,
  room_type text DEFAULT 'standard' CHECK (room_type IN ('standard', 'prefect', 'sick_bay', 'special')),
  bed_capacity integer NOT NULL DEFAULT 4,
  amenities text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(hostel_id, room_number)
);

-- 4. Create hostel_beds table
CREATE TABLE public.hostel_beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES hostel_rooms(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  bed_number text NOT NULL,
  bed_type text DEFAULT 'standard' CHECK (bed_type IN ('standard', 'upper_bunk', 'lower_bunk')),
  status text DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(room_id, bed_number)
);

-- 5. Create bed_allocations table
CREATE TABLE public.bed_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  bed_id uuid NOT NULL REFERENCES hostel_beds(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id),
  term_id uuid REFERENCES terms(id),
  allocation_date date NOT NULL DEFAULT CURRENT_DATE,
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'ended', 'transferred', 'suspended')),
  allocated_by uuid NOT NULL,
  ended_by uuid,
  end_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Create boarding_fee_configs table
CREATE TABLE public.boarding_fee_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES hostels(id) ON DELETE SET NULL,
  room_type text,
  academic_year_id uuid REFERENCES academic_years(id),
  term_id uuid REFERENCES terms(id),
  fee_amount numeric NOT NULL,
  deposit_amount numeric DEFAULT 0,
  currency text DEFAULT 'KES',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Create boarding_charges table
CREATE TABLE public.boarding_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  allocation_id uuid REFERENCES bed_allocations(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  charge_type text NOT NULL CHECK (charge_type IN ('deposit', 'penalty', 'damage', 'extra_fee', 'refund')),
  description text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'KES',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'waived', 'refunded')),
  invoice_id uuid REFERENCES student_invoices(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Create bed_allocation_history table for audit
CREATE TABLE public.bed_allocation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id uuid REFERENCES bed_allocations(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid NOT NULL,
  change_reason text,
  requires_approval boolean DEFAULT false,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_hostels_institution ON hostels(institution_id);
CREATE INDEX idx_hostel_rooms_hostel ON hostel_rooms(hostel_id);
CREATE INDEX idx_hostel_beds_room ON hostel_beds(room_id);
CREATE INDEX idx_hostel_beds_status ON hostel_beds(status);
CREATE INDEX idx_bed_allocations_student ON bed_allocations(student_id, status);
CREATE INDEX idx_bed_allocations_bed ON bed_allocations(bed_id, status);
CREATE INDEX idx_bed_allocations_institution ON bed_allocations(institution_id, status);
CREATE INDEX idx_boarding_charges_student ON boarding_charges(student_id);
CREATE INDEX idx_boarding_charges_allocation ON boarding_charges(allocation_id);

-- Enable RLS on all tables
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_fee_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_allocation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hostels
CREATE POLICY "Users can view hostels in their institution" ON hostels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = hostels.institution_id
    )
  );

CREATE POLICY "Admins can manage hostels" ON hostels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = hostels.institution_id
      AND ur.role IN ('institution_admin', 'institution_owner', 'academic_director')
    )
  );

-- RLS Policies for hostel_rooms
CREATE POLICY "Users can view rooms in their institution" ON hostel_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = hostel_rooms.institution_id
    )
  );

CREATE POLICY "Admins can manage rooms" ON hostel_rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = hostel_rooms.institution_id
      AND ur.role IN ('institution_admin', 'institution_owner', 'academic_director')
    )
  );

-- RLS Policies for hostel_beds
CREATE POLICY "Users can view beds in their institution" ON hostel_beds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = hostel_beds.institution_id
    )
  );

CREATE POLICY "Admins can manage beds" ON hostel_beds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = hostel_beds.institution_id
      AND ur.role IN ('institution_admin', 'institution_owner', 'academic_director')
    )
  );

-- RLS Policies for bed_allocations
CREATE POLICY "Users can view allocations in their institution" ON bed_allocations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = bed_allocations.institution_id
    )
  );

CREATE POLICY "Wardens can manage allocations" ON bed_allocations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = bed_allocations.institution_id
      AND ur.role IN ('institution_admin', 'institution_owner', 'academic_director', 'teacher')
    )
  );

-- RLS Policies for boarding_fee_configs
CREATE POLICY "Users can view fee configs in their institution" ON boarding_fee_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = boarding_fee_configs.institution_id
    )
  );

CREATE POLICY "Admins can manage fee configs" ON boarding_fee_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = boarding_fee_configs.institution_id
      AND ur.role IN ('institution_admin', 'institution_owner', 'finance_officer', 'accountant')
    )
  );

-- RLS Policies for boarding_charges
CREATE POLICY "Users can view charges in their institution" ON boarding_charges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = boarding_charges.institution_id
    )
  );

CREATE POLICY "Staff can manage charges" ON boarding_charges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.institution_id = boarding_charges.institution_id
      AND ur.role IN ('institution_admin', 'institution_owner', 'academic_director', 'finance_officer', 'accountant')
    )
  );

-- RLS Policies for bed_allocation_history
CREATE POLICY "Users can view allocation history in their institution" ON bed_allocation_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bed_allocations ba
      JOIN user_roles ur ON ur.institution_id = ba.institution_id
      WHERE ba.id = bed_allocation_history.allocation_id
      AND ur.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert allocation history" ON bed_allocation_history
  FOR INSERT WITH CHECK (true);

-- Trigger to update hostel capacity when rooms change
CREATE OR REPLACE FUNCTION update_hostel_capacity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hostels 
  SET capacity = (
    SELECT COALESCE(SUM(bed_capacity), 0) 
    FROM hostel_rooms 
    WHERE hostel_id = COALESCE(NEW.hostel_id, OLD.hostel_id) 
    AND is_active = true
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.hostel_id, OLD.hostel_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_hostel_capacity
  AFTER INSERT OR UPDATE OR DELETE ON hostel_rooms
  FOR EACH ROW EXECUTE FUNCTION update_hostel_capacity();

-- Trigger to update bed status when allocation changes
CREATE OR REPLACE FUNCTION update_bed_status_on_allocation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hostel_beds SET status = 'occupied', updated_at = now() WHERE id = NEW.bed_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('ended', 'transferred') AND OLD.status = 'active' THEN
    UPDATE hostel_beds SET status = 'available', updated_at = now() WHERE id = OLD.bed_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hostel_beds SET status = 'available', updated_at = now() WHERE id = OLD.bed_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_bed_status
  AFTER INSERT OR UPDATE OR DELETE ON bed_allocations
  FOR EACH ROW EXECUTE FUNCTION update_bed_status_on_allocation();

-- Trigger to log allocation changes for audit
CREATE OR REPLACE FUNCTION log_allocation_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bed_allocation_history (
    allocation_id, 
    action, 
    old_values, 
    new_values, 
    changed_by,
    requires_approval
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    CASE WHEN TG_OP = 'UPDATE' AND OLD.created_at < now() - INTERVAL '24 hours' 
         THEN true ELSE false END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_allocation_change
  AFTER INSERT OR UPDATE OR DELETE ON bed_allocations
  FOR EACH ROW EXECUTE FUNCTION log_allocation_change();

-- Trigger to update student boarding status when allocated
CREATE OR REPLACE FUNCTION update_student_boarding_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE students SET boarding_status = 'boarding', updated_at = now() WHERE id = NEW.student_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('ended', 'transferred') AND OLD.status = 'active' THEN
    -- Check if student has any other active allocations
    IF NOT EXISTS (
      SELECT 1 FROM bed_allocations 
      WHERE student_id = NEW.student_id 
      AND status = 'active' 
      AND id != NEW.id
    ) THEN
      UPDATE students SET boarding_status = 'day', updated_at = now() WHERE id = NEW.student_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_student_boarding_status
  AFTER INSERT OR UPDATE ON bed_allocations
  FOR EACH ROW EXECUTE FUNCTION update_student_boarding_status();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE bed_allocations;
ALTER PUBLICATION supabase_realtime ADD TABLE boarding_charges;
