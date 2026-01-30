-- =============================================
-- SCHOOL TRANSPORT MANAGEMENT MODULE
-- =============================================

-- 1. Transport Zones (Geographic zones with pricing tiers)
CREATE TABLE public.transport_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  base_fee numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'KES',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(institution_id, code)
);

-- 2. Transport Routes (Bus/vehicle routes)
CREATE TABLE public.transport_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.transport_zones(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  route_type text DEFAULT 'both' CHECK (route_type IN ('pickup', 'dropoff', 'both')),
  estimated_duration_minutes integer,
  distance_km numeric,
  departure_time time,
  arrival_time time,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(institution_id, code)
);

-- 3. Transport Stops (Pickup/drop-off points along routes)
CREATE TABLE public.transport_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  route_id uuid NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
  name text NOT NULL,
  location_description text,
  latitude numeric,
  longitude numeric,
  stop_order integer NOT NULL,
  pickup_time time,
  dropoff_time time,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Transport Vehicles (Vehicle registry)
CREATE TABLE public.transport_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  registration_number text NOT NULL,
  vehicle_type text DEFAULT 'bus' CHECK (vehicle_type IN ('bus', 'van', 'minibus', 'car')),
  make text,
  model text,
  year integer,
  capacity integer NOT NULL,
  current_route_id uuid REFERENCES public.transport_routes(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  insurance_expiry date,
  inspection_expiry date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(institution_id, registration_number)
);

-- 5. Transport Drivers (Driver registry)
CREATE TABLE public.transport_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  license_number text,
  license_expiry date,
  current_vehicle_id uuid REFERENCES public.transport_vehicles(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
  photo_url text,
  emergency_contact text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Transport Subscriptions (Student transport subscriptions)
CREATE TABLE public.transport_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  route_id uuid REFERENCES public.transport_routes(id) ON DELETE SET NULL,
  stop_id uuid REFERENCES public.transport_stops(id) ON DELETE SET NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  subscription_type text DEFAULT 'both' CHECK (subscription_type IN ('pickup', 'dropoff', 'both')),
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled', 'ended')),
  suspended_reason text,
  suspended_at timestamptz,
  fee_amount numeric NOT NULL,
  currency text DEFAULT 'KES',
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  parent_requested boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Transport Fee Configs (Fee templates per zone/route)
CREATE TABLE public.transport_fee_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.transport_zones(id) ON DELETE SET NULL,
  route_id uuid REFERENCES public.transport_routes(id) ON DELETE SET NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  fee_type text DEFAULT 'term' CHECK (fee_type IN ('term', 'monthly', 'annual')),
  pickup_only_fee numeric,
  dropoff_only_fee numeric,
  both_ways_fee numeric NOT NULL,
  currency text DEFAULT 'KES',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Transport Policy Settings (Suspension and policy configuration)
CREATE TABLE public.transport_policy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  enable_auto_suspension boolean DEFAULT false,
  suspension_days_overdue integer DEFAULT 30,
  suspension_grace_period_days integer DEFAULT 7,
  require_approval_for_subscription boolean DEFAULT true,
  allow_parent_self_service boolean DEFAULT true,
  send_suspension_notice boolean DEFAULT true,
  notice_days_before_suspension integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(institution_id)
);

-- 9. Transport Subscription History (Audit trail)
CREATE TABLE public.transport_subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.transport_subscriptions(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid,
  change_reason text,
  created_at timestamptz DEFAULT now()
);

-- 10. Add transport_status to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS transport_status text DEFAULT 'none' 
  CHECK (transport_status IN ('none', 'subscribed', 'suspended', 'pending'));

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.transport_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_fee_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_policy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_subscription_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Transport Zones Policies
CREATE POLICY "Users can view zones for their institution" ON public.transport_zones
  FOR SELECT USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage zones" ON public.transport_zones
  FOR ALL USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'institution_admin', 'institution_owner')
    )
  );

-- Transport Routes Policies
CREATE POLICY "Users can view routes for their institution" ON public.transport_routes
  FOR SELECT USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage routes" ON public.transport_routes
  FOR ALL USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'institution_admin', 'institution_owner')
    )
  );

-- Transport Stops Policies
CREATE POLICY "Users can view stops for their institution" ON public.transport_stops
  FOR SELECT USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage stops" ON public.transport_stops
  FOR ALL USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'institution_admin', 'institution_owner')
    )
  );

-- Transport Vehicles Policies
CREATE POLICY "Users can view vehicles for their institution" ON public.transport_vehicles
  FOR SELECT USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage vehicles" ON public.transport_vehicles
  FOR ALL USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'institution_admin', 'institution_owner')
    )
  );

-- Transport Drivers Policies
CREATE POLICY "Users can view drivers for their institution" ON public.transport_drivers
  FOR SELECT USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage drivers" ON public.transport_drivers
  FOR ALL USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'institution_admin', 'institution_owner')
    )
  );

-- Transport Subscriptions Policies
CREATE POLICY "Users can view subscriptions for their institution" ON public.transport_subscriptions
  FOR SELECT USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children subscriptions" ON public.transport_subscriptions
  FOR SELECT USING (
    student_id IN (
      SELECT sp.student_id FROM public.student_parents sp
      JOIN public.parents p ON p.id = sp.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage subscriptions" ON public.transport_subscriptions
  FOR ALL USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'institution_admin', 'institution_owner')
    )
  );

-- Transport Fee Configs Policies
CREATE POLICY "Users can view fee configs for their institution" ON public.transport_fee_configs
  FOR SELECT USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage fee configs" ON public.transport_fee_configs
  FOR ALL USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'institution_admin', 'institution_owner', 'finance_officer')
    )
  );

-- Transport Policy Settings Policies
CREATE POLICY "Users can view policy settings for their institution" ON public.transport_policy_settings
  FOR SELECT USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage policy settings" ON public.transport_policy_settings
  FOR ALL USING (
    institution_id IN (
      SELECT ur.institution_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'institution_admin', 'institution_owner')
    )
  );

-- Transport Subscription History Policies
CREATE POLICY "Users can view subscription history for their institution" ON public.transport_subscription_history
  FOR SELECT USING (
    subscription_id IN (
      SELECT ts.id FROM public.transport_subscriptions ts
      WHERE ts.institution_id IN (
        SELECT ur.institution_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
      )
    )
  );

-- =============================================
-- AUDIT TRIGGER FOR SUBSCRIPTION CHANGES
-- =============================================

CREATE OR REPLACE FUNCTION public.log_transport_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.transport_subscription_history (
    subscription_id, 
    action, 
    old_values, 
    new_values, 
    changed_by
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_log_transport_subscription_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transport_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_transport_subscription_change();

-- =============================================
-- UPDATE STUDENT TRANSPORT STATUS TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.update_student_transport_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update student's transport_status based on subscription status
  UPDATE public.students
  SET transport_status = NEW.status
  WHERE id = NEW.student_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_student_transport_status
  AFTER INSERT OR UPDATE OF status ON public.transport_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_transport_status();

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================

CREATE TRIGGER update_transport_zones_updated_at
  BEFORE UPDATE ON public.transport_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_routes_updated_at
  BEFORE UPDATE ON public.transport_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_stops_updated_at
  BEFORE UPDATE ON public.transport_stops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_vehicles_updated_at
  BEFORE UPDATE ON public.transport_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_drivers_updated_at
  BEFORE UPDATE ON public.transport_drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_subscriptions_updated_at
  BEFORE UPDATE ON public.transport_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_fee_configs_updated_at
  BEFORE UPDATE ON public.transport_fee_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_policy_settings_updated_at
  BEFORE UPDATE ON public.transport_policy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();