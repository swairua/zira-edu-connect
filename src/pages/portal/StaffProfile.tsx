import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useAuth } from '@/hooks/useAuth';
import { roleLabels } from '@/types/permissions';
import { format } from 'date-fns';
import { User, Mail, Phone, Building, Briefcase, Calendar, Shield, Key } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';

export default function StaffProfile() {
  const { user, userRoles } = useAuth();
  const { data: profile, isLoading } = useStaffProfile();

  return (
    <PortalLayout title="My Profile" subtitle="View your account details">
      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-6 w-48" />
                ))}
              </div>
            ) : profile ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {profile.first_name} {profile.middle_name} {profile.last_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Employee Number</p>
                  <p className="font-medium">{profile.employee_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium">{profile.email || user?.email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium">{profile.phone || '-'}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No staff profile found. Please contact your administrator.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-6 w-40" />
                ))}
              </div>
            ) : profile ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building className="h-3 w-3" /> Department
                  </p>
                  <p className="font-medium">{profile.department || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium">{profile.designation || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Employment Type</p>
                  <Badge variant="outline" className="capitalize">
                    {profile.employment_type || 'Permanent'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date Joined
                  </p>
                  <p className="font-medium">
                    {profile.date_joined
                      ? format(new Date(profile.date_joined), 'PP')
                      : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{profile.institution?.name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Roles & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles & Access
            </CardTitle>
            <CardDescription>Your system roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userRoles.length > 0 ? (
                userRoles.map(role => (
                  <Badge key={role.role} variant="secondary" className="text-sm">
                    {roleLabels[role.role] || role.role}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No roles assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <ChangePasswordDialog />
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
