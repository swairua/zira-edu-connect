import { useState } from 'react';
import { Bell, Check, FileText, DollarSign, GraduationCap, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useParent } from '@/contexts/ParentContext';
import { useParentAuth } from '@/contexts/ParentAuthContext';
import {
  useParentNotifications,
  useParentUnreadCount,
  useMarkParentNotificationRead,
  useMarkAllParentNotificationsRead,
  useParentNotificationSubscription,
} from '@/hooks/useParentNotifications';
import {
  useParentNotificationsOTP,
  useMarkParentNotificationReadOTP,
} from '@/hooks/useParentMessages';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function ParentNotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { parentProfile } = useParent();
  const { isAuthenticated: isOTPAuth } = useParentAuth();
  
  // Use OTP-based hook if authenticated via OTP, otherwise use Supabase hook
  const { data: supabaseNotifications = [] } = useParentNotifications(
    isOTPAuth ? null : (parentProfile?.id || null)
  );
  const { data: otpNotifications = [] } = useParentNotificationsOTP();
  
  const notifications = isOTPAuth ? otpNotifications : supabaseNotifications;
  
  const { data: supabaseUnreadCount = 0 } = useParentUnreadCount(
    isOTPAuth ? null : (parentProfile?.id || null)
  );
  const otpUnreadCount = otpNotifications.filter((n: any) => !n.is_read).length;
  const unreadCount = isOTPAuth ? otpUnreadCount : supabaseUnreadCount;
  
  const markReadSupabase = useMarkParentNotificationRead();
  const markAllReadSupabase = useMarkAllParentNotificationsRead();
  const markReadOTP = useMarkParentNotificationReadOTP();

  // Subscribe to realtime updates (only for Supabase auth)
  useParentNotificationSubscription(isOTPAuth ? null : (parentProfile?.id || null));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'results_published':
        return <GraduationCap className="h-4 w-4 text-primary" />;
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'invoice':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (isOTPAuth) {
      markReadOTP.mutate(notification.id);
    } else {
      markReadSupabase.mutate(notification.id);
    }
    
    // Navigate to messages if it's a message notification
    if (notification.type === 'message' || notification.reference_type === 'message_thread') {
      setOpen(false);
      navigate('/parent/messages');
    }
  };

  const handleMarkAllRead = () => {
    if (isOTPAuth) {
      markReadOTP.mutate(undefined);
    } else if (parentProfile?.id) {
      markAllReadSupabase.mutate(parentProfile.id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
