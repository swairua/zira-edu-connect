import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  className: string | null;
  classLevel: string | null;
  institutionId: string;
}

interface Institution {
  id: string;
  name: string;
  code?: string;
}

interface StudentAuthContextType {
  student: StudentProfile | null;
  institution: Institution | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (institutionCode: string, admissionNumber: string, pin: string) => Promise<void>;
  loginWithOtp: (phone: string, code: string, entityId?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'student_session_token';
const STORAGE_EXPIRY_KEY = 'student_session_expiry';

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_EXPIRY_KEY);
    setStudent(null);
    setInstitution(null);
  }, []);

  const verifySession = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const expiry = localStorage.getItem(STORAGE_EXPIRY_KEY);

    if (!token || !expiry) {
      setIsLoading(false);
      return;
    }

    // Check if expired locally first
    if (new Date(expiry) < new Date()) {
      logout();
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-student-session', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error || !data?.valid) {
        logout();
      } else {
        setStudent(data.student);
        setInstitution(data.institution);
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Legacy PIN login (kept for backward compatibility)
  const login = async (
    institutionCode: string,
    admissionNumber: string,
    pin: string
  ): Promise<void> => {
    const { data, error } = await supabase.functions.invoke('student-pin-login', {
      body: { institutionCode, admissionNumber, pin },
    });

    if (error) {
      throw new Error('Login failed. Please try again.');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Invalid credentials');
    }

    // Store session
    localStorage.setItem(STORAGE_KEY, data.token);
    localStorage.setItem(STORAGE_EXPIRY_KEY, data.expiresAt);

    setStudent(data.student);
    setInstitution(data.institution);
  };

  // New OTP-based login
  const loginWithOtp = async (
    phone: string,
    code: string,
    entityId?: string
  ): Promise<void> => {
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { phone, code, userType: 'student', entityId },
    });

    if (error) {
      throw new Error('Verification failed. Please try again.');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Invalid OTP');
    }

    // Store session
    localStorage.setItem(STORAGE_KEY, data.token);
    localStorage.setItem(STORAGE_EXPIRY_KEY, data.expiresAt);

    setStudent(data.user);
    setInstitution(data.institution);
  };

  // One-click demo access (no OTP required)
  const loginDemo = async (): Promise<void> => {
    const { data, error } = await supabase.functions.invoke('demo-portal-access', {
      body: { userType: 'student' },
    });

    if (error) {
      throw new Error('Demo access failed. Please try again.');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Demo not available');
    }

    // Store session
    localStorage.setItem(STORAGE_KEY, data.token);
    localStorage.setItem(STORAGE_EXPIRY_KEY, data.expiresAt);

    setStudent(data.user);
    setInstitution(data.institution);
  };

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        institution,
        isAuthenticated: !!student,
        isLoading,
        login,
        loginWithOtp,
        loginDemo,
        logout,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}
