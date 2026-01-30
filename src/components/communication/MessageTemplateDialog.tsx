import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMessageTemplates, type MessageTemplate } from '@/hooks/useCommunication';

interface MessageTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: MessageTemplate | null;
}

const CATEGORIES = [
  { value: 'fee_reminder', label: 'Fee Reminder' },
  { value: 'payment_confirmation', label: 'Payment Confirmation' },
  { value: 'general', label: 'General Notice' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'birthday', label: '🎂 Birthday Wishes' },
  { value: 'attendance_absent', label: '⚠️ Absence Alert' },
  { value: 'attendance_late', label: '⏰ Late Arrival' },
  { value: 'attendance_summary', label: '📋 Attendance Summary' },
  { value: 'assignment_due', label: '📝 Assignment Due' },
  { value: 'grade_published', label: '📊 Grade Published' },
  { value: 'report_ready', label: '📄 Report Card Ready' },
  { value: 'activity_reminder', label: '📅 Activity Reminder' },
  { value: 'library_due', label: '📖 Library Book Due' },
  { value: 'library_overdue', label: '📕 Library Overdue' },
  { value: 'transport_update', label: '🚌 Transport Update' },
];

const AVAILABLE_VARIABLES = [
  '{student_name}',
  '{parent_name}',
  '{amount}',
  '{balance}',
  '{due_date}',
  '{class_name}',
  '{school_name}',
  '{attendance_date}',
  '{attendance_status}',
  '{event_name}',
  '{event_date}',
  '{book_title}',
  '{return_date}',
  '{age}',
];

export function MessageTemplateDialog({ open, onOpenChange, template }: MessageTemplateDialogProps) {
  const { createTemplate, updateTemplate } = useMessageTemplates();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');

  const isEditing = !!template;

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setContent(template.content);
    } else {
      setName('');
      setCategory('general');
      setContent('');
    }
  }, [template, open]);

  // Extract variables used in content
  const usedVariables = AVAILABLE_VARIABLES.filter(v => content.includes(v));

  const insertVariable = (variable: string) => {
    setContent(prev => prev + variable);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      category,
      content,
      variables: usedVariables,
    };

    if (isEditing) {
      await updateTemplate.mutateAsync({ id: template.id, ...data });
    } else {
      await createTemplate.mutateAsync(data);
    }

    onOpenChange(false);
  };

  const charCount = content.length;
  const smsCredits = charCount === 0 ? 0 : Math.ceil(charCount / 160);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Create Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Fee Reminder - Overdue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message Content</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dear {parent_name}, your child {student_name} has a fee balance of {balance}..."
                  rows={5}
                  required
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{charCount}/160 characters ({smsCredits} SMS credit{smsCredits !== 1 ? 's' : ''})</span>
                  {usedVariables.length > 0 && (
                    <span>{usedVariables.length} variable{usedVariables.length !== 1 ? 's' : ''} used</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Click to insert variables</Label>
                <div className="flex flex-wrap gap-1">
                  {AVAILABLE_VARIABLES.map((variable) => (
                    <Badge
                      key={variable}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent font-mono text-xs"
                      onClick={() => insertVariable(variable)}
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name || !content || createTemplate.isPending || updateTemplate.isPending}
            >
              {(createTemplate.isPending || updateTemplate.isPending) 
                ? 'Saving...' 
                : (isEditing ? 'Save Changes' : 'Create Template')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
