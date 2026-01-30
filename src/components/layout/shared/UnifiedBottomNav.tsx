import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalType, getPortalBranding } from '@/config/portalBranding';
import { getUnifiedNavigation, UnifiedNavItem } from '@/config/unifiedNavigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UnifiedBottomNavProps {
  portalType: PortalType;
  onLogout: () => void;
}

export function UnifiedBottomNav({ portalType, onLogout }: UnifiedBottomNavProps) {
  const location = useLocation();
  const branding = getPortalBranding(portalType);
  const navigation = getUnifiedNavigation(portalType);

  // Take first 4 main items for bottom nav
  const mainItems = navigation.main.slice(0, 4);
  const moreItems = [...navigation.main.slice(4), ...navigation.secondary];
  const hasMore = moreItems.length > 0;

  const isActive = (path: string) => {
    // Exact match for home routes
    if (path === '/dashboard' || path === '/portal' || path === '/student' || path === '/parent' || path === '/staff') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item }: { item: UnifiedNavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <NavLink
        to={item.path}
        className={cn(
          'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors touch-manipulation',
          active ? branding.accentClass : 'text-muted-foreground hover:text-foreground'
        )}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
        <span className={cn('font-medium', active && 'font-semibold')}>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden safe-area-pb"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {mainItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        {/* More dropdown or Logout */}
        {hasMore ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                aria-label="More options"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="font-medium">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mb-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.path} asChild>
                    <NavLink
                      to={item.path}
                      className={cn(
                        'flex items-center gap-2 cursor-pointer',
                        isActive(item.path) && branding.accentClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors touch-manipulation"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}
