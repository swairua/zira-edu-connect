import { 
  UserPlus, 
  Receipt, 
  ClipboardCheck, 
  FileText, 
  Bell,
  GraduationCap,
  Users,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  path: string;
  domain: 'students' | 'finance' | 'academics' | 'staff_hr' | 'system_settings';
  action: 'view' | 'create' | 'edit';
  variant?: 'default' | 'secondary' | 'outline';
}

const quickActions: QuickAction[] = [
  { label: 'Add Student', icon: UserPlus, path: '/students/new', domain: 'students', action: 'create' },
  { label: 'Record Payment', icon: Receipt, path: '/payments', domain: 'finance', action: 'create' },
  { label: 'Mark Attendance', icon: ClipboardCheck, path: '/attendance', domain: 'academics', action: 'edit' },
  { label: 'Generate Invoices', icon: FileText, path: '/invoices', domain: 'finance', action: 'create' },
  { label: 'Send Reminders', icon: Bell, path: '/finance', domain: 'finance', action: 'edit' },
  { label: 'View Students', icon: GraduationCap, path: '/students', domain: 'students', action: 'view' },
  { label: 'Manage Staff', icon: Users, path: '/staff', domain: 'staff_hr', action: 'view' },
  { label: 'Fee Structure', icon: Settings, path: '/fees', domain: 'finance', action: 'view' },
];

export function InstitutionQuickActions() {
  const navigate = useNavigate();
  const { can } = usePermissions();

  // Filter actions based on user permissions
  const availableActions = quickActions.filter(
    action => can(action.domain, action.action)
  );

  // Show max 6 actions
  const displayedActions = availableActions.slice(0, 6);

  if (displayedActions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {displayedActions.map((action) => (
            <Button
              key={action.path + action.label}
              variant="outline"
              className="justify-start gap-2 h-auto py-3"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-4 w-4 text-primary" />
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
