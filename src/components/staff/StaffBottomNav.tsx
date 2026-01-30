import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  ClipboardList, 
  User, 
  LogOut, 
  UserCheck, 
  MessageSquare, 
  MoreHorizontal, 
  PenLine,
  Wallet,
  Users,
  FileText,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles?: string[];
  permission?: { domain: string; action: string };
}

// Teacher-specific navigation
const teacherNavItems: NavItem[] = [
  { path: '/portal', icon: Home, label: 'Home' },
  { path: '/portal/classes', icon: BookOpen, label: 'Classes' },
  { path: '/portal/attendance', icon: UserCheck, label: 'Attendance' },
  { path: '/portal/assignments', icon: ClipboardList, label: 'Tasks' },
];

const teacherMoreItems: NavItem[] = [
  { path: '/portal/timetable', icon: Calendar, label: 'Timetable' },
  { path: '/portal/grades', icon: PenLine, label: 'Grades' },
  { path: '/portal/messages', icon: MessageSquare, label: 'Messages' },
  { path: '/portal/profile', icon: User, label: 'Profile' },
];

// Finance staff navigation (accountant, finance_officer)
const financeNavItems: NavItem[] = [
  { path: '/portal', icon: Home, label: 'Home' },
  { path: '/portal/finance', icon: Wallet, label: 'Finance' },
  { path: '/payments', icon: FileText, label: 'Payments' },
];

const financeMoreItems: NavItem[] = [
  { path: '/invoices', icon: FileText, label: 'Invoices' },
  { path: '/portal/profile', icon: User, label: 'Profile' },
];

// HR staff navigation
const hrNavItems: NavItem[] = [
  { path: '/portal', icon: Home, label: 'Home' },
  { path: '/staff', icon: Users, label: 'Staff' },
];

const hrMoreItems: NavItem[] = [
  { path: '/portal/profile', icon: User, label: 'Profile' },
];

// Academic director navigation
const academicNavItems: NavItem[] = [
  { path: '/portal', icon: Home, label: 'Home' },
  { path: '/portal/classes', icon: BookOpen, label: 'Classes' },
  { path: '/exams', icon: FileText, label: 'Exams' },
  { path: '/grade-approvals', icon: PenLine, label: 'Approvals' },
];

const academicMoreItems: NavItem[] = [
  { path: '/results', icon: FileText, label: 'Results' },
  { path: '/portal/profile', icon: User, label: 'Profile' },
];

export function StaffBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, userRoles, hasRole } = useAuth();
  const { can } = usePermissions();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Determine which navigation to show based on role
  const getNavItems = (): { main: NavItem[]; more: NavItem[] } => {
    // Check roles in order of specificity
    if (hasRole('finance_officer') || hasRole('accountant')) {
      return { main: financeNavItems, more: financeMoreItems };
    }
    if (hasRole('hr_manager')) {
      return { main: hrNavItems, more: hrMoreItems };
    }
    if (hasRole('academic_director')) {
      return { main: academicNavItems, more: academicMoreItems };
    }
    // Default to teacher navigation
    return { main: teacherNavItems, more: teacherMoreItems };
  };

  const { main: navItems, more: moreItems } = getNavItems();
  const isMoreActive = moreItems.some(item => location.pathname === item.path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-pb">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        
        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                isMoreActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-2">
            {moreItems.map((item) => (
              <DropdownMenuItem
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  location.pathname === item.path && 'bg-accent'
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
