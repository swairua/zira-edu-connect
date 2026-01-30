import { Card, CardContent } from '@/components/ui/card';
import { Users, KeyRound, Clock, Shield } from 'lucide-react';
import type { Staff } from '@/hooks/useStaff';

interface StaffAccessOverviewCardProps {
  staff: Staff[];
  staffRoles: Record<string, string>;
}

export function StaffAccessOverviewCard({ staff, staffRoles }: StaffAccessOverviewCardProps) {
  const totalStaff = staff.length;
  const withLogin = staff.filter(s => s.user_id).length;
  const pendingLogin = staff.filter(s => !s.user_id && s.email).length;
  const noEmail = staff.filter(s => !s.user_id && !s.email).length;

  // Count by role
  const roleCounts = Object.values(staffRoles).reduce((acc, role) => {
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleLabels: Record<string, string> = {
    teacher: 'Teachers',
    finance_officer: 'Finance',
    accountant: 'Accountants',
    institution_admin: 'Admins',
    academic_director: 'Academic',
    hr_manager: 'HR',
    ict_admin: 'ICT',
    librarian: 'Library',
    institution_owner: 'Owners',
  };

  const topRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Stats Row */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStaff}</p>
                <p className="text-xs text-muted-foreground">Total Staff</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <KeyRound className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{withLogin}</p>
                <p className="text-xs text-muted-foreground">With Login</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingLogin}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          {topRoles.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">By Role:</span>
              <div className="flex flex-wrap gap-2">
                {topRoles.map(([role, count]) => (
                  <span key={role} className="font-medium">
                    {roleLabels[role] || role}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
