import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jul', revenue: 1800000 },
  { month: 'Aug', revenue: 2100000 },
  { month: 'Sep', revenue: 2000000 },
  { month: 'Oct', revenue: 2400000 },
  { month: 'Nov', revenue: 2300000 },
  { month: 'Dec', revenue: 2650000 },
  { month: 'Jan', revenue: 2850000 },
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `KES ${(value / 1000000).toFixed(1)}M`;
  }
  return `KES ${(value / 1000).toFixed(0)}K`;
};

export function RevenueChart() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly subscription revenue (Last 7 months)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(168 84% 32%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(168 84% 32%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(220 10% 46%)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: 'hsl(220 10% 46%)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(220 13% 91%)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(168 84% 32%)"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
