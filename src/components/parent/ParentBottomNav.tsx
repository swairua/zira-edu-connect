import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, CreditCard, LogOut, User, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

// Synced with parentNavigation in unifiedNavigation.ts
const navItems = [
  { label: 'Home', href: '/parent', icon: Home },
  { label: 'Children', href: '/parent/children', icon: User },
  { label: 'Fees', href: '/parent/fees', icon: CreditCard },
  { label: 'Messages', href: '/parent/messages', icon: MessageSquare },
];

export function ParentBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    // Clear any parent session token if stored
    localStorage.removeItem('parent_session_token');
    localStorage.removeItem('parent_session_expiry');
    await signOut();
    navigate('/auth');
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-area-pb"
      aria-label="Parent portal navigation"
      role="navigation"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href !== '/parent' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors touch-manipulation',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} aria-hidden="true" />
              <span className={cn(
                'text-xs',
                isActive ? 'font-medium' : 'font-normal'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-muted-foreground hover:text-destructive transition-colors touch-manipulation"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-normal">Logout</span>
        </button>
      </div>
    </nav>
  );
}
