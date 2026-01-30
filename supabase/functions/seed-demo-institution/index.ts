import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to serialize Postgres/Supabase errors properly
function serializeError(error: unknown): { message: string; code?: string; details?: string } {
  if (error instanceof Error) {
    return { message: error.message };
  }
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    return {
      message: String(e.message || e.error || 'Database error'),
      code: e.code ? String(e.code) : undefined,
      details: e.details ? String(e.details) : undefined,
    };
  }
  return { message: String(error) };
}

// Kenyan names for realistic data
const FIRST_NAMES_MALE = [
  'James', 'Peter', 'John', 'David', 'Michael', 'Joseph', 'Daniel', 'Brian', 'Kevin', 'Samuel',
  'Dennis', 'Stephen', 'Patrick', 'Robert', 'George', 'Francis', 'Paul', 'Martin', 'Eric', 'Victor',
  'Collins', 'Felix', 'Moses', 'Isaac', 'Emmanuel', 'Timothy', 'Andrew', 'Benjamin', 'Edwin', 'Caleb'
];

const FIRST_NAMES_FEMALE = [
  'Mary', 'Grace', 'Faith', 'Joy', 'Elizabeth', 'Sarah', 'Ann', 'Esther', 'Ruth', 'Mercy',
  'Lucy', 'Jane', 'Alice', 'Nancy', 'Caroline', 'Beatrice', 'Catherine', 'Christine', 'Diana', 'Florence',
  'Gloria', 'Hannah', 'Irene', 'Jacqueline', 'Karen', 'Lilian', 'Margaret', 'Naomi', 'Pauline', 'Rachel'
];

const LAST_NAMES = [
  'Kamau', 'Ochieng', 'Wanjiku', 'Mwangi', 'Otieno', 'Njoroge', 'Kiprop', 'Chebet', 'Wafula', 'Mutua',
  'Kimani', 'Omondi', 'Kariuki', 'Rotich', 'Juma', 'Okello', 'Nyambura', 'Korir', 'Makori', 'Ndungu',
  'Achieng', 'Kiptoo', 'Wambui', 'Kosgei', 'Nyaga', 'Onyango', 'Gathoni', 'Langat', 'Mutiso', 'Gitau'
];

const SUBJECTS = [
  { name: 'Mathematics', code: 'MATH' },
  { name: 'English', code: 'ENG' },
  { name: 'Kiswahili', code: 'KIS' },
  { name: 'Science', code: 'SCI' },
  { name: 'Social Studies', code: 'SST' },
  { name: 'CRE', code: 'CRE' },
  { name: 'Creative Arts', code: 'ART' },
  { name: 'Physical Education', code: 'PE' },
];

const CLASS_LEVELS = [
  { level: 'Grade 1', name: 'Grade 1' },
  { level: 'Grade 2', name: 'Grade 2' },
  { level: 'Grade 3', name: 'Grade 3' },
  { level: 'Grade 4', name: 'Grade 4' },
  { level: 'Grade 5', name: 'Grade 5' },
  { level: 'Grade 6', name: 'Grade 6' },
  { level: 'Grade 7', name: 'Grade 7' },
  { level: 'Grade 8', name: 'Grade 8' },
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(): string {
  const prefixes = ['0712', '0722', '0733', '0741', '0757', '0768', '0790', '0111', '0100'];
  return randomElement(prefixes) + Math.floor(100000 + Math.random() * 900000).toString();
}

function generateAdmissionNumber(year: number, index: number): string {
  return `${year}/${String(index).padStart(3, '0')}`;
}

const DEMO_EMAIL = 'demo@zira.tech';
const DEMO_PASSWORD = 'DemoAccess2024!';
const DEMO_TEACHER_EMAIL = 'teacher.demo@zira.tech';
const DEMO_TEACHER_PASSWORD = 'DemoTeacher2024!';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, resetExisting } = await req.json().catch(() => ({}));

    // Step 0: Create or get demo user account (CRITICAL for auto-login)
    let demoUserId: string | null = null;
    
    // First, check if demo user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingDemoUser = existingUsers?.users?.find(u => u.email === DEMO_EMAIL);
    
    if (existingDemoUser) {
      demoUserId = existingDemoUser.id;
      console.log('Demo user already exists:', demoUserId);
    } else {
      // Create the demo user
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          first_name: 'Demo',
          last_name: 'Admin',
        },
      });
      
      if (authError) {
        console.error('Error creating demo user:', authError);
        throw authError;
      }
      
      demoUserId = newAuthUser.user.id;
      console.log('Created demo user:', demoUserId);
    }

    // Step 1: Get or create demo institution
    let { data: demoInstitution } = await supabase
      .from('institutions')
      .select('*')
      .eq('is_demo', true)
      .single();

    // Handle reset action
    if (resetExisting && demoInstitution) {
      console.log('Resetting demo data for institution:', demoInstitution.id);
      const institutionId = demoInstitution.id;
      
      // Delete in dependency order
      await supabase.from('journal_entry_lines').delete().eq('institution_id', institutionId);
      await supabase.from('journal_entries').delete().eq('institution_id', institutionId);
      await supabase.from('cashbook_entries').delete().eq('institution_id', institutionId);
      await supabase.from('payment_voucher_items').delete().eq('institution_id', institutionId);
      await supabase.from('payment_vouchers').delete().eq('institution_id', institutionId);
      // Delete payment_allocations before invoices
      const { data: demoInvoices } = await supabase
        .from('student_invoices')
        .select('id')
        .eq('institution_id', institutionId);
      if (demoInvoices && demoInvoices.length > 0) {
        const invoiceIds = demoInvoices.map(inv => inv.id);
        await supabase.from('payment_allocations').delete().in('invoice_id', invoiceIds);
      }
      await supabase.from('timetable_entries').delete().eq('institution_id', institutionId);
      await supabase.from('timetables').delete().eq('institution_id', institutionId);
      await supabase.from('student_scores').delete().eq('institution_id', institutionId);
      await supabase.from('exams').delete().eq('institution_id', institutionId);
      await supabase.from('attendance').delete().eq('institution_id', institutionId);
      await supabase.from('student_payments').delete().eq('institution_id', institutionId);
      await supabase.from('fee_payments').delete().eq('institution_id', institutionId);
      await supabase.from('student_fee_accounts').delete().eq('institution_id', institutionId);
      await supabase.from('invoice_items').delete().eq('institution_id', institutionId);
      await supabase.from('invoice_lines').delete().eq('institution_id', institutionId);
      await supabase.from('student_invoices').delete().eq('institution_id', institutionId);
      await supabase.from('fee_items').delete().eq('institution_id', institutionId);
      await supabase.from('student_parents').delete().eq('institution_id', institutionId);
      await supabase.from('parents').delete().eq('institution_id', institutionId);
      await supabase.from('class_subjects').delete().eq('institution_id', institutionId);
      await supabase.from('class_teachers').delete().eq('institution_id', institutionId);
      await supabase.from('students').delete().eq('institution_id', institutionId);
      await supabase.from('staff').delete().eq('institution_id', institutionId);
      await supabase.from('subjects').delete().eq('institution_id', institutionId);
      await supabase.from('classes').delete().eq('institution_id', institutionId);
      await supabase.from('time_slots').delete().eq('institution_id', institutionId);
      await supabase.from('chart_of_accounts').delete().eq('institution_id', institutionId);
      await supabase.from('voteheads').delete().eq('institution_id', institutionId);
      await supabase.from('bank_accounts').delete().eq('institution_id', institutionId);
      await supabase.from('funds').delete().eq('institution_id', institutionId);
      await supabase.from('terms').delete().eq('institution_id', institutionId);
      await supabase.from('academic_years').delete().eq('institution_id', institutionId);
      console.log('Demo data reset complete');
    }

    // Step 2: Create institution if it doesn't exist
    if (!demoInstitution) {
      const { data: newInstitution, error: instError } = await supabase
        .from('institutions')
        .insert({
          name: 'Demo Academy Kenya',
          code: 'DEMO-' + Date.now().toString(36).toUpperCase(),
          type: 'primary',
          address: '123 Education Lane, Nairobi',
          phone: '0720123456',
          email: 'demo@zira.tech',
          country: 'KE',
          county: 'Nairobi',
          is_demo: true,
          status: 'active',
          subscription_plan: 'professional',
          onboarding_status: 'completed',
          enabled_modules: ['students', 'staff', 'finance', 'academics', 'attendance', 'timetable', 'exams', 'reports'],
        })
        .select()
        .single();

      if (instError) throw instError;
      demoInstitution = newInstitution;
      console.log('Created new demo institution:', demoInstitution.id);
    } else if (demoInstitution.status !== 'active') {
      // Ensure existing demo institution is always active
      await supabase
        .from('institutions')
        .update({ status: 'active' })
        .eq('id', demoInstitution.id);
      console.log('Updated demo institution status to active');
    }

    const institutionId = demoInstitution.id;

    // Step 2b: Ensure demo user has profile and role linked to institution
    if (demoUserId) {
      // Upsert profile
      await supabase
        .from('profiles')
        .upsert({
          user_id: demoUserId,
          email: DEMO_EMAIL,
          first_name: 'Demo',
          last_name: 'Admin',
          institution_id: institutionId,
        }, { onConflict: 'user_id' });
      
      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', demoUserId)
        .eq('role', 'institution_admin')
        .eq('institution_id', institutionId)
        .single();
      
      if (!existingRole) {
        await supabase
          .from('user_roles')
          .insert({
            user_id: demoUserId,
            role: 'institution_admin',
            institution_id: institutionId,
          });
      }
      
      console.log('Demo user profile and role configured');
    }

    const currentYear = new Date().getFullYear();
    const academicYearName = `${currentYear} Academic Year`;

    // Step 3: Get or create Academic Year (IDEMPOTENT)
    let academicYear: { id: string } | null = null;
    
    const { data: existingAY } = await supabase
      .from('academic_years')
      .select('id')
      .eq('institution_id', institutionId)
      .eq('name', academicYearName)
      .single();

    if (existingAY) {
      academicYear = existingAY;
      console.log('Using existing academic year:', academicYear.id);
    } else {
      const { data: newAY, error: ayError } = await supabase
        .from('academic_years')
        .insert({
          institution_id: institutionId,
          name: academicYearName,
          start_date: `${currentYear}-01-08`,
          end_date: `${currentYear}-11-15`,
          is_current: true,
          status: 'active',
        })
        .select('id')
        .single();

      if (ayError) throw ayError;
      academicYear = newAY;
      console.log('Created academic year:', academicYear.id);
    }

    // Step 4: Get or create Terms (IDEMPOTENT via sequence_order)
    const termsData = [
      { name: 'Term 1', start_date: `${currentYear}-01-08`, end_date: `${currentYear}-04-05`, is_current: true, sequence_order: 1 },
      { name: 'Term 2', start_date: `${currentYear}-05-06`, end_date: `${currentYear}-08-02`, is_current: false, sequence_order: 2 },
      { name: 'Term 3', start_date: `${currentYear}-09-02`, end_date: `${currentYear}-11-15`, is_current: false, sequence_order: 3 },
    ];

    const terms: { id: string; name: string }[] = [];
    for (const termData of termsData) {
      const { data: existingTerm } = await supabase
        .from('terms')
        .select('id, name')
        .eq('academic_year_id', academicYear.id)
        .eq('sequence_order', termData.sequence_order)
        .single();

      if (existingTerm) {
        terms.push(existingTerm);
      } else {
        const { data: newTerm, error: termError } = await supabase
          .from('terms')
          .insert({ ...termData, institution_id: institutionId, academic_year_id: academicYear.id })
          .select('id, name')
          .single();

        if (termError) throw termError;
        terms.push(newTerm!);
      }
    }
    const currentTerm = terms[0];
    console.log('Terms ready:', terms.length);

    // Step 5: Get or create Time Slots (IDEMPOTENT)
    const { data: existingSlots } = await supabase
      .from('time_slots')
      .select('id, slot_type, sequence_order')
      .eq('institution_id', institutionId);

    let timeSlots = existingSlots || [];
    if (timeSlots.length === 0) {
      const timeSlotsData = [
        { sequence_order: 1, start_time: '08:00', end_time: '08:40', name: 'Period 1', slot_type: 'lesson' },
        { sequence_order: 2, start_time: '08:40', end_time: '09:20', name: 'Period 2', slot_type: 'lesson' },
        { sequence_order: 3, start_time: '09:20', end_time: '09:40', name: 'Break', slot_type: 'break' },
        { sequence_order: 4, start_time: '09:40', end_time: '10:20', name: 'Period 3', slot_type: 'lesson' },
        { sequence_order: 5, start_time: '10:20', end_time: '11:00', name: 'Period 4', slot_type: 'lesson' },
        { sequence_order: 6, start_time: '11:00', end_time: '11:40', name: 'Period 5', slot_type: 'lesson' },
        { sequence_order: 7, start_time: '11:40', end_time: '12:20', name: 'Period 6', slot_type: 'lesson' },
        { sequence_order: 8, start_time: '12:20', end_time: '13:00', name: 'Lunch', slot_type: 'break' },
        { sequence_order: 9, start_time: '13:00', end_time: '13:40', name: 'Period 7', slot_type: 'lesson' },
        { sequence_order: 10, start_time: '13:40', end_time: '14:20', name: 'Period 8', slot_type: 'lesson' },
      ];

      const { data: newSlots, error: tsError } = await supabase
        .from('time_slots')
        .insert(timeSlotsData.map(ts => ({
          ...ts,
          institution_id: institutionId,
          is_active: true,
          applies_to: 'all',
        })))
        .select('id, slot_type, sequence_order');

      if (tsError) throw tsError;
      timeSlots = newSlots || [];
      console.log('Created time slots:', timeSlots.length);
    }

    // Step 6: Get or create Subjects (IDEMPOTENT via code)
    const subjects: { id: string; name: string; code: string }[] = [];
    for (const subj of SUBJECTS) {
      const { data: existingSubj } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('institution_id', institutionId)
        .eq('code', subj.code)
        .single();

      if (existingSubj) {
        subjects.push(existingSubj);
      } else {
        const { data: newSubj, error: subjError } = await supabase
          .from('subjects')
          .insert({ institution_id: institutionId, name: subj.name, code: subj.code, is_active: true })
          .select('id, name, code')
          .single();

        if (subjError) throw subjError;
        subjects.push(newSubj!);
      }
    }
    console.log('Subjects ready:', subjects.length);

    // Step 7: Get or create Classes (IDEMPOTENT via level)
    const { data: existingClasses } = await supabase
      .from('classes')
      .select('id, name, level')
      .eq('institution_id', institutionId);

    let classes = existingClasses || [];
    if (classes.length === 0) {
      const { data: newClasses, error: classError } = await supabase
        .from('classes')
        .insert(CLASS_LEVELS.map(c => ({
          institution_id: institutionId,
          academic_year_id: academicYear.id,
          name: c.name,
          level: c.level,
          capacity: 35,
          is_active: true,
        })))
        .select('id, name, level');

      if (classError) throw classError;
      classes = newClasses || [];
      console.log('Created classes:', classes.length);
    }

    // Step 8: Get or create Staff (IDEMPOTENT)
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id, first_name, last_name, department, designation')
      .eq('institution_id', institutionId);

    let staff = existingStaff || [];
    if (staff.length === 0) {
      const staffData = [
        { first_name: 'Peter', last_name: 'Kamau', designation: 'Headteacher', department: 'Academic' },
        { first_name: 'Grace', last_name: 'Otieno', designation: 'Deputy Headteacher', department: 'Academic' },
        { first_name: 'James', last_name: 'Kiprop', designation: 'Academic Director', department: 'Academic' },
        { first_name: 'Mary', last_name: 'Wanjiku', designation: 'Class Teacher', department: 'Academic' },
        { first_name: 'John', last_name: 'Ochieng', designation: 'Class Teacher', department: 'Academic' },
        { first_name: 'Sarah', last_name: 'Njoroge', designation: 'Class Teacher', department: 'Academic' },
        { first_name: 'David', last_name: 'Mwangi', designation: 'Class Teacher', department: 'Academic' },
        { first_name: 'Faith', last_name: 'Chebet', designation: 'Class Teacher', department: 'Academic' },
        { first_name: 'Joseph', last_name: 'Rotich', designation: 'Subject Teacher', department: 'Academic' },
        { first_name: 'Elizabeth', last_name: 'Juma', designation: 'Subject Teacher', department: 'Academic' },
        { first_name: 'Daniel', last_name: 'Okello', designation: 'Subject Teacher', department: 'Academic' },
        { first_name: 'Ann', last_name: 'Kariuki', designation: 'Subject Teacher', department: 'Academic' },
        { first_name: 'Michael', last_name: 'Korir', designation: 'Finance Officer', department: 'Finance' },
        { first_name: 'Caroline', last_name: 'Mutua', designation: 'Admin Assistant', department: 'Administration' },
        { first_name: 'Patrick', last_name: 'Nyaga', designation: 'ICT Administrator', department: 'ICT' },
      ];

      const { data: newStaff, error: staffError } = await supabase
        .from('staff')
        .insert(
          staffData.map((s, i) => ({
            institution_id: institutionId,
            employee_number: `EMP${String(i + 1).padStart(4, '0')}`,
            first_name: s.first_name,
            last_name: s.last_name,
            email: `${s.first_name.toLowerCase()}.${s.last_name.toLowerCase()}@demo.zira.tech`,
            phone: generatePhone(),
            department: s.department,
            designation: s.designation,
            employment_type: 'permanent',
            date_joined: `${currentYear - 2}-01-15`,
            is_active: true,
          }))
        )
        .select('id, first_name, last_name, department, designation');

      if (staffError) throw staffError;
      staff = newStaff || [];
      console.log('Created staff:', staff.length);
    }

    const teacherStaff = staff.filter((s) => s.department === 'Academic');

    // Step 9: Assign class teachers (IDEMPOTENT)
    const { data: existingCT } = await supabase
      .from('class_teachers')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingCT || existingCT.length === 0) {
      for (let i = 0; i < classes.length && i < teacherStaff.length; i++) {
        await supabase.from('classes').update({ class_teacher_id: teacherStaff[i].id }).eq('id', classes[i].id);
        await supabase.from('class_teachers').insert({
          institution_id: institutionId,
          class_id: classes[i].id,
          staff_id: teacherStaff[i].id,
          is_class_teacher: true,
        });
      }
      console.log('Assigned class teachers');
    }

    // Step 9b: Create demo teacher auth account and link to first class teacher (IDEMPOTENT)
    const existingDemoTeacher = existingUsers?.users?.find(u => u.email === DEMO_TEACHER_EMAIL);
    let demoTeacherUserId: string | null = null;
    
    // Get the first class teacher (e.g., Mary Wanjiku)
    const firstClassTeacher = teacherStaff.find((s) => s.designation === 'Class Teacher') || teacherStaff[0];
    
    if (firstClassTeacher) {
      if (existingDemoTeacher) {
        demoTeacherUserId = existingDemoTeacher.id;
        console.log('Demo teacher already exists:', demoTeacherUserId);
      } else {
        // Create demo teacher auth account
        const { data: newTeacherAuth, error: teacherAuthError } = await supabase.auth.admin.createUser({
          email: DEMO_TEACHER_EMAIL,
          password: DEMO_TEACHER_PASSWORD,
          email_confirm: true,
          user_metadata: {
            first_name: firstClassTeacher.first_name,
            last_name: firstClassTeacher.last_name,
          },
        });
        
        if (teacherAuthError) {
          console.error('Error creating demo teacher:', teacherAuthError);
        } else {
          demoTeacherUserId = newTeacherAuth.user.id;
          console.log('Created demo teacher:', demoTeacherUserId);
        }
      }
      
      // Link teacher auth account to staff record
      if (demoTeacherUserId) {
        // First, clear any existing links to this user to prevent duplicates
        await supabase
          .from('staff')
          .update({ user_id: null })
          .eq('user_id', demoTeacherUserId);
        
        // Then link only the designated first class teacher
        await supabase
          .from('staff')
          .update({ user_id: demoTeacherUserId })
          .eq('id', firstClassTeacher.id);
        
        // Upsert profile
        await supabase
          .from('profiles')
          .upsert({
            user_id: demoTeacherUserId,
            email: DEMO_TEACHER_EMAIL,
            first_name: firstClassTeacher.first_name,
            last_name: firstClassTeacher.last_name,
            institution_id: institutionId,
          }, { onConflict: 'user_id' });
        
        // Check if teacher role already exists
        const { data: existingTeacherRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', demoTeacherUserId)
          .eq('role', 'teacher')
          .eq('institution_id', institutionId)
          .single();
        
        if (!existingTeacherRole) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: demoTeacherUserId,
              role: 'teacher',
              institution_id: institutionId,
            });
        }
        
        console.log('Demo teacher linked to staff record:', firstClassTeacher.first_name, firstClassTeacher.last_name);
      }
    }

    // Step 10: Get or create Students (IDEMPOTENT)
    const { data: existingStudents } = await supabase
      .from('students')
      .select('id, first_name, last_name, class_id, gender')
      .eq('institution_id', institutionId);

    let students = existingStudents || [];
    if (students.length === 0) {
      const studentsData = [];
      let studentIndex = 1;
      
      for (const cls of classes) {
        const studentsPerClass = Math.floor(Math.random() * 4) + 17;
        for (let i = 0; i < studentsPerClass; i++) {
          const isMale = Math.random() > 0.5;
          const firstName = randomElement(isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
          const lastName = randomElement(LAST_NAMES);
          
          studentsData.push({
            institution_id: institutionId,
            class_id: cls.id,
            first_name: firstName,
            last_name: lastName,
            admission_number: generateAdmissionNumber(currentYear, studentIndex),
            date_of_birth: `${currentYear - 6 - classes.indexOf(cls)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            gender: isMale ? 'male' : 'female',
            status: 'active',
            admission_date: `${currentYear}-01-08`,
          });
          studentIndex++;
        }
      }

      const { data: newStudents, error: studentsError } = await supabase
        .from('students')
        .insert(studentsData)
        .select('id, first_name, last_name, class_id, gender');

      if (studentsError) throw studentsError;
      students = newStudents || [];
      console.log('Created students:', students.length);

      // Set showcase flag on first student for demo access
      if (students.length > 0) {
        await supabase
          .from('students')
          .update({ is_demo_showcase: true })
          .eq('id', students[0].id);
        console.log('Set showcase flag on first student:', students[0].first_name, students[0].last_name);
      }
    }

    // Step 11: Get or create Parents (IDEMPOTENT)
    const { data: existingParents } = await supabase
      .from('parents')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingParents || existingParents.length === 0) {
      const parentsData = students.map((student) => ({
        institution_id: institutionId,
        first_name: randomElement(student.gender === 'male' ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE),
        last_name: student.last_name,
        phone: generatePhone(),
        email: `parent.${student.last_name.toLowerCase()}${Math.floor(Math.random() * 100)}@demo.zira.tech`,
        relationship_type: student.gender === 'male' ? 'mother' : 'father',
        is_primary_contact: true,
      }));

      const { data: newParents, error: parentsError } = await supabase
        .from('parents')
        .insert(parentsData)
        .select('id');

      if (parentsError) throw parentsError;

      // Link parents to students
      const studentParentLinks = students.map((student, i) => ({
        institution_id: institutionId,
        student_id: student.id,
        parent_id: newParents![i].id,
        relationship: student.gender === 'male' ? 'mother' : 'father',
        is_primary: true,
      }));

      await supabase.from('student_parents').insert(studentParentLinks);
      console.log('Created parents:', newParents?.length || 0);

      // Set showcase flag on first parent for demo access
      if (newParents && newParents.length > 0) {
        await supabase
          .from('parents')
          .update({ is_demo_showcase: true })
          .eq('id', newParents[0].id);
        console.log('Set showcase flag on first parent');
      }
    }

    // Step 12: Get or create Fee Items (IDEMPOTENT)
    const { data: existingFees } = await supabase
      .from('fee_items')
      .select('id, name, amount, category')
      .eq('institution_id', institutionId);

    let feeItems = existingFees || [];
    if (feeItems.length === 0) {
      const feeItemsData = [
        { name: 'Tuition Fee', amount: 15000, category: 'tuition', is_mandatory: true },
        { name: 'Lunch Program', amount: 4500, category: 'meals', is_mandatory: false },
        { name: 'Transport Fee', amount: 3000, category: 'transport', is_mandatory: false },
        { name: 'Activity Fee', amount: 1500, category: 'activities', is_mandatory: false },
        { name: 'Exam Fee', amount: 500, category: 'exams', is_mandatory: true },
      ];

      const { data: newFeeItems, error: feeError } = await supabase
        .from('fee_items')
        .insert(feeItemsData.map(f => ({
          ...f,
          institution_id: institutionId,
          academic_year_id: academicYear.id,
          term_id: currentTerm.id,
          currency: 'KES',
          is_active: true,
        })))
        .select('id, name, amount, category');

      if (feeError) throw feeError;
      feeItems = newFeeItems || [];
      console.log('Created fee items:', feeItems.length);
    }

    // Helper functions for generating realistic transaction references
    const generateMpesaCode = (): string => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
      return 'R' + Array(9).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const generateBankRef = (): string => {
      return 'TRF' + Date.now().toString(36).toUpperCase().slice(-8) + Math.floor(Math.random() * 1000);
    };

    // Step 13: Get or create Student Fee Accounts with realistic distribution (IDEMPOTENT)
    const { data: existingFeeAccounts } = await supabase
      .from('student_fee_accounts')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingFeeAccounts || existingFeeAccounts.length === 0) {
      const totalFees = 24500; // Sum of all fee items
      
      // Create fee accounts with realistic aging distribution
      const feeAccountsData = students.map((student, index) => {
        // Distribute students into payment categories
        const category = index % 10; // 0-9 for distribution
        let totalPaid: number;
        let daysAgo: number;
        let status: string;
        
        if (category <= 2) {
          // 30% - Fully paid
          totalPaid = totalFees;
          daysAgo = Math.floor(Math.random() * 30);
          status = 'paid';
        } else if (category <= 5) {
          // 30% - Partial payment (50-90% paid), current
          totalPaid = Math.floor(totalFees * (0.5 + Math.random() * 0.4));
          daysAgo = Math.floor(Math.random() * 30);
          status = 'partial';
        } else if (category <= 7) {
          // 20% - Partial payment, 31-60 days
          totalPaid = Math.floor(totalFees * (0.3 + Math.random() * 0.3));
          daysAgo = 31 + Math.floor(Math.random() * 30);
          status = 'partial';
        } else if (category === 8) {
          // 10% - Minimal payment, 61-90 days
          totalPaid = Math.floor(totalFees * Math.random() * 0.2);
          daysAgo = 61 + Math.floor(Math.random() * 30);
          status = 'defaulter';
        } else {
          // 10% - Defaulters, 90+ days with no/minimal payment
          totalPaid = Math.floor(totalFees * Math.random() * 0.1);
          daysAgo = 90 + Math.floor(Math.random() * 30);
          status = 'defaulter';
        }
        
        const lastPaymentDate = new Date();
        lastPaymentDate.setDate(lastPaymentDate.getDate() - daysAgo);
        
        return {
          institution_id: institutionId,
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          class: classes.find(c => c.id === student.class_id)?.name || 'Unknown',
          total_fees: totalFees,
          total_paid: totalPaid,
          last_payment_date: totalPaid > 0 ? lastPaymentDate.toISOString() : null,
          status,
        };
      });

      const { error: feeAccountError } = await supabase.from('student_fee_accounts').insert(feeAccountsData);
      if (feeAccountError) console.error('Fee accounts error:', feeAccountError);
      console.log('Created fee accounts:', feeAccountsData.length);

      // Create fee_payments for students with payments (linked to fee accounts)
      const paymentMethods = ['mpesa', 'mpesa', 'mpesa', 'bank_transfer', 'bank_transfer', 'cash']; // 50% mpesa, 33% bank, 17% cash
      const feePaymentsData: any[] = [];
      let paymentCounter = 1;

      for (const account of feeAccountsData) {
        if (account.total_paid > 0) {
          // Split into 1-4 payments
          const numPayments = 1 + Math.floor(Math.random() * 3);
          let remainingPaid = account.total_paid;
          
          for (let i = 0; i < numPayments && remainingPaid > 0; i++) {
            const paymentAmount = i === numPayments - 1 
              ? remainingPaid 
              : Math.floor(remainingPaid * (0.25 + Math.random() * 0.4));
            remainingPaid -= paymentAmount;
            
            const paymentDate = new Date();
            const daysOffset = Math.floor(Math.random() * 60);
            paymentDate.setDate(paymentDate.getDate() - daysOffset);
            
            const method = randomElement(paymentMethods);
            const transactionRef = method === 'mpesa' 
              ? generateMpesaCode() 
              : method === 'bank_transfer' 
                ? generateBankRef() 
                : `CASH-${String(paymentCounter).padStart(5, '0')}`;
            
            feePaymentsData.push({
              institution_id: institutionId,
              student_id: account.student_id,
              amount: paymentAmount,
              currency: 'KES',
              payment_method: method,
              payment_date: paymentDate.toISOString().split('T')[0],
              transaction_reference: transactionRef,
              status: 'completed',
              notes: `Term 1 ${currentYear} fee payment`,
              recorded_by: demoUserId,
            });
            paymentCounter++;
          }
        }
      }

      if (feePaymentsData.length > 0) {
        const { error: feePaymentsError } = await supabase.from('fee_payments').insert(feePaymentsData);
        if (feePaymentsError) console.error('Fee payments error:', feePaymentsError);
        console.log('Created fee_payments:', feePaymentsData.length);
      }

      // Also create student_payments for backward compatibility
      const studentPaymentsData = feePaymentsData.map((fp, idx) => ({
        institution_id: fp.institution_id,
        student_id: fp.student_id,
        receipt_number: `RCP-${currentYear}${String(idx + 1).padStart(5, '0')}`,
        amount: fp.amount,
        currency: fp.currency,
        payment_method: fp.payment_method,
        payment_date: fp.payment_date,
        transaction_reference: fp.transaction_reference,
        status: fp.status,
        notes: fp.notes,
      }));

      if (studentPaymentsData.length > 0) {
        const { error: paymentsError } = await supabase.from('student_payments').insert(studentPaymentsData);
        if (paymentsError) console.error('Student payments error:', paymentsError);
        console.log('Created student_payments:', studentPaymentsData.length);
      }
    }

    // Step 14: Get or create Invoices with line items (IDEMPOTENT)
    const { data: existingInvoices } = await supabase
      .from('student_invoices')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingInvoices || existingInvoices.length === 0) {
      // First, get the fee accounts to match paid amounts
      const { data: feeAccounts } = await supabase
        .from('student_fee_accounts')
        .select('student_id, total_paid, status')
        .eq('institution_id', institutionId);

      const feeAccountMap = new Map(feeAccounts?.map(fa => [fa.student_id, fa]) || []);

      // Create invoices with proper status based on fee accounts
      const invoicesData = students.map(student => {
        const feeAccount = feeAccountMap.get(student.id);
        const paidAmount = feeAccount?.total_paid || 0;
        const totalAmount = 24500;
        
        let invoiceStatus: string;
        if (paidAmount >= totalAmount) {
          invoiceStatus = 'paid';
        } else if (paidAmount > 0) {
          invoiceStatus = 'partially_paid';
        } else {
          invoiceStatus = 'posted';
        }
        
        return {
          institution_id: institutionId,
          student_id: student.id,
          academic_year_id: academicYear.id,
          term_id: currentTerm.id,
          invoice_number: `INV-${currentYear}-${String(students.indexOf(student) + 1).padStart(4, '0')}`,
          total_amount: totalAmount,
          status: invoiceStatus,
          due_date: `${currentYear}-02-15`,
        };
      });

      const { data: newInvoices, error: invoiceError } = await supabase
        .from('student_invoices')
        .insert(invoicesData)
        .select('id, student_id');
      
      if (invoiceError) {
        console.error('Invoice error:', invoiceError);
      } else if (newInvoices && newInvoices.length > 0) {
        console.log('Created invoices:', newInvoices.length);

        // Create invoice_lines for each invoice
        const invoiceLines: any[] = [];
        
        for (const invoice of newInvoices) {
          // Add line items for each fee item
          for (const feeItem of feeItems) {
            invoiceLines.push({
              institution_id: institutionId,
              invoice_id: invoice.id,
              fee_item_id: feeItem.id,
              description: feeItem.name,
              quantity: 1,
              unit_price: feeItem.amount,
              total_price: feeItem.amount,
            });
          }
        }

        if (invoiceLines.length > 0) {
          // Insert in batches to avoid timeout
          const batchSize = 500;
          for (let i = 0; i < invoiceLines.length; i += batchSize) {
            const batch = invoiceLines.slice(i, i + batchSize);
            const { error: linesError } = await supabase.from('invoice_lines').insert(batch);
            if (linesError) console.error('Invoice lines batch error:', linesError);
          }
          console.log('Created invoice_lines:', invoiceLines.length);
        }

        // Step 14a: Create Payment Allocations (link payments to invoices)
        // Get existing payments for students with invoices
        const { data: studentPayments } = await supabase
          .from('student_payments')
          .select('id, student_id, amount')
          .eq('institution_id', institutionId)
          .eq('status', 'completed');

        if (studentPayments && studentPayments.length > 0 && newInvoices) {
          const invoiceMap = new Map(newInvoices.map((inv: any) => [inv.student_id, inv.id]));
          const allocationData: { payment_id: string; invoice_id: string; amount: number }[] = [];

          for (const payment of studentPayments) {
            const invoiceId = invoiceMap.get(payment.student_id);
            if (invoiceId) {
              allocationData.push({
                payment_id: payment.id,
                invoice_id: invoiceId,
                amount: payment.amount,
              });
            }
          }

          if (allocationData.length > 0) {
            const { error: allocError } = await supabase.from('payment_allocations').insert(allocationData);
            if (allocError) {
              console.error('Payment allocations error:', allocError);
            } else {
              console.log('Created payment allocations:', allocationData.length);
            }
          }

          // Step 14b: Update invoice statuses based on allocations
          // Group allocations by invoice and sum amounts
          const allocByInvoice = allocationData.reduce((acc, alloc) => {
            acc[alloc.invoice_id] = (acc[alloc.invoice_id] || 0) + alloc.amount;
            return acc;
          }, {} as Record<string, number>);

          for (const invoice of newInvoices) {
            const paidAmount = allocByInvoice[invoice.id] || 0;
            let newStatus = 'sent';
            if (paidAmount >= 24500) {
              newStatus = 'paid';
            } else if (paidAmount > 0) {
              newStatus = 'partially_paid';
            }
            
            if (paidAmount > 0) {
              await supabase
                .from('student_invoices')
                .update({ status: newStatus })
                .eq('id', invoice.id);
            }
          }
          console.log('Updated invoice statuses based on payment allocations');
        }
      }
    }

    // Step 15: Get or create Exams (IDEMPOTENT)
    const { data: existingExams } = await supabase
      .from('exams')
      .select('id, max_marks')
      .eq('institution_id', institutionId);

    let exams = existingExams || [];
    if (exams.length === 0) {
      const examsData = [
        { name: 'CAT 1', exam_type: 'cat', max_marks: 30, weight_percentage: 10, status: 'published' },
        { name: 'CAT 2', exam_type: 'cat', max_marks: 30, weight_percentage: 10, status: 'published' },
        { name: 'Mid-Term Exam', exam_type: 'midterm', max_marks: 100, weight_percentage: 30, status: 'published' },
      ];

      const { data: newExams, error: examsError } = await supabase
        .from('exams')
        .insert(examsData.map(e => ({
          ...e,
          institution_id: institutionId,
          academic_year_id: academicYear.id,
          term_id: currentTerm.id,
          start_date: `${currentYear}-02-01`,
          end_date: `${currentYear}-02-05`,
        })))
        .select('id, max_marks');

      if (examsError) throw examsError;
      exams = newExams || [];
      console.log('Created exams:', exams.length);
    }

    // Step 16: Get or create Student Scores (IDEMPOTENT) - Using student_scores table
    const { data: existingScores } = await supabase
      .from('student_scores')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingScores || existingScores.length === 0) {
      const scoresData: any[] = [];
      const gradeScale = [
        { min: 80, grade: 'A', remarks: 'Excellent' },
        { min: 70, grade: 'B', remarks: 'Very Good' },
        { min: 60, grade: 'C', remarks: 'Good' },
        { min: 50, grade: 'D', remarks: 'Average' },
        { min: 0, grade: 'E', remarks: 'Below Average' },
      ];

      const getGrade = (marks: number, maxMarks: number) => {
        const percentage = (marks / maxMarks) * 100;
        return gradeScale.find(g => percentage >= g.min) || gradeScale[gradeScale.length - 1];
      };

      for (const exam of exams) {
        for (const student of students) {
          for (const subject of subjects) {
            // Generate realistic marks based on exam type
            const maxMarks = exam.max_marks || 100;
            const minPercentage = 35 + Math.random() * 20; // 35-55% minimum
            const maxPercentage = 70 + Math.random() * 30; // 70-100% maximum
            const percentage = minPercentage + Math.random() * (maxPercentage - minPercentage);
            const marks = Math.round((percentage / 100) * maxMarks);
            const gradeInfo = getGrade(marks, maxMarks);

            scoresData.push({
              institution_id: institutionId,
              exam_id: exam.id,
              student_id: student.id,
              subject_id: subject.id,
              marks: marks,
              grade: gradeInfo.grade,
              remarks: gradeInfo.remarks,
              status: 'entered',
            });
          }
        }
      }

      // Insert in batches to avoid timeout
      const batchSize = 500;
      for (let i = 0; i < scoresData.length; i += batchSize) {
        const batch = scoresData.slice(i, i + batchSize);
        const { error: scoresError } = await supabase.from('student_scores').insert(batch);
        if (scoresError) console.error('Scores batch error:', scoresError);
      }
      console.log('Created student scores:', scoresData.length);
    }

    // Step 17: Get or create Timetables (IDEMPOTENT)
    const { data: existingTimetables } = await supabase
      .from('timetables')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingTimetables || existingTimetables.length === 0) {
      const teachableSlots = timeSlots.filter((ts) => ts.slot_type !== 'break');

      const { data: timetable, error: ttError } = await supabase
        .from('timetables')
        .insert({
          institution_id: institutionId,
          academic_year_id: academicYear.id,
          term_id: currentTerm.id,
          name: 'Master Timetable',
          status: 'published',
          timetable_type: 'class',
        })
        .select('id')
        .single();

      if (!ttError && timetable) {
        const entries: {
          institution_id: string;
          timetable_id: string;
          class_id: string;
          day_of_week: number;
          time_slot_id: string;
          subject_id: string;
          teacher_id: string;
        }[] = [];

        for (const cls of classes) {
          for (let day = 1; day <= 5; day++) {
            for (const slot of teachableSlots) {
              const subject = randomElement(subjects);
              const teacher = randomElement(teacherStaff);
              entries.push({
                institution_id: institutionId,
                timetable_id: timetable.id,
                class_id: cls.id,
                day_of_week: day,
                time_slot_id: slot.id,
                subject_id: subject.id,
                teacher_id: teacher.id,
              });
            }
          }
        }

        if (entries.length > 0) {
          const { error: entriesError } = await supabase.from('timetable_entries').insert(entries);
          if (entriesError) throw entriesError;
        }

        console.log('Created master timetable with entries:', entries.length);
      }
    }

    // Step 17: Get or create Attendance (IDEMPOTENT)
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingAttendance || existingAttendance.length === 0) {
      const attendanceData = [];
      const today = new Date();
      for (let d = 1; d <= 5; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - d);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        const dateStr = date.toISOString().split('T')[0];

        for (const student of students.slice(0, 50)) {
          const status = Math.random() > 0.9 ? 'absent' : (Math.random() > 0.95 ? 'late' : 'present');
          attendanceData.push({
            institution_id: institutionId,
            student_id: student.id,
            class_id: student.class_id,
            date: dateStr,
            status,
          });
        }
      }

      await supabase.from('attendance').insert(attendanceData);
      console.log('Created attendance:', attendanceData.length);
    }

    // Step 17b: Fix students with null class_id (CRITICAL FOR DEMO)
    // This ensures existing students are assigned to classes properly
    const { data: studentsWithNoClass } = await supabase
      .from('students')
      .select('id')
      .eq('institution_id', institutionId)
      .is('class_id', null);

    if (studentsWithNoClass && studentsWithNoClass.length > 0) {
      console.log('Found students with null class_id:', studentsWithNoClass.length);
      
      // Distribute students evenly across classes
      const studentsPerClass = Math.ceil(studentsWithNoClass.length / classes.length);
      
      for (let i = 0; i < studentsWithNoClass.length; i++) {
        const classIndex = Math.min(Math.floor(i / studentsPerClass), classes.length - 1);
        const targetClass = classes[classIndex];
        
        await supabase
          .from('students')
          .update({ class_id: targetClass.id })
          .eq('id', studentsWithNoClass[i].id);
      }
      
      console.log('Fixed student class assignments:', studentsWithNoClass.length);
      
      // Refresh students array with updated class_id values
      const { data: refreshedStudents } = await supabase
        .from('students')
        .select('id, first_name, last_name, class_id, gender')
        .eq('institution_id', institutionId);
      
      if (refreshedStudents) {
        students = refreshedStudents;
      }
    }

    // Step 17c: Seed Demo Diary Entries (IDEMPOTENT)
    // Creates realistic diary entries to showcase the diary feature for the demo teacher's class
    const { data: existingDiaryEntries } = await supabase
      .from('student_diary_entries')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingDiaryEntries || existingDiaryEntries.length === 0) {
      // Find Grade 8 class (demo teacher's class)
      const grade8Class = classes.find(c => c.name === 'Grade 8' || c.level === 'Grade 8');
      
      // Get Mary Wanjiku's staff ID (the demo teacher)
      const demoTeacher = staff.find((s: any) => 
        s.first_name === 'Mary' && s.last_name === 'Wanjiku'
      );
      
      if (grade8Class && demoTeacher) {
        // Get students in Grade 8
        const grade8Students = students.filter(s => s.class_id === grade8Class.id);
        console.log('Grade 8 students for diary seeding:', grade8Students.length);
        
        const diaryEntries: any[] = [];
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
        
        // Mood and activity templates
        const moods = ['happy', 'excited', 'okay', 'tired', 'upset'];
        const goodDayActivities = ['Reading', 'Outdoor Play', 'Group Work', 'Art & Craft'];
        const activeDayActivities = ['Physical Education', 'Outdoor Play', 'Dance', 'Indoor Games'];
        const learningDayActivities = ['Reading', 'Writing', 'Science Experiment', 'Library Visit'];
        
        const teacherComments = [
          'Had a wonderful day at school! Participated well in class activities.',
          'Very active and engaged in all lessons today. Keep it up!',
          'Showed great improvement in reading comprehension today.',
          'Excellent teamwork during group activities.',
          'Demonstrated good leadership skills during group work.',
          'Made good progress in mathematics today.',
          'Participated enthusiastically in all activities.',
          'Helped classmates with their work - great team spirit!',
          'Completed all assignments on time.',
          'Showed creativity in art class today.',
        ];
        
        const parentComments = [
          'Thank you for the update! She was excited to share what she learned.',
          'Great to hear! He practiced his reading at home too.',
          'Thanks for keeping us informed. Looking forward to more updates!',
          'Wonderful news! We appreciate your dedication.',
          'Thank you teacher. We are so proud of the progress.',
        ];
        
        // TODAY's entries (18 students - simulates bulk entry with "Good Day" template)
        const todayStudents = grade8Students.slice(0, 18);
        todayStudents.forEach((student, i) => {
          // Most students happy, a few variations
          const mood = i < 12 ? 'happy' : (i < 15 ? 'excited' : 'okay');
          diaryEntries.push({
            institution_id: institutionId,
            student_id: student.id,
            entry_date: todayStr,
            entry_type: 'daily_report',
            mood,
            activities: goodDayActivities,
            meals: { breakfast: true, snack: true, lunch: true },
            teacher_comment: teacherComments[i % teacherComments.length],
            is_flagged: false,
            created_by: demoTeacher.id,
          });
        });
        
        // YESTERDAY's entries (15 students with 5 parent responses)
        const yesterdayStudents = grade8Students.slice(0, 15);
        yesterdayStudents.forEach((student, i) => {
          const hasParentResponse = i < 5;
          const acknowledgedAt = hasParentResponse 
            ? new Date(yesterday.getTime() + 6 * 60 * 60 * 1000).toISOString() // 6 hours after entry
            : null;
          
          diaryEntries.push({
            institution_id: institutionId,
            student_id: student.id,
            entry_date: yesterdayStr,
            entry_type: 'daily_report',
            mood: i < 10 ? 'happy' : (i < 13 ? 'excited' : 'okay'),
            activities: activeDayActivities,
            meals: { breakfast: true, snack: true, lunch: true },
            teacher_comment: teacherComments[(i + 3) % teacherComments.length],
            parent_comment: hasParentResponse ? parentComments[i] : null,
            parent_acknowledged_at: acknowledgedAt,
            is_flagged: false,
            created_by: demoTeacher.id,
          });
        });
        
        // FLAGGED entries (2 concern entries from 2 days ago)
        if (grade8Students.length >= 2) {
          diaryEntries.push({
            institution_id: institutionId,
            student_id: grade8Students[5]?.id || grade8Students[0].id,
            entry_date: twoDaysAgoStr,
            entry_type: 'concern',
            mood: 'upset',
            activities: ['Reading'],
            meals: { breakfast: false, snack: true, lunch: false },
            teacher_comment: 'Seemed unusually quiet today and did not eat lunch. Please check in at home and let us know if everything is okay.',
            is_flagged: true,
            created_by: demoTeacher.id,
          });
          
          diaryEntries.push({
            institution_id: institutionId,
            student_id: grade8Students[8]?.id || grade8Students[1].id,
            entry_date: twoDaysAgoStr,
            entry_type: 'concern',
            mood: 'tired',
            activities: ['Indoor Games'],
            meals: { breakfast: true, snack: true, lunch: true },
            teacher_comment: 'Has been very tired and sleepy in class for the past few days. Please ensure adequate rest at home.',
            is_flagged: true,
            created_by: demoTeacher.id,
          });
        }
        
        // ACHIEVEMENT entries (3 celebrations)
        if (grade8Students.length >= 3) {
          diaryEntries.push({
            institution_id: institutionId,
            student_id: grade8Students[2]?.id || grade8Students[0].id,
            entry_date: yesterdayStr,
            entry_type: 'achievement',
            mood: 'excited',
            activities: ['Reading', 'Group Work'],
            meals: { breakfast: true, snack: true, lunch: true },
            teacher_comment: '🎉 Excellent achievement! Scored top marks in the spelling test today. Keep up the amazing work!',
            parent_comment: 'We are so proud! Thank you for recognizing her efforts.',
            parent_acknowledged_at: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000).toISOString(),
            is_flagged: false,
            created_by: demoTeacher.id,
          });
          
          diaryEntries.push({
            institution_id: institutionId,
            student_id: grade8Students[10]?.id || grade8Students[1].id,
            entry_date: twoDaysAgoStr,
            entry_type: 'achievement',
            mood: 'excited',
            activities: ['Physical Education', 'Outdoor Play'],
            meals: { breakfast: true, snack: true, lunch: true },
            teacher_comment: '🏆 Won first place in the class athletics competition! Outstanding performance in the 100m sprint.',
            is_flagged: false,
            created_by: demoTeacher.id,
          });
          
          diaryEntries.push({
            institution_id: institutionId,
            student_id: grade8Students[15]?.id || grade8Students[2].id,
            entry_date: todayStr,
            entry_type: 'achievement',
            mood: 'happy',
            activities: ['Art & Craft', 'Music'],
            meals: { breakfast: true, snack: true, lunch: true },
            teacher_comment: '🎨 Beautiful artwork! The drawing was selected for the school exhibition. We are proud of this creative talent!',
            is_flagged: false,
            created_by: demoTeacher.id,
          });
        }
        
        // Insert all diary entries
        if (diaryEntries.length > 0) {
          const { error: diaryError } = await supabase
            .from('student_diary_entries')
            .insert(diaryEntries);
          
          if (diaryError) {
            console.error('Diary entries error:', diaryError);
          } else {
            console.log('Created diary entries:', diaryEntries.length);
          }
        }
      } else {
        console.log('Skipping diary seeding - Grade 8 class or demo teacher not found');
      }
    }

    // Step 18: Create Demo Accountant Auth Account (IDEMPOTENT)
    const DEMO_ACCOUNTANT_EMAIL = 'accountant.demo@zira.tech';
    const DEMO_ACCOUNTANT_PASSWORD = 'DemoAccountant2024!';
    
    // Find finance staff member
    const financeStaff = staff.find((s: any) => s.department === 'Finance');
    
    if (financeStaff) {
      const existingAccountant = existingUsers?.users?.find((u: any) => u.email === DEMO_ACCOUNTANT_EMAIL);
      let demoAccountantUserId: string | null = null;

      if (existingAccountant) {
        demoAccountantUserId = existingAccountant.id;
        console.log('Demo accountant auth account already exists:', demoAccountantUserId);
      } else {
        const { data: newAccountantAuth, error: accountantAuthError } = await supabase.auth.admin.createUser({
          email: DEMO_ACCOUNTANT_EMAIL,
          password: DEMO_ACCOUNTANT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            first_name: financeStaff.first_name,
            last_name: financeStaff.last_name,
          },
        });
        if (accountantAuthError) {
          console.error('Failed to create demo accountant auth:', accountantAuthError);
        } else {
          demoAccountantUserId = newAccountantAuth?.user?.id || null;
          console.log('Created demo accountant auth account:', demoAccountantUserId);
        }
      }

      if (demoAccountantUserId) {
        // Link to staff record
        await supabase
          .from('staff')
          .update({ user_id: demoAccountantUserId })
          .eq('id', financeStaff.id);
        
        // Upsert profile
        await supabase
          .from('profiles')
          .upsert({
            user_id: demoAccountantUserId,
            email: DEMO_ACCOUNTANT_EMAIL,
            first_name: financeStaff.first_name,
            last_name: financeStaff.last_name,
            institution_id: institutionId,
          }, { onConflict: 'user_id' });
        
        // Check if bursar role already exists
        const { data: existingBursarRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', demoAccountantUserId)
          .eq('role', 'bursar')
          .eq('institution_id', institutionId)
          .single();
        
        if (!existingBursarRole) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: demoAccountantUserId,
              role: 'bursar',
              institution_id: institutionId,
            });
        }
        
        console.log('Demo accountant linked to staff record:', financeStaff.first_name, financeStaff.last_name);
      }
    }

    // Step 19: Create Bank Accounts (IDEMPOTENT)
    const { data: existingBanks } = await supabase
      .from('bank_accounts')
      .select('id, account_name')
      .eq('institution_id', institutionId);

    let bankAccounts = existingBanks || [];
    if (bankAccounts.length === 0) {
      // Valid account_types: 'current', 'savings', 'fixed_deposit', 'mpesa', 'other'
      const bankAccountsData = [
        {
          institution_id: institutionId,
          account_name: 'KCB Operations Account',
          bank_name: 'Kenya Commercial Bank',
          account_number: '1234567890123',
          branch: 'Westlands Branch',
          account_type: 'current',
          currency: 'KES',
          opening_balance: 500000,
          current_balance: 850000,
          is_active: true,
          is_primary: true,
        },
        {
          institution_id: institutionId,
          account_name: 'Equity Fee Collection',
          bank_name: 'Equity Bank',
          account_number: '0987654321098',
          branch: 'CBD Branch',
          account_type: 'savings',
          currency: 'KES',
          opening_balance: 800000,
          current_balance: 1250000,
          is_active: true,
          is_primary: false,
        },
        {
          institution_id: institutionId,
          account_name: 'M-Pesa Paybill',
          bank_name: 'Safaricom M-Pesa',
          account_number: '123456',
          account_type: 'mpesa',
          currency: 'KES',
          opening_balance: 200000,
          current_balance: 425000,
          is_active: true,
          is_primary: false,
        },
        {
          institution_id: institutionId,
          account_name: 'Petty Cash',
          bank_name: 'Cash on Hand',
          account_number: 'PETTY-001',
          account_type: 'other',
          currency: 'KES',
          opening_balance: 20000,
          current_balance: 15000,
          is_active: true,
          is_primary: false,
        },
      ];
      
      const { data: newBanks, error: banksError } = await supabase
        .from('bank_accounts')
        .insert(bankAccountsData)
        .select('id, account_name');
      
      if (banksError) {
        console.error('Bank accounts error:', banksError);
      } else {
        bankAccounts = newBanks || [];
        console.log('Created bank accounts:', bankAccounts.length);
      }
    }

    // Step 20: Create Funds (IDEMPOTENT)
    // Columns: fund_code, fund_name, fund_type, source, description, budget_amount, is_active
    // Valid fund_type: capitation, fees, donation, project, operations, reserve
    // Valid source: government, parents, donors, internal, other
    const { data: existingFunds } = await supabase
      .from('funds')
      .select('id, fund_code, fund_name')
      .eq('institution_id', institutionId);

    let funds = existingFunds || [];
    if (funds.length === 0) {
      const fundsData = [
        { 
          institution_id: institutionId,
          fund_name: 'School Fees Fund', 
          fund_code: 'SFF', 
          fund_type: 'fees', 
          source: 'parents', 
          is_active: true,
          description: 'Main fund for tuition and fee collections',
          budget_amount: 5000000,
        },
        { 
          institution_id: institutionId,
          fund_name: 'FPE Capitation Fund', 
          fund_code: 'FPE', 
          fund_type: 'capitation', 
          source: 'government', 
          is_active: true,
          description: 'Free Primary Education capitation grants from government',
          budget_amount: 2000000,
        },
        { 
          institution_id: institutionId,
          fund_name: 'Infrastructure Development', 
          fund_code: 'IDF', 
          fund_type: 'project', 
          source: 'internal', 
          is_active: true,
          description: 'Capital projects and building development',
          budget_amount: 1500000,
        },
        { 
          institution_id: institutionId,
          fund_name: 'Boarding Fund', 
          fund_code: 'BRD', 
          fund_type: 'fees', 
          source: 'parents', 
          is_active: true,
          description: 'Boarding and meals revenue',
          budget_amount: 3000000,
        },
        { 
          institution_id: institutionId,
          fund_name: 'Operations Fund', 
          fund_code: 'OPS', 
          fund_type: 'operations', 
          source: 'internal', 
          is_active: true,
          description: 'General operations and daily expenses',
          budget_amount: 500000,
        },
      ];

      const { data: newFunds, error: fundsError } = await supabase
        .from('funds')
        .insert(fundsData)
        .select('id, fund_code, fund_name');
      
      if (fundsError) {
        console.error('Funds error:', fundsError);
      } else {
        funds = newFunds || [];
        console.log('Created funds:', funds.length);
      }
    }

    // Step 21: Create Voteheads (IDEMPOTENT)
    // Columns: code, name, description, category, requires_approval_above, is_active
    // Valid category: recurrent, capital, personal_emolument, development
    const { data: existingVoteheads } = await supabase
      .from('voteheads')
      .select('id, code, name')
      .eq('institution_id', institutionId);

    let voteheads = existingVoteheads || [];
    if (voteheads.length === 0) {
      const voteheadsData = [
        { name: 'Tuition Materials (RMI)', code: 'RMI', category: 'recurrent', description: 'Reading materials and instructional supplies' },
        { name: 'Examination Costs', code: 'EXM', category: 'recurrent', description: 'Exam papers, printing, invigilation' },
        { name: 'Staff Salaries', code: 'SAL', category: 'personal_emolument', description: 'Teaching and support staff salaries', requires_approval_above: 100000 },
        { name: 'Utilities & Power', code: 'UTL', category: 'recurrent', description: 'Electricity, water, internet' },
        { name: 'Maintenance & Repairs', code: 'MNT', category: 'recurrent', description: 'Building and equipment maintenance' },
        { name: 'Transport', code: 'TRP', category: 'recurrent', description: 'Vehicle fuel and maintenance' },
        { name: 'Stationery & Supplies', code: 'STN', category: 'recurrent', description: 'Office and classroom supplies' },
        { name: 'Meals & Catering', code: 'MLS', category: 'recurrent', description: 'Food and kitchen supplies' },
        { name: 'Security Services', code: 'SEC', category: 'recurrent', description: 'Guard services and equipment' },
        { name: 'Co-curricular Activities', code: 'ACT', category: 'development', description: 'Sports, clubs, field trips' },
      ];

      const { data: newVoteheads, error: vhError } = await supabase
        .from('voteheads')
        .insert(voteheadsData.map(vh => ({ ...vh, institution_id: institutionId, is_active: true })))
        .select('id, code, name');
      
      if (vhError) {
        console.error('Voteheads error:', vhError);
      } else {
        voteheads = newVoteheads || [];
        console.log('Created voteheads:', voteheads.length);
      }
    }

    // Step 22: Create Chart of Accounts (IDEMPOTENT) - Using Primary School Template
    // Columns: account_code, account_name, account_type, parent_account_id, fund_id, normal_balance, is_bank_account, is_control_account, is_system_account, description, is_active
    const { data: existingCOA } = await supabase
      .from('chart_of_accounts')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingCOA || existingCOA.length === 0) {
      const coaData = [
        // Assets (1xxx)
        { account_code: '1000', account_name: 'Assets', account_type: 'asset', normal_balance: 'debit', is_control_account: true },
        { account_code: '1100', account_name: 'Current Assets', account_type: 'asset', parent_code: '1000', normal_balance: 'debit', is_control_account: true },
        { account_code: '1110', account_name: 'Cash in Hand', account_type: 'asset', parent_code: '1100', normal_balance: 'debit' },
        { account_code: '1120', account_name: 'Cash at Bank - KCB', account_type: 'asset', parent_code: '1100', normal_balance: 'debit', is_bank_account: true },
        { account_code: '1121', account_name: 'Cash at Bank - Equity', account_type: 'asset', parent_code: '1100', normal_balance: 'debit', is_bank_account: true },
        { account_code: '1122', account_name: 'M-Pesa Float', account_type: 'asset', parent_code: '1100', normal_balance: 'debit', is_bank_account: true },
        { account_code: '1130', account_name: 'Petty Cash', account_type: 'asset', parent_code: '1100', normal_balance: 'debit' },
        { account_code: '1200', account_name: 'Accounts Receivable', account_type: 'asset', parent_code: '1000', normal_balance: 'debit', is_control_account: true },
        { account_code: '1210', account_name: 'Student Fees Receivable', account_type: 'asset', parent_code: '1200', normal_balance: 'debit' },
        { account_code: '1220', account_name: 'Government Grants Receivable', account_type: 'asset', parent_code: '1200', normal_balance: 'debit' },
        { account_code: '1400', account_name: 'Fixed Assets', account_type: 'asset', parent_code: '1000', normal_balance: 'debit', is_control_account: true },
        { account_code: '1410', account_name: 'Land & Buildings', account_type: 'asset', parent_code: '1400', normal_balance: 'debit' },
        { account_code: '1420', account_name: 'Furniture & Equipment', account_type: 'asset', parent_code: '1400', normal_balance: 'debit' },
        
        // Liabilities (2xxx)
        { account_code: '2000', account_name: 'Liabilities', account_type: 'liability', normal_balance: 'credit', is_control_account: true },
        { account_code: '2100', account_name: 'Current Liabilities', account_type: 'liability', parent_code: '2000', normal_balance: 'credit', is_control_account: true },
        { account_code: '2110', account_name: 'Accounts Payable', account_type: 'liability', parent_code: '2100', normal_balance: 'credit' },
        { account_code: '2120', account_name: 'Salaries Payable', account_type: 'liability', parent_code: '2100', normal_balance: 'credit' },
        { account_code: '2130', account_name: 'PAYE Payable', account_type: 'liability', parent_code: '2100', normal_balance: 'credit' },
        { account_code: '2160', account_name: 'Fees Received in Advance', account_type: 'liability', parent_code: '2100', normal_balance: 'credit' },
        
        // Equity (3xxx)
        { account_code: '3000', account_name: 'Equity', account_type: 'equity', normal_balance: 'credit', is_control_account: true },
        { account_code: '3110', account_name: 'General Fund Balance', account_type: 'equity', parent_code: '3000', normal_balance: 'credit' },
        { account_code: '3200', account_name: 'Retained Surplus', account_type: 'equity', parent_code: '3000', normal_balance: 'credit' },
        
        // Income (4xxx) - Note: account_type must be 'income' not 'revenue'
        { account_code: '4000', account_name: 'Income', account_type: 'income', normal_balance: 'credit', is_control_account: true },
        { account_code: '4100', account_name: 'Fee Income', account_type: 'income', parent_code: '4000', normal_balance: 'credit', is_control_account: true },
        { account_code: '4110', account_name: 'Tuition Fees', account_type: 'income', parent_code: '4100', normal_balance: 'credit' },
        { account_code: '4120', account_name: 'Boarding Fees', account_type: 'income', parent_code: '4100', normal_balance: 'credit' },
        { account_code: '4200', account_name: 'Government Grants', account_type: 'income', parent_code: '4000', normal_balance: 'credit', is_control_account: true },
        { account_code: '4210', account_name: 'FPE Capitation', account_type: 'income', parent_code: '4200', normal_balance: 'credit' },
        
        // Expenses (5xxx)
        { account_code: '5000', account_name: 'Expenses', account_type: 'expense', normal_balance: 'debit', is_control_account: true },
        { account_code: '5100', account_name: 'Personnel Costs', account_type: 'expense', parent_code: '5000', normal_balance: 'debit', is_control_account: true },
        { account_code: '5110', account_name: 'Teaching Staff Salaries', account_type: 'expense', parent_code: '5100', normal_balance: 'debit' },
        { account_code: '5120', account_name: 'Support Staff Salaries', account_type: 'expense', parent_code: '5100', normal_balance: 'debit' },
        { account_code: '5200', account_name: 'Academic Expenses', account_type: 'expense', parent_code: '5000', normal_balance: 'debit', is_control_account: true },
        { account_code: '5210', account_name: 'Tuition Materials (RMI)', account_type: 'expense', parent_code: '5200', normal_balance: 'debit' },
        { account_code: '5220', account_name: 'Examination Costs', account_type: 'expense', parent_code: '5200', normal_balance: 'debit' },
        { account_code: '5400', account_name: 'Facility Costs', account_type: 'expense', parent_code: '5000', normal_balance: 'debit', is_control_account: true },
        { account_code: '5410', account_name: 'Electricity', account_type: 'expense', parent_code: '5400', normal_balance: 'debit' },
        { account_code: '5420', account_name: 'Water & Sanitation', account_type: 'expense', parent_code: '5400', normal_balance: 'debit' },
        { account_code: '5430', account_name: 'Repairs & Maintenance', account_type: 'expense', parent_code: '5400', normal_balance: 'debit' },
        { account_code: '5440', account_name: 'Security Services', account_type: 'expense', parent_code: '5400', normal_balance: 'debit' },
      ];

      // First insert headers (accounts without parent), then children
      const headerAccounts = coaData.filter(a => !a.parent_code);
      const childAccounts = coaData.filter(a => a.parent_code);

      const { error: coaHeaderError } = await supabase
        .from('chart_of_accounts')
        .insert(headerAccounts.map(a => ({
          institution_id: institutionId,
          account_code: a.account_code,
          account_name: a.account_name,
          account_type: a.account_type,
          normal_balance: a.normal_balance,
          is_control_account: a.is_control_account || false,
          is_bank_account: a.is_bank_account || false,
          is_active: true,
        })));

      if (coaHeaderError) {
        console.error('COA header error:', coaHeaderError);
      } else {
        // Get parent IDs for linking
        const { data: parentAccounts } = await supabase
          .from('chart_of_accounts')
          .select('id, account_code')
          .eq('institution_id', institutionId);

        const parentMap = new Map((parentAccounts || []).map((p: any) => [p.account_code, p.id]));

        const { error: coaChildError } = await supabase
          .from('chart_of_accounts')
          .insert(childAccounts.map(a => ({
            institution_id: institutionId,
            account_code: a.account_code,
            account_name: a.account_name,
            account_type: a.account_type,
            normal_balance: a.normal_balance,
            parent_account_id: parentMap.get(a.parent_code!) || null,
            is_control_account: a.is_control_account || false,
            is_bank_account: a.is_bank_account || false,
            is_active: true,
          })));

        if (coaChildError) {
          console.error('COA child error:', coaChildError);
        } else {
          console.log('Created chart of accounts:', coaData.length);
        }
      }
    }

    // Step 22a: Create Journal Entries for Trial Balance and General Ledger (IDEMPOTENT)
    // These are the core double-entry records that populate financial reports
    const { data: existingJournals } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingJournals || existingJournals.length === 0) {
      // First get chart of accounts for this institution
      const { data: coaAccounts } = await supabase
        .from('chart_of_accounts')
        .select('id, account_code, account_name')
        .eq('institution_id', institutionId);

      if (coaAccounts && coaAccounts.length > 0) {
        const accountMap = new Map(coaAccounts.map((a: any) => [a.account_code, a.id]));
        
        // Generate 40 journal entries over the past 60 days
        const journalEntries: any[] = [];
        const journalLines: any[] = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        
        // Define entry types with Dr/Cr accounts
        const entryTemplates = [
          // Fee collections - 15 entries
          ...Array(15).fill(null).map((_, i) => ({
            desc: `Fee collection batch ${i + 1}`,
            ref: `MPESA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            source: 'receipt',
            drAccount: '1120', // Cash at Bank - KCB
            crAccount: '4110', // Tuition Fees
            amount: Math.floor(Math.random() * 20000) + 5000,
          })),
          // Salary payments - 4 entries
          ...Array(4).fill(null).map((_, i) => ({
            desc: `Staff salaries - Week ${i + 1}`,
            ref: `SAL-${currentYear}-${String(i + 1).padStart(2, '0')}`,
            source: 'payment',
            drAccount: '5110', // Teaching Staff Salaries
            crAccount: '1120', // Cash at Bank - KCB
            amount: Math.floor(Math.random() * 100000) + 50000,
          })),
          // Utility payments - 5 entries
          ...Array(5).fill(null).map((_, i) => ({
            desc: `Electricity bill payment ${i + 1}`,
            ref: `KPLC-${currentYear}-${String(i + 1).padStart(3, '0')}`,
            source: 'voucher',
            drAccount: '5410', // Electricity
            crAccount: '1120', // Cash at Bank - KCB
            amount: Math.floor(Math.random() * 30000) + 10000,
          })),
          // Material purchases - 5 entries
          ...Array(5).fill(null).map((_, i) => ({
            desc: `Tuition materials purchase ${i + 1}`,
            ref: `PO-${currentYear}-${String(i + 1).padStart(4, '0')}`,
            source: 'voucher',
            drAccount: '5210', // Tuition Materials RMI
            crAccount: '1120', // Cash at Bank - KCB
            amount: Math.floor(Math.random() * 60000) + 20000,
          })),
          // FPE Capitation - 2 entries
          ...Array(2).fill(null).map((_, i) => ({
            desc: `FPE Capitation Grant Term ${i + 1}`,
            ref: `MOE-FPE-${currentYear}-${String(i + 1).padStart(2, '0')}`,
            source: 'receipt',
            drAccount: '1121', // Cash at Bank - Equity
            crAccount: '4210', // FPE Capitation
            amount: Math.floor(Math.random() * 200000) + 150000,
          })),
          // Repairs & Maintenance - 5 entries
          ...Array(5).fill(null).map((_, i) => ({
            desc: `Repairs & maintenance ${i + 1}`,
            ref: `MNT-${currentYear}-${String(i + 1).padStart(3, '0')}`,
            source: 'voucher',
            drAccount: '5430', // Repairs & Maintenance
            crAccount: '1110', // Cash in Hand
            amount: Math.floor(Math.random() * 15000) + 5000,
          })),
          // Security services - 3 entries
          ...Array(3).fill(null).map((_, i) => ({
            desc: `Security services payment ${i + 1}`,
            ref: `SEC-${currentYear}-${String(i + 1).padStart(2, '0')}`,
            source: 'voucher',
            drAccount: '5440', // Security Services
            crAccount: '1120', // Cash at Bank - KCB
            amount: Math.floor(Math.random() * 25000) + 15000,
          })),
        ];

        let entryNumber = 1;
        for (const template of entryTemplates) {
          const daysAgo = Math.floor(Math.random() * 60);
          const entryDate = new Date(today);
          entryDate.setDate(entryDate.getDate() - daysAgo);
          const dateStr = entryDate.toISOString().split('T')[0];
          
          const entryId = crypto.randomUUID();
          
          journalEntries.push({
            id: entryId,
            institution_id: institutionId,
            entry_number: `JE-${currentYear}-${String(entryNumber).padStart(5, '0')}`,
            entry_date: dateStr,
            description: template.desc,
            reference: template.ref,
            source_type: template.source,
            total_debit: template.amount,
            total_credit: template.amount,
            status: 'posted',
            posted_by: demoUserId,
            posted_at: new Date().toISOString(),
          });

          // Debit line
          const drAccountId = accountMap.get(template.drAccount);
          const crAccountId = accountMap.get(template.crAccount);
          
          if (drAccountId) {
            journalLines.push({
              journal_entry_id: entryId,
              institution_id: institutionId,
              account_id: drAccountId,
              description: template.desc,
              debit_amount: template.amount,
              credit_amount: 0,
              line_order: 1,
            });
          }
          
          // Credit line
          if (crAccountId) {
            journalLines.push({
              journal_entry_id: entryId,
              institution_id: institutionId,
              account_id: crAccountId,
              description: template.desc,
              debit_amount: 0,
              credit_amount: template.amount,
              line_order: 2,
            });
          }
          
          entryNumber++;
        }

        // Insert journal entries
        const { error: jeError } = await supabase
          .from('journal_entries')
          .insert(journalEntries);

        if (jeError) {
          console.error('Journal entries error:', jeError);
        } else {
          console.log('Created journal entries:', journalEntries.length);
          
          // Insert journal entry lines
          const { error: jelError } = await supabase
            .from('journal_entry_lines')
            .insert(journalLines);

          if (jelError) {
            console.error('Journal entry lines error:', jelError);
          } else {
            console.log('Created journal entry lines:', journalLines.length);
          }
        }
      }
    }

    // Step 23: Create Payment Vouchers (IDEMPOTENT)
    // Required columns: voucher_number, voucher_date, payee_name, payee_type (required!), total_amount, status, payment_method, description, fund_id
    // Valid payee_type: supplier, staff, government, other
    // Valid status: draft, pending_check, pending_approval, approved, paid, cancelled, rejected
    const { data: existingVouchers } = await supabase
      .from('payment_vouchers')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (!existingVouchers || existingVouchers.length === 0) {
      const sampleVouchers = [
        { payee: 'Longhorn Publishers Ltd', payee_type: 'supplier', desc: 'Term 1 textbooks and revision materials', amount: 125000, status: 'paid', method: 'bank_transfer', category: 'RMI' },
        { payee: 'Kenya Power & Lighting Co.', payee_type: 'supplier', desc: 'Electricity bill - January 2026', amount: 45000, status: 'paid', method: 'bank_transfer', category: 'UTL' },
        { payee: 'Nairobi Water Company', payee_type: 'supplier', desc: 'Water bill - January 2026', amount: 12500, status: 'approved', method: 'bank_transfer', category: 'UTL' },
        { payee: 'Securicor Kenya Ltd', payee_type: 'supplier', desc: 'Security services - Q1 2026', amount: 85000, status: 'paid', method: 'bank_transfer', category: 'SEC' },
        { payee: 'Office Mart Ltd', payee_type: 'supplier', desc: 'Office stationery and supplies', amount: 18500, status: 'paid', method: 'cheque', category: 'STN' },
        { payee: 'Shell Petrol Station', payee_type: 'supplier', desc: 'School bus fuel - January', amount: 32000, status: 'paid', method: 'mpesa', category: 'TRP' },
        { payee: 'Bidco Africa Ltd', payee_type: 'supplier', desc: 'Cooking oil and provisions', amount: 67000, status: 'draft', method: 'bank_transfer', category: 'MLS' },
        { payee: 'Twiga Foods', payee_type: 'supplier', desc: 'Fresh vegetables and fruits', amount: 28000, status: 'pending_check', method: 'mpesa', category: 'MLS' },
        { payee: 'Nation Media Group', payee_type: 'supplier', desc: 'Daily newspapers subscription', amount: 4500, status: 'paid', method: 'mpesa', category: 'STN' },
        { payee: 'Total Kenya', payee_type: 'supplier', desc: 'Generator diesel - January', amount: 15000, status: 'paid', method: 'mpesa', category: 'UTL' },
        { payee: 'Kenya Bus Services', payee_type: 'supplier', desc: 'Field trip transport - Grade 6', amount: 22000, status: 'approved', method: 'cheque', category: 'TRP' },
        { payee: 'Jumia Kenya', payee_type: 'supplier', desc: 'Computer accessories and cables', amount: 8500, status: 'paid', method: 'mpesa', category: 'STN' },
        { payee: 'Cleantech Services', payee_type: 'supplier', desc: 'Monthly cleaning services', amount: 35000, status: 'paid', method: 'bank_transfer', category: 'MNT' },
        { payee: 'John Kamau (Carpenter)', payee_type: 'other', desc: 'Furniture repairs - classrooms', amount: 12000, status: 'pending_check', method: 'cash', category: 'MNT' },
        { payee: 'St. Johns Ambulance', payee_type: 'other', desc: 'First aid training for staff', amount: 25000, status: 'approved', method: 'bank_transfer', category: 'SAL' },
        { payee: 'Telkom Kenya', payee_type: 'supplier', desc: 'Internet and phone services', amount: 9500, status: 'paid', method: 'bank_transfer', category: 'UTL' },
        { payee: 'Sports Direct Kenya', payee_type: 'supplier', desc: 'Sports equipment and uniforms', amount: 42000, status: 'draft', method: 'bank_transfer', category: 'ACT' },
        { payee: 'Unga Holdings', payee_type: 'supplier', desc: 'Maize flour and wheat flour', amount: 38000, status: 'paid', method: 'cheque', category: 'MLS' },
        { payee: 'Kenya Medical Supplies', payee_type: 'supplier', desc: 'Sick bay medical supplies', amount: 15500, status: 'paid', method: 'mpesa', category: 'STN' },
        { payee: 'James Mwangi (Plumber)', payee_type: 'other', desc: 'Plumbing repairs - washrooms', amount: 8000, status: 'paid', method: 'cash', category: 'MNT' },
      ];

      // Use demo admin user ID for prepared_by
      const preparedByUserId = demoUserId;

      const vouchersToInsert = sampleVouchers.map((v, i) => ({
        institution_id: institutionId,
        voucher_number: `PV-${currentYear}-${String(i + 1).padStart(4, '0')}`,
        voucher_date: `${currentYear}-${String(Math.floor(Math.random() * 2) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        payee_name: v.payee,
        payee_type: v.payee_type,
        description: v.desc,
        total_amount: v.amount,
        status: v.status,
        payment_method: v.method,
        fund_id: funds.length > 0 ? funds[0].id : null,
        bank_account_id: bankAccounts.length > 0 ? bankAccounts[0].id : null,
        prepared_by: preparedByUserId,
      }));

      const { data: newVouchers, error: vouchersError } = await supabase
        .from('payment_vouchers')
        .insert(vouchersToInsert)
        .select('id, total_amount, status');

      if (vouchersError) {
        console.error('Vouchers error:', vouchersError);
      } else {
        console.log('Created payment vouchers:', newVouchers?.length || 0);

        // Create line items for each voucher
        if (newVouchers && newVouchers.length > 0) {
          const lineItems = newVouchers.map((v: any, i: number) => ({
            institution_id: institutionId,
            voucher_id: v.id,
            description: sampleVouchers[i].desc,
            quantity: 1,
            unit_price: v.total_amount,
            amount: v.total_amount,
            votehead_id: voteheads.find((vh: any) => vh.code === sampleVouchers[i].category)?.id || null,
          }));

          const { error: lineItemsError } = await supabase
            .from('payment_voucher_items')
            .insert(lineItems);

          if (lineItemsError) {
            console.error('Voucher line items error:', lineItemsError);
          }
        }
      }
    }

    // Step 24: Create Cashbook Entries (IDEMPOTENT)
    // Columns: bank_account_id, entry_date, value_date, entry_type, reference_number, description, debit_amount, credit_amount, running_balance, source_type, reconciled
    const { data: existingCashbook } = await supabase
      .from('cashbook_entries')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if ((!existingCashbook || existingCashbook.length === 0) && bankAccounts.length > 0) {
      const cashbookEntries = [];
      const today = new Date();
      let runningBalance = 500000; // Starting balance
      
      // Generate entries for the past 30 days
      for (let d = 30; d >= 1; d--) {
        const entryDate = new Date(today);
        entryDate.setDate(entryDate.getDate() - d);
        if (entryDate.getDay() === 0 || entryDate.getDay() === 6) continue;
        
        const dateStr = entryDate.toISOString().split('T')[0];
        
        // 2-4 entries per day
        const entriesPerDay = Math.floor(Math.random() * 3) + 2;
        
        for (let e = 0; e < entriesPerDay; e++) {
          const isReceipt = Math.random() > 0.4; // 60% receipts, 40% payments
          const amount = isReceipt 
            ? Math.floor(Math.random() * 20000) + 5000 
            : Math.floor(Math.random() * 15000) + 2000;
          
          if (isReceipt) {
            runningBalance += amount;
          } else {
            runningBalance -= amount;
          }
          
          cashbookEntries.push({
            institution_id: institutionId,
            bank_account_id: bankAccounts[Math.floor(Math.random() * bankAccounts.length)].id,
            entry_date: dateStr,
            value_date: dateStr,
            entry_type: isReceipt ? 'receipt' : 'payment',
            description: isReceipt 
              ? `Fee payment - ${randomElement(['Student fees', 'Term fees', 'Activity fees', 'Transport fees'])}`
              : `Payment - ${randomElement(['Supplies', 'Utilities', 'Services', 'Maintenance'])}`,
            debit_amount: isReceipt ? amount : 0,
            credit_amount: isReceipt ? 0 : amount,
            running_balance: runningBalance,
            reference_number: isReceipt ? generateMpesaCode() : generateBankRef(),
            source_type: isReceipt ? 'receipt' : 'voucher',
            reconciled: d > 7, // Older entries are reconciled
          });
        }
      }

      const { error: cashbookError } = await supabase
        .from('cashbook_entries')
        .insert(cashbookEntries);

      if (cashbookError) {
        console.error('Cashbook error:', cashbookError);
      } else {
        console.log('Created cashbook entries:', cashbookEntries.length);
      }
    }

    // Collect final stats
    const [studentsCount, staffCount, classesCount, subjectsCount, timetablesCount, bankCount, fundsCount, voucherCount] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('staff').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('classes').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('timetables').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('bank_accounts').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('funds').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
      supabase.from('payment_vouchers').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: action === 'reset' ? 'Demo data reset and recreated' : 'Demo institution ready',
        institutionId,
        stats: {
          students: studentsCount.count || 0,
          staff: staffCount.count || 0,
          classes: classesCount.count || 0,
          subjects: subjectsCount.count || 0,
          timetables: timetablesCount.count || 0,
          bankAccounts: bankCount.count || 0,
          funds: fundsCount.count || 0,
          paymentVouchers: voucherCount.count || 0,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Demo seed error:', error);
    const errInfo = serializeError(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errInfo.message,
        code: errInfo.code,
        details: errInfo.details,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
