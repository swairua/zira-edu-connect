import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, Users, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSendBulkSMS, useMessageTemplates, useRecipientCounts, useSMSStats } from '@/hooks/useCommunication';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useClasses } from '@/hooks/useClasses';
import { toast } from 'sonner';

type AudienceType = 'all_parents' | 'all_staff' | 'class_parents' | 'defaulters';

export default function BulkSMS() {
  const [audienceType, setAudienceType] = useState<AudienceType | ''>('');
  const [classId, setClassId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [templateId, setTemplateId] = useState<string>('');

  const { institutionId } = useInstitution();
  const sendBulkSMS = useSendBulkSMS();
  const { templates } = useMessageTemplates();
  const { data: recipientCounts } = useRecipientCounts();
  const { data: smsStats } = useSMSStats();
  const { data: classes = [] } = useClasses(institutionId);

  // Calculate character count and SMS credits
  const charCount = message.length;
  const smsCredits = charCount === 0 ? 0 : Math.ceil(charCount / 160);

  // Estimate recipient count based on selection
  const estimatedRecipients = useMemo(() => {
    if (!audienceType) return 0;
    switch (audienceType) {
      case 'all_parents':
        return recipientCounts?.parents || 0;
      case 'all_staff':
        return recipientCounts?.staff || 0;
      case 'class_parents':
        return classId ? Math.min(40, recipientCounts?.parents || 0) : 0; // Estimate
      case 'defaulters':
        return Math.floor((recipientCounts?.parents || 0) * 0.2); // Estimate 20%
      default:
        return 0;
    }
  }, [audienceType, classId, recipientCounts]);

  const handleTemplateSelect = (templateId: string) => {
    setTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
    }
  };

  const handleSend = async () => {
    if (!audienceType || !message.trim()) {
      toast.error('Please select recipients and enter a message');
      return;
    }

    if (audienceType === 'class_parents' && !classId) {
      toast.error('Please select a class');
      return;
    }

    try {
      await sendBulkSMS.mutateAsync({
        message: message.trim(),
        messageType: 'general',
        audienceType: audienceType as 'all_parents' | 'all_staff' | 'class_parents' | 'defaulters',
        classId: audienceType === 'class_parents' ? classId : undefined,
      });
      
      // Reset form
      setMessage('');
      setAudienceType('');
      setClassId('');
      setTemplateId('');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <DashboardLayout title="Bulk SMS">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk SMS</h1>
          <p className="text-muted-foreground">
            Send SMS messages to parents, students, or staff
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Compose Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>
                Select recipients and compose your message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipients</Label>
                <Select 
                  value={audienceType} 
                  onValueChange={(v) => {
                    setAudienceType(v as AudienceType);
                    if (v !== 'class_parents') setClassId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_parents">All Parents</SelectItem>
                    <SelectItem value="all_staff">All Staff</SelectItem>
                    <SelectItem value="class_parents">By Class</SelectItem>
                    <SelectItem value="defaulters">Fee Defaulters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {audienceType === 'class_parents' && (
                <div className="space-y-2">
                  <Label>Select Class</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Use Template (optional)</Label>
                  <Select value={templateId} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.is_active).map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea 
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  {charCount}/160 characters ({smsCredits} SMS credit{smsCredits !== 1 ? 's' : ''})
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSend}
                  disabled={!audienceType || !message.trim() || sendBulkSMS.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sendBulkSMS.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS Sent Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{smsStats?.sentToday || 0}</div>
                <p className="text-xs text-muted-foreground">Messages delivered</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Recipients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estimatedRecipients}</div>
                <p className="text-xs text-muted-foreground">
                  {audienceType ? 'Estimated recipients' : 'Select a group'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">
                  Message templates available
                </p>
              </CardContent>
            </Card>

            {estimatedRecipients > 0 && smsCredits > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">Estimated Cost</div>
                  <div className="text-2xl font-bold text-primary">
                    {estimatedRecipients * smsCredits} credits
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {estimatedRecipients} recipients × {smsCredits} SMS each
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
