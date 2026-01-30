import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  CreditCard,
  MessageSquare,
  UserPlus,
  Settings,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  {
    label: 'Add Institution',
    icon: Building2,
    href: '/institutions/new',
    variant: 'gradient' as const,
  },
  {
    label: 'Create User',
    icon: UserPlus,
    href: '/users/new',
    variant: 'outline' as const,
  },
  {
    label: 'Manage Plans',
    icon: CreditCard,
    href: '/subscriptions',
    variant: 'outline' as const,
  },
  {
    label: 'Send Broadcast',
    icon: MessageSquare,
    href: '/messaging',
    variant: 'outline' as const,
  },
  {
    label: 'Export Reports',
    icon: Download,
    href: '/reports',
    variant: 'outline' as const,
  },
  {
    label: 'System Settings',
    icon: Settings,
    href: '/settings',
    variant: 'outline' as const,
  },
];

export function QuickActions() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Common administrative tasks
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link to={action.href}>
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
