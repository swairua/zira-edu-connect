import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useParentAuth, LinkedStudent as AuthLinkedStudent } from './ParentAuthContext';

export interface LinkedStudent {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  admission_number: string;
  photo_url: string | null;
  class_id: string | null;
  class_name?: string;
  institution_id: string;
  status: string | null;
}

export interface ParentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  institution_id: string;
}

interface ParentContextType {
  parentProfile: ParentProfile | null;
  linkedStudents: LinkedStudent[];
  selectedStudent: LinkedStudent | null;
  setSelectedStudent: (student: LinkedStudent | null) => void;
  isLoading: boolean;
  isParent: boolean;
  isDemo: boolean;
}

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export function ParentProvider({ children }: { children: ReactNode }) {
  const { user, hasRole } = useAuth();
  const { parent: otpParent, linkedStudents: authLinkedStudents, isAuthenticated: isOtpAuth, isLoading: otpLoading } = useParentAuth();
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  
  const isParent = hasRole('parent');

  // Determine parent ID based on auth type
  const parentId = isOtpAuth ? otpParent?.id : null;

  // For OTP parents, construct profile from ParentAuthContext
  const otpParentProfile: ParentProfile | null = isOtpAuth && otpParent ? {
    id: otpParent.id,
    first_name: otpParent.firstName,
    last_name: otpParent.lastName,
    email: otpParent.email,
    phone: otpParent.phone || '',
    institution_id: otpParent.institutionId,
  } : null;

  // Fetch parent profile (only for Supabase Auth users)
  const { data: supabaseParentProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['parent-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('parents')
        .select('id, first_name, last_name, email, phone, institution_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching parent profile:', error);
        return null;
      }

      return data as ParentProfile;
    },
    enabled: !!user && isParent && !isOtpAuth,
  });

  // Use OTP profile if available, otherwise use Supabase profile
  const parentProfile = otpParentProfile || supabaseParentProfile || null;

  // Map linked students from ParentAuthContext (for OTP auth - avoids RLS issues)
  const mappedAuthStudents: LinkedStudent[] = (authLinkedStudents || []).map((s: AuthLinkedStudent) => ({
    id: s.id,
    first_name: s.firstName,
    middle_name: null,
    last_name: s.lastName,
    admission_number: s.admissionNumber,
    photo_url: null,
    class_id: s.classId || null,
    class_name: s.className || undefined,
    institution_id: otpParent?.institutionId || '',
    status: 'active',
  }));

  // Fetch linked students for Supabase Auth parents (only if not using OTP)
  const { data: supabaseLinkedStudents = [], isLoading: supabaseStudentsLoading } = useQuery({
    queryKey: ['linked-students', supabaseParentProfile?.id],
    queryFn: async () => {
      if (!supabaseParentProfile) return [];

      const { data, error } = await supabase
        .from('student_parents')
        .select(`
          student_id,
          students:student_id (
            id,
            first_name,
            middle_name,
            last_name,
            admission_number,
            photo_url,
            class_id,
            institution_id,
            status,
            classes:class_id (
              name
            )
          )
        `)
        .eq('parent_id', supabaseParentProfile.id);

      if (error) {
        console.error('Error fetching linked students:', error);
        return [];
      }

      return (data || [])
        .filter((sp: any) => sp.students)
        .map((sp: any) => ({
          id: sp.students.id,
          first_name: sp.students.first_name,
          middle_name: sp.students.middle_name,
          last_name: sp.students.last_name,
          admission_number: sp.students.admission_number,
          photo_url: sp.students.photo_url,
          class_id: sp.students.class_id,
          class_name: sp.students.classes?.name || null,
          institution_id: sp.students.institution_id,
          status: sp.students.status,
        })) as LinkedStudent[];
    },
    enabled: !isOtpAuth && !!supabaseParentProfile,
  });

  // Use OTP students (from auth context) if available, otherwise use Supabase students
  // This is the KEY fix - for OTP auth, we use students from verify-parent-session directly
  const linkedStudents = isOtpAuth && mappedAuthStudents.length > 0 
    ? mappedAuthStudents 
    : supabaseLinkedStudents;

  // Check if this is a demo institution
  // For OTP auth, read from stored session data to avoid RLS issues with anonymous access
  const parsedSessionData = (() => {
    if (typeof window === 'undefined') return null;
    try {
      const storedData = localStorage.getItem('parent_session_data');
      return storedData ? JSON.parse(storedData) : null;
    } catch {
      return null;
    }
  })();
  const { data: institutionData } = useQuery({
    queryKey: ['parent-institution-demo-check', parentProfile?.institution_id],
    queryFn: async () => {
      if (!parentProfile?.institution_id) return null;
      const { data, error } = await supabase
        .from('institutions')
        .select('is_demo')
        .eq('id', parentProfile.institution_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!parentProfile?.institution_id && !isOtpAuth,
  });

  // For OTP auth, use stored isDemo value; for Supabase auth, query DB
  const isDemo = isOtpAuth 
    ? (parsedSessionData?.isDemo === true)
    : (institutionData?.is_demo === true);

  // Auto-select first student when loaded
  useEffect(() => {
    if (linkedStudents.length > 0 && !selectedStudent) {
      setSelectedStudent(linkedStudents[0]);
    }
  }, [linkedStudents, selectedStudent]);

  const studentsLoading = !isOtpAuth && supabaseStudentsLoading;
  const isLoading = otpLoading || profileLoading || studentsLoading;

  return (
    <ParentContext.Provider 
      value={{
        parentProfile: parentProfile || null,
        linkedStudents,
        selectedStudent,
        setSelectedStudent,
        isLoading,
        isParent: isOtpAuth || isParent,
        isDemo,
      }}
    >
      {children}
    </ParentContext.Provider>
  );
}

export function useParent() {
  const context = useContext(ParentContext);
  if (context === undefined) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
}
