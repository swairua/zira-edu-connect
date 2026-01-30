import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSavedReports } from '@/hooks/useSavedReports';
import { Save } from 'lucide-react';

interface SaveReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: 'financial' | 'academic' | 'enrollment' | 'attendance' | 'custom';
  config?: Record<string, unknown>;
}

export function SaveReportDialog({ open, onOpenChange, reportType, config = {} }: SaveReportDialogProps) {
  const [name, setName] = useState('');
  const { saveReport } = useSavedReports();

  const handleSave = async () => {
    if (!name.trim()) return;
    
    await saveReport.mutateAsync({
      name: name.trim(),
      report_type: reportType,
      config,
    });
    
    setName('');
    onOpenChange(false);
  };

  const reportTypeLabels: Record<string, string> = {
    financial: 'Financial Report',
    academic: 'Academic Report',
    enrollment: 'Enrollment Report',
    attendance: 'Attendance Report',
    custom: 'Custom Report',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Report Configuration
          </DialogTitle>
          <DialogDescription>
            Save the current report filters for quick access later.
          </DialogDescription>
        </DialogHeader>
        
        <DialogBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="e.g., Monthly Fee Collection"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Type:</span> {reportTypeLabels[reportType]}
            </div>
          </div>
        </DialogBody>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saveReport.isPending}>
            {saveReport.isPending ? 'Saving...' : 'Save Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
