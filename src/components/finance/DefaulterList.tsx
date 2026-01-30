import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Mail, Phone } from 'lucide-react';
import type { DefaulterStudent } from '@/hooks/useFinance';

interface DefaulterListProps {
  defaulters: DefaulterStudent[];
  isLoading: boolean;
  currency?: string;
}

function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DefaulterList({ defaulters, isLoading, currency = 'KES' }: DefaulterListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Defaulters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Defaulters</CardTitle>
            <Badge variant="destructive">{defaulters.length}</Badge>
          </div>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Send Reminders
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {defaulters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertTriangle className="mb-2 h-8 w-8" />
            <p>No defaulters found</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaulters.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.student_name}</p>
                        <p className="text-xs text-muted-foreground">ID: {student.student_id}</p>
                        {student.institution_name && (
                          <p className="text-xs text-muted-foreground">{student.institution_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{student.class || '-'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-destructive">
                        {formatCurrency(student.balance, currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {student.last_payment_date
                          ? formatDistanceToNow(new Date(student.last_payment_date), { addSuffix: true })
                          : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
