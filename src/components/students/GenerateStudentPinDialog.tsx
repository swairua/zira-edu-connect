import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Copy, Phone, Key } from 'lucide-react';
import { useStudentParents } from '@/hooks/useStudentParents';

interface GenerateStudentPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

export function GenerateStudentPinDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  onSuccess,
}: GenerateStudentPinDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  
  const { data: parents } = useStudentParents(studentId);
  const primaryParent = parents?.find(p => p.is_primary) || parents?.[0];

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedPin(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-student-pin', {
        body: { studentId, sendSms },
      });

      if (error) throw error;

      if (data?.success) {
        if (data.pin) {
          setGeneratedPin(data.pin);
          toast.success('PIN generated successfully');
        } else {
          toast.success('PIN sent via SMS to parent');
          onOpenChange(false);
        }
        onSuccess?.();
      } else {
        throw new Error(data?.error || 'Failed to generate PIN');
      }
    } catch (error: any) {
      console.error('Error generating PIN:', error);
      toast.error(error.message || 'Failed to generate PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPin = () => {
    if (generatedPin) {
      navigator.clipboard.writeText(generatedPin);
      toast.success('PIN copied to clipboard');
    }
  };

  const handleClose = () => {
    setGeneratedPin(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Generate Backup PIN
          </DialogTitle>
          <DialogDescription>
            Generate a backup login PIN for {studentName}. Use this when OTP login is unavailable.
          </DialogDescription>
        </DialogHeader>

        {!generatedPin ? (
          <div className="space-y-4 py-4">
            {primaryParent && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{primaryParent.parent.first_name} {primaryParent.parent.last_name}</p>
                  <p className="text-muted-foreground">{primaryParent.parent.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="send-sms" className="flex flex-col gap-1">
                <span>Send PIN via SMS</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {primaryParent ? "Send to parent's phone" : "No parent linked"}
                </span>
              </Label>
              <Switch
                id="send-sms"
                checked={sendSms}
                onCheckedChange={setSendSms}
                disabled={!primaryParent}
              />
            </div>
          </div>
        ) : (
          <div className="py-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Share this PIN with the student. It expires in 24 hours.
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-3xl font-mono font-bold tracking-widest bg-muted px-4 py-2 rounded-lg">
                  {generatedPin}
                </code>
                <Button variant="outline" size="icon" onClick={copyPin}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!generatedPin ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate PIN
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
