import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'parent_session_token';
const EXPIRY_KEY = 'parent_session_expiry';
const VERIFIED_KEY = 'parent_session_verified';

export interface LinkedStudent {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  classId?: string;
  className?: string;
}

interface ParentProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  institutionId: string;
  students: LinkedStudent[];
}

interface Institution {
  id: string;
  name: string;
  code: string;
}

interface ParentAuthContextType {
  parent: ParentProfile | null;
  institution: Institution | null;
  linkedStudents: LinkedStudent[];
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const ParentAuthContext = createContext<ParentAuthContextType | undefined>(undefined);

export function ParentAuthProvider({ children }: { children: React.ReactNode }) {
  // Try to get initial state from stored session data for faster hydration
  const getInitialState = () => {
    if (typeof window === 'undefined') return { parent: null, institution: null, students: [] };
    const storedData = localStorage.getItem('parent_session_data');
    const token = localStorage.getItem(STORAGE_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);
    
    // Only use stored data if we have a valid, non-expired token
    if (storedData && token && expiry && new Date(expiry) > new Date()) {
      try {
        const parsed = JSON.parse(storedData);
        return {
          parent: parsed.parent ? {
            id: parsed.parent.id,
            firstName: parsed.parent.firstName,
            lastName: parsed.parent.lastName,
            phone: parsed.parent.phone || null,
            email: parsed.parent.email || null,
            institutionId: parsed.parent.institutionId,
            students: parsed.parent.students || [],
          } : null,
          institution: parsed.institution || null,
          students: parsed.parent?.students || [],
        };
      } catch { /* ignore parse errors */ }
    }
    return { parent: null, institution: null, students: [] };
  };

  const initialState = getInitialState();
  const [parent, setParent] = useState<ParentProfile | null>(initialState.parent);
  const [institution, setInstitution] = useState<Institution | null>(initialState.institution);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>(initialState.students);
  const [isLoading, setIsLoading] = useState(!initialState.parent); // Not loading if we have initial state

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(VERIFIED_KEY);
    localStorage.removeItem('parent_session_data');
    setParent(null);
    setInstitution(null);
    setLinkedStudents([]);
  }, []);

  const verifySession = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);

    if (!token) {
      setIsLoading(false);
      return;
    }

    // If we already have parent data from initial state, just verify in background
    // Don't clear verified flag until we know verification failed
    if (expiry && new Date(expiry) < new Date()) {
      clearSession();
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-parent-session', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error || !data?.valid) {
        // Only clear session if verification explicitly failed
        clearSession();
        setIsLoading(false);
        return;
      }

      // Mark session as verified so the messages hook knows this is a valid OTP session
      localStorage.setItem(VERIFIED_KEY, 'true');
      
      setParent(data.parent);
      setInstitution(data.institution);
      
      // Store linked students from the verified session - this avoids RLS issues
      if (data.parent?.students && Array.isArray(data.parent.students)) {
        setLinkedStudents(data.parent.students);
      }
    } catch (err) {
      console.error('Parent session verification failed:', err);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const logout = useCallback(() => {
    clearSession();
    window.location.href = '/auth';
  }, [clearSession]);

  const value: ParentAuthContextType = {
    parent,
    institution,
    linkedStudents,
    isAuthenticated: !!parent,
    isLoading,
    logout,
    refreshSession: verifySession,
  };

  return (
    <ParentAuthContext.Provider value={value}>
      {children}
    </ParentAuthContext.Provider>
  );
}

export function useParentAuth() {
  const context = useContext(ParentAuthContext);
  if (context === undefined) {
    throw new Error('useParentAuth must be used within a ParentAuthProvider');
  }
  return context;
}
