import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStudentAuth } from '@/contexts/StudentAuthContext';

export interface StudentProfile {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  admission_number: string;
  photo_url: string | null;
  class_id: string | null;
  class_name: string | null;
  institution_id: string;
  status: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

interface StudentContextType {
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  isStudent: boolean;
  institutionId: string | null;
  isDemo: boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

interface StudentProviderProps {
  children: ReactNode;
  studentId?: string;
  institutionId?: string;
}

export function StudentProvider({ children, studentId, institutionId: propInstitutionId }: StudentProviderProps) {
  const { user, hasRole } = useAuth();
  const { student: otpStudent, institution: otpInstitution, isAuthenticated: isOtpAuth, isLoading: isOtpLoading } = useStudentAuth();
  
  const isStudent = hasRole('student') || !!studentId || isOtpAuth;

  // For OTP-authenticated students, use data from StudentAuthContext
  const otpStudentProfile = useMemo(() => {
    if (isOtpAuth && otpStudent) {
      return {
        id: otpStudent.id,
        first_name: otpStudent.firstName,
        middle_name: null,
        last_name: otpStudent.lastName,
        admission_number: otpStudent.admissionNumber,
        photo_url: null,
        class_id: null,
        class_name: otpStudent.className,
        institution_id: otpStudent.institutionId,
        status: 'active',
        date_of_birth: null,
        gender: null,
      } as StudentProfile;
    }
    return null;
  }, [isOtpAuth, otpStudent]);

  // Fetch student profile from DB - only for Supabase Auth students (not OTP)
  const { data: dbStudentProfile, isLoading: isDbLoading } = useQuery({
    queryKey: ['student-profile', user?.id, studentId],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          id,
          first_name,
          middle_name,
          last_name,
          admission_number,
          photo_url,
          class_id,
          institution_id,
          status,
          date_of_birth,
          gender,
          classes:class_id (
            name
          )
        `);

      // Use studentId if provided (PIN auth), otherwise use user.id (Supabase Auth)
      if (studentId) {
        query = query.eq('id', studentId);
      } else if (user) {
        query = query.eq('user_id', user.id);
      } else {
        return null;
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching student profile:', error);
        return null;
      }

      return {
        id: data.id,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        admission_number: data.admission_number,
        photo_url: data.photo_url,
        class_id: data.class_id,
        class_name: (data.classes as any)?.name || null,
        institution_id: data.institution_id,
        status: data.status,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
      } as StudentProfile;
    },
    // Only run DB query for non-OTP authenticated users
    enabled: !isOtpAuth && (!!user || !!studentId),
  });

  // Use OTP profile if available, otherwise use DB profile
  const studentProfile = otpStudentProfile || dbStudentProfile || null;
  const isLoading = isOtpAuth ? isOtpLoading : isDbLoading;

  // Check if this is a demo institution
  const { data: institutionData } = useQuery({
    queryKey: ['institution-demo-check', studentProfile?.institution_id],
    queryFn: async () => {
      if (!studentProfile?.institution_id) return null;
      const { data, error } = await supabase
        .from('institutions')
        .select('is_demo')
        .eq('id', studentProfile.institution_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!studentProfile?.institution_id,
  });

  const isDemo = institutionData?.is_demo === true;

  return (
    <StudentContext.Provider 
      value={{
        studentProfile,
        isLoading,
        isStudent,
        institutionId: studentProfile?.institution_id || propInstitutionId || null,
        isDemo,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
