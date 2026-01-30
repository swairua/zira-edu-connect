import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Clock, AlertTriangle, CheckCircle2, Timer } from 'lucide-react';
import { validateDeadlineSequence } from '@/hooks/useExamDeadlines';
import { format, addDays } from 'date-fns';

export interface TimelineFormData {
  draft_deadline: string;
  correction_deadline: string;
  final_deadline: string;
  allow_late_submission: boolean;
  late_submission_penalty_percent: string;
}

interface ExamTimelineSettingsProps {
  endDate: string;
  value: TimelineFormData;
  onChange: (data: TimelineFormData) => void;
}

export function ExamTimelineSettings({ endDate, value, onChange }: ExamTimelineSettingsProps) {
  const validation = validateDeadlineSequence(
    endDate || null,
    value.draft_deadline || null,
    value.correction_deadline || null,
    value.final_deadline || null
  );

  const handleChange = (field: keyof TimelineFormData, fieldValue: string | boolean) => {
    onChange({ ...value, [field]: fieldValue });
  };

  // Quick presets
  const applyPreset = (preset: 'standard' | 'short' | 'extended') => {
    if (!endDate) return;
    
    const end = new Date(endDate);
    let draft: Date, correction: Date, final: Date;

    switch (preset) {
      case 'standard':
        draft = addDays(end, 7);
        correction = addDays(end, 10);
        final = addDays(end, 14);
        break;
      case 'short':
        draft = addDays(end, 3);
        correction = addDays(end, 5);
        final = addDays(end, 7);
        break;
      case 'extended':
        draft = addDays(end, 14);
        correction = addDays(end, 21);
        final = addDays(end, 28);
        break;
    }

    onChange({
      ...value,
      draft_deadline: format(draft, "yyyy-MM-dd'T'HH:mm"),
      correction_deadline: format(correction, "yyyy-MM-dd'T'HH:mm"),
      final_deadline: format(final, "yyyy-MM-dd'T'HH:mm"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <h4 className="font-medium">Grading Timeline</h4>
      </div>

      <p className="text-sm text-muted-foreground">
        Configure deadlines for teachers to submit draft results, make corrections, and finalize scores.
      </p>

      {/* Quick Presets */}
      {endDate && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Quick presets:</span>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-accent"
            onClick={() => applyPreset('short')}
          >
            Short (7 days)
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-accent"
            onClick={() => applyPreset('standard')}
          >
            Standard (14 days)
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-accent"
            onClick={() => applyPreset('extended')}
          >
            Extended (28 days)
          </Badge>
        </div>
      )}

      <Separator />

      {/* Timeline Visual */}
      <div className="relative">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Exam End</span>
          <span>Draft</span>
          <span>Corrections</span>
          <span>Final</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          <div className="h-full bg-primary/30 flex-1" />
          <div className="h-full bg-primary/50 flex-1" />
          <div className="h-full bg-primary/70 flex-1" />
          <div className="h-full bg-primary flex-1" />
        </div>
      </div>

      {/* Deadline Inputs */}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="draft_deadline" className="flex items-center gap-2">
            <Timer className="h-3.5 w-3.5" />
            Draft Submission Deadline
          </Label>
          <Input
            id="draft_deadline"
            type="datetime-local"
            value={value.draft_deadline}
            onChange={(e) => handleChange('draft_deadline', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Teachers can save draft scores until this deadline
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="correction_deadline" className="flex items-center gap-2">
            <Timer className="h-3.5 w-3.5" />
            Correction Window Deadline
          </Label>
          <Input
            id="correction_deadline"
            type="datetime-local"
            value={value.correction_deadline}
            onChange={(e) => handleChange('correction_deadline', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Window for reviewing and correcting draft scores
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="final_deadline" className="flex items-center gap-2">
            <Timer className="h-3.5 w-3.5" />
            Final Submission Deadline
          </Label>
          <Input
            id="final_deadline"
            type="datetime-local"
            value={value.final_deadline}
            onChange={(e) => handleChange('final_deadline', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Final deadline for submitting scores for approval
          </p>
        </div>
      </div>

      <Separator />

      {/* Late Submission Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allow_late">Allow Late Submissions</Label>
            <p className="text-xs text-muted-foreground">
              Teachers can submit after the final deadline
            </p>
          </div>
          <Switch
            id="allow_late"
            checked={value.allow_late_submission}
            onCheckedChange={(checked) => handleChange('allow_late_submission', checked)}
          />
        </div>

        {value.allow_late_submission && (
          <div className="grid gap-2">
            <Label htmlFor="penalty">Late Submission Penalty (%)</Label>
            <Input
              id="penalty"
              type="number"
              min={0}
              max={100}
              value={value.late_submission_penalty_percent}
              onChange={(e) => handleChange('late_submission_penalty_percent', e.target.value)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Percentage penalty applied to late submissions (0 = no penalty)
            </p>
          </div>
        )}
      </div>

      {/* Validation Feedback */}
      {!validation.valid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validation.error}</AlertDescription>
        </Alert>
      )}

      {validation.valid && value.draft_deadline && value.final_deadline && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Timeline is valid. Teachers will have from exam end until{' '}
            {value.final_deadline ? format(new Date(value.final_deadline), 'MMM d, yyyy') : '—'} to complete grading.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
