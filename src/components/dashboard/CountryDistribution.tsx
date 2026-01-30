import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Globe } from 'lucide-react';

const countryFlags: Record<string, string> = {
  KE: '🇰🇪',
  UG: '🇺🇬',
  TZ: '🇹🇿',
  RW: '🇷🇼',
  NG: '🇳🇬',
  GH: '🇬🇭',
  ZA: '🇿🇦',
};

const COLORS = [
  'hsl(168 84% 32%)',
  'hsl(38 92% 50%)',
  'hsl(200 98% 39%)',
  'hsl(142 76% 36%)',
  'hsl(280 65% 45%)',
  'hsl(340 75% 55%)',
  'hsl(60 70% 45%)',
];

export function CountryDistribution() {
  const { data: stats, isLoading } = useDashboardStats();
  const distribution = stats?.countryDistribution || [];

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Institutions by country
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] rounded-lg" />
        ) : distribution.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Globe className="h-12 w-12 mb-2" />
            <p>No data yet</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(220 13% 91%)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => {
                    const item = distribution.find((d) => d.name === value);
                    return `${countryFlags[item?.code || ''] || '🌍'} ${value}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
