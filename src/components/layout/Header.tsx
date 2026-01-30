import { ReactNode } from 'react';
import { Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CampusSwitcher } from '@/components/group/CampusSwitcher';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="min-w-0 flex-1 max-w-md">
          <h1 className="font-display text-xl font-semibold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {actions && <div className="hidden lg:flex shrink-0">{actions}</div>}
      </div>

      <div className="flex items-center gap-4">
        {/* Campus Switcher for Group Users */}
        <CampusSwitcher />

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search institutions, users..."
            className="w-64 pl-9"
          />
        </div>

        {/* Help */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Notifications */}
        <NotificationCenter />
      </div>
    </header>
  );
}
