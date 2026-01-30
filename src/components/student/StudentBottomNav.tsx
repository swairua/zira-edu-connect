import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Award, Wallet, LogOut, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { path: '/student', icon: Home, label: 'Home' },
  { path: '/student/timetable', icon: Calendar, label: 'Timetable' },
  { path: '/student/assignments', icon: BookOpen, label: 'Tasks' },
  { path: '/student/results', icon: Award, label: 'Results' },
];

export function StudentBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout: studentLogout, isAuthenticated: isOtpAuth } = useStudentAuth();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    if (isOtpAuth) {
      studentLogout();
    } else {
      await signOut();
    }
    navigate('/auth');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-pb">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-indigo-600 dark:text-indigo-400')} />
              <span className={cn('font-medium', isActive && 'text-indigo-600 dark:text-indigo-400')}>
                {label}
              </span>
            </NavLink>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
