import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Smartphone,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { SmsSettingsCard } from '@/components/settings/SmsSettingsCard';
import { InstitutionSmsSettingsCard } from '@/components/settings/InstitutionSmsSettingsCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SmsSettings() {
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('This is a test message from Zira EduSuite. If you received this, SMS integration is working!');
  const [testSmsType, setTestSmsType] = useState<'transactional' | 'promotional'>('transactional');
  const [isSending, setIsSending] = useState(false);

  // Fetch SMS logs
  const { data: smsLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['sms-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch SMS stats
  const { data: smsStats, isLoading: statsLoading } = useQuery({
    queryKey: ['sms-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayLogs, error } = await supabase
        .from('sms_logs')
        .select('status')
        .gte('created_at', today.toISOString());
      
      if (error) throw error;

      const total = todayLogs?.length || 0;
      const sent = todayLogs?.filter(l => l.status === 'sent').length || 0;
      const failed = todayLogs?.filter(l => l.status === 'failed').length || 0;
      const pending = todayLogs?.filter(l => l.status === 'pending').length || 0;

      return { total, sent, failed, pending, successRate: total > 0 ? Math.round((sent / total) * 100) : 0 };
    }
  });

  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phones: testPhone.trim(),
          message: testMessage,
          messageType: 'test',
          smsType: testSmsType,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Test SMS sent successfully!');
        refetchLogs();
      } else {
        toast.error(data?.error || 'Failed to send test SMS');
      }
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast.error('Failed to send test SMS');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="SMS Settings" subtitle="Platform-wide SMS configuration (Super Admin Only)">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{smsStats?.sent || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Today</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-destructive">{smsStats?.failed || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Today</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{smsStats?.total || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-green-600">{smsStats?.successRate || 0}%</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Institution Custom Settings */}
        <InstitutionSmsSettingsCard />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* SMS Configuration */}
          <SmsSettingsCard />
          
          {/* Test SMS Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Send Test SMS
              </CardTitle>
              <CardDescription>
                Test the SMS integration by sending a message to any phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 0722241745 or +254722241745"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Accepted: +254XXXXXXXXX, 254XXXXXXXXX, or 07XXXXXXXX
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter test message..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {testMessage.length} characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsType">SMS Type</Label>
                <Select value={testSmsType} onValueChange={(v) => setTestSmsType(v as 'transactional' | 'promotional')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactional">Transactional (OTPs, Alerts)</SelectItem>
                    <SelectItem value="promotional">Promotional (Announcements)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tests the corresponding sender ID
                </p>
              </div>

              <Button 
                onClick={handleSendTest} 
                disabled={isSending}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test SMS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Provider Status */}
          <Card>
            <CardHeader>
              <CardTitle>SMS Provider Status</CardTitle>
              <CardDescription>
                Current SMS provider configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">RoberMS</p>
                    <p className="text-sm text-muted-foreground">Bulk SMS Provider</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Endpoint</span>
                  <span className="font-mono text-xs">endpint.roberms.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sender Name</span>
                  <span>ZIRA TECH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authentication</span>
                  <Badge variant="secondary">Token</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent SMS Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent SMS Logs</CardTitle>
              <CardDescription>Last 20 SMS messages sent</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : smsLogs && smsLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smsLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {log.recipient_phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.message_type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.message}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status || 'pending')}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {log.sent_at ? format(new Date(log.sent_at), 'MMM d, HH:mm') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No SMS logs yet</p>
                <p className="text-sm">Send a test SMS to see logs here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
