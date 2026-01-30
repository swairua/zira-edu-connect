import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Send, Bell, Megaphone, FileText, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCommunicationDashboard } from '@/hooks/useCommunication';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunicationDashboard() {
  const navigate = useNavigate();
  const { smsStats, isLoading, activeAnnouncements, recentSMS } = useCommunicationDashboard();

  return (
    <DashboardLayout title="Communications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
            <p className="text-muted-foreground">
              Send SMS, manage announcements, and communication history
            </p>
          </div>
          <Button onClick={() => navigate('/communication/bulk-sms')}>
            <Send className="mr-2 h-4 w-4" />
            Send SMS
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SMS Sent Today</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{smsStats.sentToday}</div>
                  <p className="text-xs text-muted-foreground">Messages delivered</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{smsStats.sentThisMonth}</div>
                  <p className="text-xs text-muted-foreground">Total SMS sent</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{smsStats.successRate}%</div>
                  <p className="text-xs text-muted-foreground">Delivery rate</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{activeAnnouncements}</div>
                  <p className="text-xs text-muted-foreground">Published now</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/communication/bulk-sms')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Bulk SMS
              </CardTitle>
              <CardDescription>
                Send messages to parents, students, or staff
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/communication/announcements')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Announcements
              </CardTitle>
              <CardDescription>
                Create and manage school announcements
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/communication/templates')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Templates
              </CardTitle>
              <CardDescription>
                Manage reusable message templates
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/communication/reminders')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Reminders
              </CardTitle>
              <CardDescription>
                Configure automated fee reminders
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent SMS Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent SMS Activity</CardTitle>
              <CardDescription>Last 5 messages sent</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/communication/history')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : recentSMS.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No SMS sent yet</p>
            ) : (
              <div className="space-y-3">
                {recentSMS.map((sms) => (
                  <div key={sms.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{sms.recipient_phone}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {sms.message}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={sms.status === 'sent' ? 'default' : sms.status === 'failed' ? 'destructive' : 'secondary'}
                        className={sms.status === 'sent' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                      >
                        {sms.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {sms.sent_at ? format(new Date(sms.sent_at), 'MMM d, HH:mm') : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
