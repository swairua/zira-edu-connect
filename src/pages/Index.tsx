import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInstitution } from '@/contexts/InstitutionContext';
import Dashboard from './Dashboard';
import InstitutionDashboard from './InstitutionDashboard';
import { NoInstitutionView } from '@/components/admin/NoInstitutionView';
import { Loader2 } from 'lucide-react';
import {
  INSTITUTION_ADMIN_ROLES,
  STAFF_PORTAL_ROLES,
  hasAnyRole,
  hasRole,
  isParentOnly,
  isStaffOnly,
} from '@/lib/roles';

const Index = () => {
  const { isSuperAdmin, isSupportAdmin, loading: authLoading, userRoles, rolesLoading } = useAuth();
  const { institutionId, isLoading: institutionLoading } = useInstitution();

  // Show loading while determining user type (include rolesLoading)
  if (authLoading || institutionLoading || rolesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Parents should never see this page - redirect to parent portal
  const parentOnly = isParentOnly(userRoles, isSuperAdmin, isSupportAdmin);
  if (parentOnly) {
    return <Navigate to="/parent" replace />;
  }

  // Staff-only users should be redirected to staff portal
  const staffOnly = isStaffOnly(userRoles, isSuperAdmin, isSupportAdmin);
  if (staffOnly) {
    return <Navigate to="/portal" replace />;
  }

  // Super admins and support admins see platform dashboard
  if (isSuperAdmin || isSupportAdmin) {
    return <Dashboard />;
  }

  // Institution admins see their institution dashboard
  if (hasAnyRole(userRoles, INSTITUTION_ADMIN_ROLES) && institutionId) {
    return <InstitutionDashboard />;
  }

  // Fallback for users without institution
  return <NoInstitutionView />;
};

export default Index;
