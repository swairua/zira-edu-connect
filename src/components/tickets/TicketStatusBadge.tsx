import { Badge } from '@/components/ui/badge';
import { Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface TicketStatusBadgeProps {
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

const statusConfig = {
  open: {
    label: 'Open',
    variant: 'default' as const,
    icon: Clock,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'secondary' as const,
    icon: Loader2,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  resolved: {
    label: 'Resolved',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  closed: {
    label: 'Closed',
    variant: 'outline' as const,
    icon: XCircle,
    className: 'bg-muted text-muted-foreground hover:bg-muted',
  },
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
