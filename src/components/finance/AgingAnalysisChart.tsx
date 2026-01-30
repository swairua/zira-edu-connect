import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import type { AgingBucket } from '@/hooks/useFinance';

interface AgingAnalysisChartProps {
  data: AgingBucket[];
  isLoading: boolean;
  currency?: string;
}

const bucketColors = [
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive) / 0.7)',
  'hsl(var(--destructive))',
];

function formatCurrency(amount: number, currency: string = 'KES'): string {
  if (amount >= 1000000) {
    return `${currency} ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${currency} ${(amount / 1000).toFixed(0)}K`;
  }
  return `${currency} ${amount}`;
}

export function AgingAnalysisChart({ data, isLoading, currency = 'KES' }: AgingAnalysisChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aging Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((bucket, index) => ({
    name: bucket.label,
    amount: bucket.amount,
    count: bucket.count,
    fill: bucketColors[index],
  }));

  const totalOutstanding = data.reduce((sum, b) => sum + b.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Aging Analysis</CardTitle>
          <span className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalOutstanding, currency)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.every(d => d.amount === 0) ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No outstanding balances
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis 
                  tickFormatter={(v) => formatCurrency(v, currency)}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value, currency), 'Amount']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend with counts */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {data.map((bucket, index) => (
                <div key={bucket.label} className="text-center">
                  <div 
                    className="mx-auto mb-1 h-3 w-3 rounded-full" 
                    style={{ backgroundColor: bucketColors[index] }}
                  />
                  <p className="text-xs font-medium">{bucket.label}</p>
                  <p className="text-xs text-muted-foreground">{bucket.count} students</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
