import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PortalType } from '@/config/portalBranding';
import { UnifiedSidebar } from './shared/UnifiedSidebar';
import { UnifiedHeader } from './shared/UnifiedHeader';
import { UnifiedBottomNav } from './shared/UnifiedBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { clearAllCaches } from '@/components/shared/PWAUpdatePrompt';

interface UnifiedPortalLayoutProps {
  children: ReactNode;
  portalType: PortalType;
  title?: string;
  subtitle?: string;
  userName?: string;
  userInitials?: string;
  institutionName?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: ReactNode;
  rightContent?: ReactNode;
  headerBanner?: ReactNode;
  customLogout?: () => void;
  authRedirect?: string;
}

export function UnifiedPortalLayout({
  children,
  portalType,
  title,
  subtitle,
  userName,
  userInitials,
  institutionName,
  isLoading = false,
  onRefresh,
  isRefreshing,
  actions,
  rightContent,
  headerBanner,
  customLogout,
  authRedirect = '/auth',
}: UnifiedPortalLayoutProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    // Clear PWA caches to ensure fresh content on next login
    await clearAllCaches();
    
    if (customLogout) {
      customLogout();
    } else {
      await signOut();
    }
    navigate(authRedirect);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Optional banner (e.g., demo mode) */}
      {headerBanner}

      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop/tablet) */}
        <UnifiedSidebar
          portalType={portalType}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <UnifiedHeader
            portalType={portalType}
            title={title}
            subtitle={subtitle}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            actions={actions}
            rightContent={rightContent}
          />

          {/* Main Content */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6"
            role="main"
          >
            {children}
          </main>
        </div>
      </div>

      {/* Bottom Navigation (mobile only) */}
      <UnifiedBottomNav portalType={portalType} onLogout={handleLogout} />
    </div>
  );
}
