import { ReactNode } from 'react';
import { RefreshCw, Search, HelpCircle, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PortalType, getPortalBranding } from '@/config/portalBranding';

interface UnifiedHeaderProps {
  portalType: PortalType;
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: ReactNode;
  rightContent?: ReactNode;
  notificationCount?: number;
  onMobileMenuToggle?: () => void;
}

export function UnifiedHeader({
  portalType,
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
  actions,
  rightContent,
  notificationCount = 0,
}: UnifiedHeaderProps) {
  const branding = getPortalBranding(portalType);
  const BrandIcon = branding.icon;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Mobile: Portal Name */}
        <div className="flex items-center gap-3 md:hidden">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', branding.iconBgClass)}>
            <BrandIcon className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">{branding.shortName}</span>
        </div>

        {/* Desktop: Title + Subtitle */}
        <div className="hidden md:block flex-shrink-0">
          {title && (
            <h1 className="text-lg font-semibold leading-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate max-w-[400px]">{subtitle}</p>
          )}
        </div>

        {/* Right Side: Search + Icons */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={branding.searchPlaceholder}
              className="w-48 lg:w-64 pl-9 h-9 bg-muted/50"
            />
          </div>

          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh data"
              className="h-9 w-9"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          )}

          {/* Custom right content */}
          {rightContent}

          {/* Custom actions */}
          {actions}

          {/* Help Icon */}
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
