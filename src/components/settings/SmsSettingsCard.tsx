import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Save, 
  AlertTriangle,
  CheckCircle2,
  Phone,
  Megaphone,
  Info
} from 'lucide-react';
import { useSmsSettings } from '@/hooks/useSmsSettings';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function SmsSettingsCard() {
  const { settings, isLoading, updateSenderIds } = useSmsSettings();
  const [transactionalId, setTransactionalId] = useState('');
  const [promotionalId, setPromotionalId] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form values when settings load
  if (settings && !isInitialized) {
    setTransactionalId(settings.transactional_sender_id || settings.sender_name || '');
    setPromotionalId(settings.promotional_sender_id || settings.sender_name || '');
    setIsInitialized(true);
  }

  const handleSave = () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    updateSenderIds.mutate({
      transactional_sender_id: transactionalId.trim().toUpperCase(),
      promotional_sender_id: promotionalId.trim().toUpperCase(),
    });
    setShowConfirmDialog(false);
  };

  const hasChanges = settings && (
    transactionalId.toUpperCase() !== (settings.transactional_sender_id || settings.sender_name || '').toUpperCase() ||
    promotionalId.toUpperCase() !== (settings.promotional_sender_id || settings.sender_name || '').toUpperCase()
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>SMS Sender IDs (Platform-Wide)</CardTitle>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Super Admin Only
            </Badge>
          </div>
          <CardDescription>
            Configure sender IDs used by all institutions for SMS messaging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">RoberMS</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transactional Sender ID */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="transactional">Transactional Sender ID</Label>
            </div>
            <Input
              id="transactional"
              value={transactionalId}
              onChange={(e) => setTransactionalId(e.target.value.slice(0, 11))}
              placeholder="e.g., SCHOOL_OTP"
              maxLength={11}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Used for OTPs, fee reminders, attendance alerts. Max 11 characters.
            </p>
          </div>

          {/* Promotional Sender ID */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="promotional">Promotional Sender ID</Label>
            </div>
            <Input
              id="promotional"
              value={promotionalId}
              onChange={(e) => setPromotionalId(e.target.value.slice(0, 11))}
              placeholder="e.g., SCHOOL_SMS"
              maxLength={11}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Used for announcements, bulk messages, marketing. Max 11 characters.
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Sender ID Registration</AlertTitle>
            <AlertDescription>
              Sender IDs must be pre-registered with your SMS provider. Contact RoberMS to register 
              custom sender names before using them here.
            </AlertDescription>
          </Alert>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || updateSenderIds.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateSenderIds.isPending ? 'Saving...' : 'Save Sender IDs'}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Sender ID Changes
            </DialogTitle>
            <DialogDescription>
              Changing sender IDs may affect SMS delivery. Make sure these IDs are registered with your SMS provider.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">Transactional</span>
              <Badge variant="outline">{transactionalId.toUpperCase() || 'Not set'}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">Promotional</span>
              <Badge variant="outline">{promotionalId.toUpperCase() || 'Not set'}</Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave}>
              Confirm Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
