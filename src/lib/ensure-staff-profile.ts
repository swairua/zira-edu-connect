import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures a staff profile exists for the given user.
 * If no staff record exists, creates a minimal one for admins to use for approvals.
 * Returns the staff ID if found/created, or null if creation failed.
 */
export async function ensureStaffProfile(
  userId: string,
  email: string | undefined,
  institutionId: string | null
): Promise<string | null> {
  if (!institutionId) return null;

  // First try to find existing staff by user_id
  const { data: existingByUserId } = await supabase
    .from('staff')
    .select('id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();

  if (existingByUserId?.id) {
    return existingByUserId.id;
  }

  // Try to find by email and link
  if (email) {
    const { data: existingByEmail } = await supabase
      .from('staff')
      .select('id')
      .ilike('email', email)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();

    if (existingByEmail?.id) {
      // Link the user_id to this record
      await supabase
        .from('staff')
        .update({ user_id: userId })
        .eq('id', existingByEmail.id)
        .is('user_id', null);
      
      return existingByEmail.id;
    }
  }

  // No staff record exists - create a minimal one for this admin
  // Generate a unique employee number
  const timestamp = Date.now().toString(36).toUpperCase();
  const employeeNumber = `ADM-${timestamp}`;

  // Get user profile info if available
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('user_id', userId)
    .single();

  const firstName = profile?.first_name || 'Admin';
  const lastName = profile?.last_name || 'User';

  const { data: newStaff, error } = await supabase
    .from('staff')
    .insert({
      institution_id: institutionId,
      user_id: userId,
      employee_number: employeeNumber,
      first_name: firstName,
      last_name: lastName,
      email: email,
      designation: 'Administrator',
      employment_type: 'full_time',
      is_active: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create staff profile for admin:', error);
    return null;
  }

  return newStaff?.id || null;
}
