import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, XCircle, Database, Server, Globe, Shield } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  icon: typeof Server;
  latency?: number;
}

const services: ServiceStatus[] = [
  { name: 'Database', status: 'operational', icon: Database, latency: 12 },
  { name: 'API Server', status: 'operational', icon: Server, latency: 45 },
  { name: 'CDN', status: 'operational', icon: Globe, latency: 8 },
  { name: 'Authentication', status: 'operational', icon: Shield, latency: 23 },
];

const statusConfig = {
  operational: {
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
    label: 'Operational',
  },
  degraded: {
    icon: AlertCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    label: 'Degraded',
  },
  down: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    label: 'Down',
  },
};

export function SystemStatusIndicator() {
  const allOperational = services.every(s => s.status === 'operational');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">System Status</CardTitle>
          <div className={`flex items-center gap-1.5 text-sm ${allOperational ? 'text-success' : 'text-warning'}`}>
            <CheckCircle2 className="h-4 w-4" />
            {allOperational ? 'All Systems Operational' : 'Some Issues Detected'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service) => {
            const config = statusConfig[service.status];
            const ServiceIcon = service.icon;
            const StatusIcon = config.icon;

            return (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    {service.latency && (
                      <p className="text-xs text-muted-foreground">{service.latency}ms latency</p>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 ${config.color}`}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-sm">{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
