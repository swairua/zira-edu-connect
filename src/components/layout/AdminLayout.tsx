import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { RefreshCw, Search, HelpCircle, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  headerBanner?: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminLayout({
  children,
  title,
  subtitle,
  actions,
  headerBanner,
  onRefresh,
  isRefreshing = false,
}: AdminLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      {!isMobile && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Banner (e.g., Demo Banner) */}
        {headerBanner}

        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
            {/* Mobile: Menu Button + Title */}
            <div className="flex items-center gap-3">
              {isMobile && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <Sidebar />
                  </SheetContent>
                </Sheet>
              )}
              
              {/* Title + Subtitle */}
              <div className="flex-shrink-0">
                <h1 className="text-lg font-semibold leading-tight">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate max-w-[300px] md:max-w-[400px]">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right Side: Search + Icons */}
            <div className="flex items-center gap-2 md:gap-3 ml-auto">
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..."
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

              {/* Custom actions */}
              {actions}

              {/* Help Icon */}
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
