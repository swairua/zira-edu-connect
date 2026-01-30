import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LimitWarningBannerProps {
  type: 'students' | 'staff';
  remaining: number;
  planName: string;
  isLimitReached?: boolean;
}

export function LimitWarningBanner({ 
  type, 
  remaining, 
  planName, 
  isLimitReached = false 
}: LimitWarningBannerProps) {
  const navigate = useNavigate();
  
  if (isLimitReached) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>
          {type === 'students' ? 'Student' : 'Staff'} Limit Reached
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            You've reached the maximum number of {type} for your {planName} plan.
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/settings')}
            className="ml-4 shrink-0"
          >
            Upgrade Plan <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="mb-4 border-warning bg-warning/10">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning">
        Approaching {type === 'students' ? 'Student' : 'Staff'} Limit
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          You have {remaining} {type} slot{remaining !== 1 ? 's' : ''} remaining on your {planName} plan.
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/settings')}
          className="ml-4 shrink-0"
        >
          Upgrade Plan <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
