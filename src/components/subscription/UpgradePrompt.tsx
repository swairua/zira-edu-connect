import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  currentPlan: string;
  recommendedPlan?: string;
  featureNeeded?: string;
}

export function UpgradePrompt({
  open,
  onOpenChange,
  reason,
  currentPlan,
  recommendedPlan = 'Professional',
  featureNeeded,
}: UpgradePromptProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/settings');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Upgrade Required</DialogTitle>
          </div>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>
        
        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">{currentPlan}</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-3">
              <div>
                <p className="text-sm font-medium">Recommended</p>
                <p className="text-sm text-muted-foreground">{recommendedPlan}</p>
              </div>
              <Badge className="bg-primary">Upgrade</Badge>
            </div>
            
            {featureNeeded && (
              <p className="text-sm text-muted-foreground">
                The <strong>{featureNeeded}</strong> feature is available on the {recommendedPlan} plan and above.
              </p>
            )}
          </div>
        </DialogBody>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade}>
            View Upgrade Options
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
