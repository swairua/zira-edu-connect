import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecentInstitutions } from '@/hooks/useDashboardStats';
import { institutionTypeLabels, countryOptions } from '@/types/database';
import { ArrowRight, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusVariants: Record<string, 'success' | 'warning' | 'info' | 'destructive'> = {
  active: 'success',
  pending: 'warning',
  trial: 'info',
  suspended: 'destructive',
};

export function RecentInstitutions() {
  const { data: recentInstitutions = [], isLoading } = useRecentInstitutions(5);

  const getCountryFlag = (code: string) => {
    return countryOptions.find((c) => c.value === code)?.flag || '🌍';
  };

  return (
    <Card variant="elevated" className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Institutions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest registered institutions across all countries
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/institutions">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))
          ) : recentInstitutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-2" />
              <p>No institutions yet</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/institutions/new">Add your first institution</Link>
              </Button>
            </div>
          ) : (
            recentInstitutions.map((institution) => (
              <div
                key={institution.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{institution.name}</p>
                      <span className="text-lg">{getCountryFlag(institution.country)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{institutionTypeLabels[institution.type]}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {institution.student_count.toLocaleString()} students
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={statusVariants[institution.status]}>
                    {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
                  </Badge>
                  <Badge variant="muted">{institution.subscription_plan}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
