import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CalendarDays } from 'lucide-react';
import type { MyLeaveBalance } from '@/hooks/useMyLeave';

interface LeaveBalanceCardProps {
  balances: MyLeaveBalance[];
  isLoading?: boolean;
}

export function LeaveBalanceCard({ balances, isLoading }: LeaveBalanceCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Leave Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-2 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balances.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Leave Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No leave balances configured for this year. Contact HR.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Leave Balances ({new Date().getFullYear()})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {balances.map(balance => {
            const total = balance.entitled_days + balance.carried_days;
            const remaining = total - balance.used_days;
            const percentUsed = total > 0 ? (balance.used_days / total) * 100 : 0;

            return (
              <div key={balance.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {balance.leave_type?.name || 'Unknown'}
                  </span>
                  <span className="text-muted-foreground">
                    {remaining} / {total} days remaining
                  </span>
                </div>
                <Progress value={100 - percentUsed} className="h-2" />
                {balance.carried_days > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Includes {balance.carried_days} carried forward
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
