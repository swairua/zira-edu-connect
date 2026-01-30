import { CheckCircle2, Clock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface SubmissionConfirmationProps {
  submittedAt: string;
  submittedByType: 'student' | 'parent';
  fileName?: string | null;
  isLate: boolean;
  onViewAssignments: () => void;
}

export function SubmissionConfirmation({
  submittedAt,
  submittedByType,
  fileName,
  isLate,
  onViewAssignments,
}: SubmissionConfirmationProps) {
  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
      <CardContent className="pt-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Assignment Submitted Successfully!
        </h3>
        
        <div className="space-y-2 text-sm text-green-700 dark:text-green-300 mb-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(submittedAt), 'MMM d, yyyy h:mm a')}</span>
          </div>
          
          {submittedByType === 'parent' && (
            <div className="flex items-center justify-center gap-2">
              <User className="h-4 w-4" />
              <span className="italic">Submitted by Parent/Guardian</span>
            </div>
          )}
          
          {fileName && (
            <p className="text-xs text-green-600 dark:text-green-400 truncate max-w-xs mx-auto">
              File: {fileName}
            </p>
          )}
          
          {isLate && (
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              Note: This submission was marked as late
            </p>
          )}
        </div>
        
        <Button onClick={onViewAssignments} className="mt-2">
          View All Assignments
        </Button>
      </CardContent>
    </Card>
  );
}
