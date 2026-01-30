import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsBackHeader } from '@/components/settings/SettingsBackHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, 
  Key, 
  Smartphone, 
  History, 
  AlertTriangle,
  CheckCircle,
  LogOut,
} from 'lucide-react';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { format } from 'date-fns';

export default function Security() {
  const { user } = useAuth();

  const lastLogin = user?.last_sign_in_at 
    ? format(new Date(user.last_sign_in_at), 'PPpp')
    : 'Unknown';

  return (
    <DashboardLayout title="Security">
      <div className="space-y-6">
        <SettingsBackHeader 
          title="Security Settings" 
          description="Manage your account security and access" 
        />

        {/* Security Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>Your account security overview</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="font-medium">Your account is secure</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Last sign in: {lastLogin}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use a strong password with at least 8 characters including uppercase, lowercase, numbers, and symbols.
              </p>
              <ChangePasswordDialog trigger={
                <Button className="w-full">Update Password</Button>
              } />
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium">2FA is not enabled</p>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with two-factor authentication
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage your active login sessions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Current Session</p>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user?.email} • Last active: Now
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button variant="destructive" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out All Other Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
