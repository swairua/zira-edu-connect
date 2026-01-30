import { Card, CardContent } from '@/components/ui/card';
import { UserX, Phone } from 'lucide-react';

export function NoStudentLinked() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <UserX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No Students Linked</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Your account is not linked to any student records yet.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3">
            <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">
              Please contact your school administrator
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
