import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAnnouncements, type Announcement } from '@/hooks/useAnnouncements';

interface EditAnnouncementDialogProps {
  announcement: Announcement | null;
  onOpenChange: (open: boolean) => void;
}

const audienceOptions = [
  { id: 'parents', label: 'Parents' },
  { id: 'students', label: 'Students' },
  { id: 'staff', label: 'Staff' },
];

export function EditAnnouncementDialog({ announcement, onOpenChange }: EditAnnouncementDialogProps) {
  const { updateAnnouncement } = useAnnouncements();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [audience, setAudience] = useState<string[]>([]);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setPriority(announcement.priority);
      setAudience(announcement.audience);
    }
  }, [announcement]);

  const handleAudienceChange = (id: string, checked: boolean) => {
    if (checked) {
      setAudience([...audience, id]);
    } else {
      setAudience(audience.filter(a => a !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement) return;

    await updateAnnouncement.mutateAsync({
      id: announcement.id,
      title,
      content,
      priority,
      audience,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={!!announcement} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your announcement..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <div className="flex gap-4">
                  {audienceOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${option.id}`}
                        checked={audience.includes(option.id)}
                        onCheckedChange={(checked) => handleAudienceChange(option.id, !!checked)}
                      />
                      <label htmlFor={`edit-${option.id}`} className="text-sm cursor-pointer">
                        {option.label}
                      </label>
                    </div>
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
              disabled={!title || !content || audience.length === 0 || updateAnnouncement.isPending}
            >
              {updateAnnouncement.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
