import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronDown, ChevronRight, Bell, Edit2, RotateCcw, Mail, MessageSquare, Smartphone } from 'lucide-react';
import {
  useInstitutionNotificationSettings,
  NOTIFICATION_CATEGORIES,
  type NotificationCategoryItem,
} from '@/hooks/useInstitutionNotificationSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const CHANNEL_OPTIONS = [
  { id: 'sms', label: 'SMS', icon: Smartphone },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'in_app', label: 'In-App', icon: MessageSquare },
];

interface TemplateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: NotificationCategoryItem;
  currentTemplate: string;
  isCustom: boolean;
  onSave: (template: string | null) => void;
  isPending: boolean;
}

function TemplateEditDialog({
  open,
  onOpenChange,
  item,
  currentTemplate,
  isCustom,
  onSave,
  isPending,
}: TemplateEditDialogProps) {
  const [template, setTemplate] = useState(currentTemplate);

  const handleSave = () => {
    onSave(template === item.defaultTemplate ? null : template);
  };

  const handleReset = () => {
    setTemplate(item.defaultTemplate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Template: {item.label}</DialogTitle>
          <DialogDescription>
            Customize the message template for this notification type. Use variables like{' '}
            {'{student_name}'}, {'{school_name}'}, etc.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Message Template</Label>
              {isCustom && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset to Default
                </Button>
              )}
            </div>
            <Textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {template.length}/320 characters ({Math.ceil(template.length / 160)} SMS credits)
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Available Variables:</p>
            <div className="flex flex-wrap gap-1">
              {[
                '{student_name}',
                '{parent_name}',
                '{school_name}',
                '{class_name}',
                '{amount}',
                '{balance}',
                '{due_date}',
                '{attendance_date}',
                '{event_name}',
                '{book_title}',
              ].map((variable) => (
                <Badge
                  key={variable}
                  variant="outline"
                  className="cursor-pointer font-mono text-xs hover:bg-accent"
                  onClick={() => setTemplate((prev) => prev + variable)}
                >
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface NotificationItemRowProps {
  item: NotificationCategoryItem;
  isEnabled: boolean;
  channels: string[];
  template: string;
  isCustomTemplate: boolean;
  onToggle: (enabled: boolean) => void;
  onChannelChange: (channels: string[]) => void;
  onTemplateEdit: () => void;
  isPending: boolean;
}

function NotificationItemRow({
  item,
  isEnabled,
  channels,
  template,
  isCustomTemplate,
  onToggle,
  onChannelChange,
  onTemplateEdit,
  isPending,
}: NotificationItemRowProps) {
  const Icon = item.icon;

  const handleChannelToggle = (channelId: string, checked: boolean) => {
    if (checked) {
      onChannelChange([...channels, channelId]);
    } else {
      onChannelChange(channels.filter((c) => c !== channelId));
    }
  };

  return (
    <div className="flex flex-col gap-3 py-3 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{item.label}</p>
              {isCustomTemplate && (
                <Badge variant="secondary" className="text-xs">
                  Custom
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggle}
          disabled={isPending}
        />
      </div>

      {isEnabled && (
        <div className="pl-11 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            {CHANNEL_OPTIONS.map((channel) => {
              const ChannelIcon = channel.icon;
              const isChecked = channels.includes(channel.id);
              return (
                <label
                  key={channel.id}
                  className="flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleChannelToggle(channel.id, checked as boolean)
                    }
                    disabled={isPending}
                  />
                  <ChannelIcon className="h-3 w-3 text-muted-foreground" />
                  <span className={cn(!isChecked && 'text-muted-foreground')}>
                    {channel.label}
                  </span>
                </label>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onTemplateEdit}
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit Template
          </Button>
        </div>
      )}
    </div>
  );
}

export function InstitutionNotificationSettings() {
  const {
    isLoading,
    toggleCategory,
    updateChannels,
    updateTemplate,
    getEffectiveSetting,
  } = useInstitutionNotificationSettings();

  const [expandedGroups, setExpandedGroups] = useState<string[]>(['celebrations', 'attendance']);
  const [editingItem, setEditingItem] = useState<NotificationCategoryItem | null>(null);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Notification Categories</CardTitle>
              <CardDescription>
                Configure which notifications are sent and through which channels
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {NOTIFICATION_CATEGORIES.map((group) => {
            const GroupIcon = group.icon;
            const isExpanded = expandedGroups.includes(group.id);
            const enabledCount = group.items.filter(
              (item) => getEffectiveSetting(item.id).isEnabled
            ).length;

            return (
              <Collapsible
                key={group.id}
                open={isExpanded}
                onOpenChange={() => toggleGroup(group.id)}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <GroupIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{group.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {enabledCount}/{group.items.length} active
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pt-2">
                  {group.items.map((item) => {
                    const setting = getEffectiveSetting(item.id);
                    return (
                      <NotificationItemRow
                        key={item.id}
                        item={item}
                        isEnabled={setting.isEnabled}
                        channels={setting.channels}
                        template={setting.template}
                        isCustomTemplate={setting.isCustomTemplate}
                        onToggle={(enabled) =>
                          toggleCategory.mutate({ category: item.id, isEnabled: enabled })
                        }
                        onChannelChange={(channels) =>
                          updateChannels.mutate({ category: item.id, channels })
                        }
                        onTemplateEdit={() => setEditingItem(item)}
                        isPending={
                          toggleCategory.isPending || updateChannels.isPending
                        }
                      />
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>

      {editingItem && (
        <TemplateEditDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          currentTemplate={getEffectiveSetting(editingItem.id).template}
          isCustom={getEffectiveSetting(editingItem.id).isCustomTemplate}
          onSave={(template) => {
            updateTemplate.mutate(
              { category: editingItem.id, template },
              { onSuccess: () => setEditingItem(null) }
            );
          }}
          isPending={updateTemplate.isPending}
        />
      )}
    </>
  );
}
