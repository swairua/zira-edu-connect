import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, History, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  sentCount: number;
}

export default function PushNotifications() {
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'group' | 'user'>('all');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);

  // Load notification history
  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('push_notifications')
        .select('id, title, message, created_at, sent_count')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setTemplates(
        (data || []).map(item => ({
          id: item.id,
          title: item.title,
          message: item.message,
          createdAt: item.created_at,
          sentCount: item.sent_count || 0,
        }))
      );
    } catch (error) {
      console.error('Failed to load notification history:', error);
      toast.error('Failed to load notification history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send notification
  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setIsSending(true);

      // Call backend function to send notifications via FCM
      const response = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: notificationTitle,
          message: notificationMessage,
          recipientType,
          groupId: selectedGroup || null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send notification');
      }

      toast.success(`Notification sent to ${response.data.sentCount} users`);
      setNotificationTitle('');
      setNotificationMessage('');
      setSelectedGroup('');
      loadHistory();
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout title="Push Notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Push Notifications</h1>
            <p className="text-muted-foreground">
              Send push notifications to users via Firebase Cloud Messaging
            </p>
          </div>
        </div>

        {/* Send Notification Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Send Notification
            </CardTitle>
            <CardDescription>
              Compose and send a push notification to users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipient Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Send To</label>
              <Select value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="group">Specific Group</SelectItem>
                  <SelectItem value="user">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group Selection (if applicable) */}
            {(recipientType === 'group' || recipientType === 'user') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {recipientType === 'group' ? 'Select Group' : 'Select User'}
                </label>
                <Input
                  placeholder={recipientType === 'group' ? 'Group ID or name' : 'User ID or email'}
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                />
              </div>
            )}

            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Title</label>
              <Input
                placeholder="Enter notification title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {notificationTitle.length}/100 characters
              </p>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter notification message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {notificationMessage.length}/500 characters
              </p>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendNotification}
              disabled={isSending || !notificationTitle.trim() || !notificationMessage.trim()}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSending ? 'Sending...' : 'Send Notification'}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              Notifications sent in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : templates.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No notifications sent yet
              </p>
            ) : (
              <div className="space-y-3">
                {templates.map((notification) => (
                  <div
                    key={notification.id}
                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {notification.sentCount}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Users with FCM tokens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Delivery Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
