import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import { StudentProvider } from '@/contexts/StudentContext';
import { Loader2 } from 'lucide-react';

interface StudentRouteProps {
  children: ReactNode;
}

export function StudentRoute({ children }: StudentRouteProps) {
  const { user, loading, hasRole, isSuperAdmin, isSupportAdmin } = useAuth();
  const { isAuthenticated: isStudentPinAuthenticated, isLoading: studentLoading, student } = useStudentAuth();

  if (loading || studentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if authenticated via PIN login
  if (isStudentPinAuthenticated && student) {
    return (
      <StudentProvider studentId={student.id} institutionId={student.institutionId}>
        {children}
      </StudentProvider>
    );
  }

  // Not authenticated via Supabase Auth - redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ tab: 'student' }} replace />;
  }

  // Check if user has student role (Supabase Auth)
  const isStudent = hasRole('student');

  // If not a student and not an admin viewing, redirect to appropriate dashboard
  if (!isStudent) {
    if (hasRole('parent') && !isSuperAdmin && !isSupportAdmin) {
      return <Navigate to="/parent" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <StudentProvider>
      {children}
    </StudentProvider>
  );
}
