import { Badge } from '@/components/ui/badge';

interface TicketPriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const priorityConfig = {
  low: {
    label: 'Low',
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
  medium: {
    label: 'Medium',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  high: {
    label: 'High',
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  },
  urgent: {
    label: 'Urgent',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
};

export function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
