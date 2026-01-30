import { useState } from 'react';
import { Bell, Check, FileText, DollarSign, GraduationCap, MessageSquare, Calendar, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudent } from '@/contexts/StudentContext';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import {
  useStudentNotifications,
  useStudentUnreadCount,
  useMarkStudentNotificationRead,
  useMarkAllStudentNotificationsRead,
  useStudentNotificationSubscription,
  useStudentNotificationsOTP,
  useMarkStudentNotificationReadOTP,
} from '@/hooks/useStudentNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function StudentNotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { studentProfile } = useStudent();
  const { isAuthenticated: isOTPAuth } = useStudentAuth();
  
  // Use OTP-based hook if authenticated via OTP, otherwise use Supabase hook
  const { data: supabaseNotifications = [] } = useStudentNotifications(
    isOTPAuth ? null : (studentProfile?.id || null)
  );
  const { data: otpNotifications = [] } = useStudentNotificationsOTP();
  
  const notifications = isOTPAuth ? otpNotifications : supabaseNotifications;
  
  const { data: supabaseUnreadCount = 0 } = useStudentUnreadCount(
    isOTPAuth ? null : (studentProfile?.id || null)
  );
  const otpUnreadCount = otpNotifications.filter((n: any) => !n.is_read).length;
  const unreadCount = isOTPAuth ? otpUnreadCount : supabaseUnreadCount;
  
  const markReadSupabase = useMarkStudentNotificationRead();
  const markAllReadSupabase = useMarkAllStudentNotificationsRead();
  const markReadOTP = useMarkStudentNotificationReadOTP();

  // Subscribe to realtime updates (only for Supabase auth)
  useStudentNotificationSubscription(isOTPAuth ? null : (studentProfile?.id || null));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'results_published':
      case 'grade':
        return <GraduationCap className="h-4 w-4 text-primary" />;
      case 'payment_received':
      case 'fee_reminder':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'invoice':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'assignment':
      case 'assignment_due':
        return <ClipboardList className="h-4 w-4 text-purple-500" />;
      case 'attendance':
        return <Calendar className="h-4 w-4 text-amber-500" />;
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
    
    // Navigate based on notification type
    setOpen(false);
    
    switch (notification.type) {
      case 'assignment':
      case 'assignment_due':
        navigate('/student/assignments');
        break;
      case 'results_published':
      case 'grade':
        navigate('/student/results');
        break;
      case 'attendance':
        navigate('/student/attendance');
        break;
      case 'fee_reminder':
      case 'invoice':
        navigate('/student/fees');
        break;
      default:
        // Stay on current page
        break;
    }
  };

  const handleMarkAllRead = () => {
    if (isOTPAuth) {
      markReadOTP.mutate(undefined);
    } else if (studentProfile?.id) {
      markAllReadSupabase.mutate(studentProfile.id);
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
