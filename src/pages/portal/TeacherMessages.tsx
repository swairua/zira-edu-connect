import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { useStaffProfile, useTeacherClasses } from '@/hooks/useStaffProfile';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Users, User, Clock, CheckCircle2, Loader2, Bell, Smartphone, MessagesSquare } from 'lucide-react';
import { toast } from 'sonner';
import { TeacherConversations } from '@/components/portal/TeacherConversations';
import { useStaffUnreadThreadCount } from '@/hooks/useTeacherMessages';

interface Parent {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string | null;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    class?: {
      name: string;
    };
  };
}

export default function TeacherMessages() {
  const { user } = useAuth();
  const { data: staffProfile } = useStaffProfile();
  const { data: teacherClasses = [] } = useTeacherClasses();
  const queryClient = useQueryClient();
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [preselectedParentId, setPreselectedParentId] = useState<string | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const unreadCount = useStaffUnreadThreadCount();

  const handleQuickMessage = (parentId: string) => {
    setPreselectedParentId(parentId);
    setShowComposeDialog(true);
  };

  const handleOpenCompose = () => {
    setPreselectedParentId(null);
    setShowComposeDialog(true);
  };

  // Get unique class IDs
  const uniqueClassIds = [...new Set(teacherClasses.map(tc => tc.class_id))];

  // Fetch parents of students in teacher's classes
  const { data: parents = [], isLoading: isLoadingParents } = useQuery({
    queryKey: ['teacher-parents', uniqueClassIds],
    queryFn: async () => {
      if (uniqueClassIds.length === 0) return [];

      const { data, error } = await supabase
        .from('student_parents')
        .select(`
          parent:parents(id, first_name, last_name, phone, email),
          student:students(id, first_name, last_name, class:classes(name), class_id)
        `)
        .in('student.class_id', uniqueClassIds);

      if (error) {
        console.error('Error fetching parents:', error);
        return [];
      }

      // Flatten and deduplicate parents
      const parentsMap = new Map<string, Parent>();
      data?.forEach((sp: any) => {
        if (sp.parent && sp.student) {
          parentsMap.set(sp.parent.id, {
            ...sp.parent,
            student: sp.student,
          });
        }
      });

      return Array.from(parentsMap.values());
    },
    enabled: uniqueClassIds.length > 0,
  });

  // Fetch message history
  const { data: messages = [], isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['teacher-messages', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data;
    },
    enabled: !!user && !!staffProfile,
  });

  const filteredParents = selectedClassFilter === 'all'
    ? parents
    : parents.filter(p => p.student.class?.name === selectedClassFilter);

  // Get unique class names for filter
  const uniqueClasses = teacherClasses.reduce((acc, curr) => {
    if (!acc.find(c => c.class_id === curr.class_id)) {
      acc.push(curr);
    }
    return acc;
  }, [] as typeof teacherClasses);

  return (
    <PortalLayout title="Messages" subtitle="Communicate with parents">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div></div>
          <Button onClick={handleOpenCompose}>
            <Send className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
        </div>

        <Tabs defaultValue="conversations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="conversations" className="gap-2">
              <MessagesSquare className="h-4 w-4" />
              Conversations
              {unreadCount > 0 && (
                <Badge variant="default" className="h-5 min-w-5 px-1.5 ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="parents" className="gap-2">
              <Users className="h-4 w-4" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              Sent Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-4">
            <TeacherConversations />
          </TabsContent>

          <TabsContent value="parents" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parent Directory</CardTitle>
                    <CardDescription>Parents of students in your classes</CardDescription>
                  </div>
                  <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {uniqueClasses.map((tc) => (
                        <SelectItem key={tc.class_id} value={tc.class?.name || ''}>
                          {tc.class?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingParents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredParents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No parents found for your classes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredParents.map((parent) => (
                      <div
                        key={parent.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {parent.first_name} {parent.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Parent of {parent.student.first_name} {parent.student.last_name}
                              {parent.student.class && ` (${parent.student.class.name})`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{parent.phone}</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleQuickMessage(parent.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Messages you've sent to parents</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm line-clamp-2">{message.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {message.recipient_type}
                              </Badge>
                              {message.status === 'sent' && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Sent
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(message.created_at!), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ComposeMessageDialog
          open={showComposeDialog}
          onOpenChange={(open) => {
            setShowComposeDialog(open);
            if (!open) setPreselectedParentId(null);
          }}
          parents={parents}
          classes={uniqueClasses}
          staffProfile={staffProfile}
          preselectedParentId={preselectedParentId}
          userId={user?.id}
        />
      </div>
    </PortalLayout>
  );
}

interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parents: Parent[];
  classes: any[];
  staffProfile: any;
  preselectedParentId?: string | null;
  userId?: string;
}

function ComposeMessageDialog({ open, onOpenChange, parents, classes, staffProfile, preselectedParentId, userId }: ComposeMessageDialogProps) {
  const queryClient = useQueryClient();
  const [recipientType, setRecipientType] = useState<'individual' | 'class'>('individual');
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'sms' | 'in_app' | 'both'>('both');

  // Pre-select parent when opening from quick message button
  useEffect(() => {
    if (open && preselectedParentId) {
      setRecipientType('individual');
      setSelectedParent(preselectedParentId);
    }
  }, [open, preselectedParentId]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!staffProfile) throw new Error('Staff profile not found');

      const selectedParentData = parents.find(p => p.id === selectedParent);
      const selectedClassName = classes.find(c => c.class_id === selectedClass)?.class?.name;
      const topic = recipientType === 'individual' 
        ? `Message to ${selectedParentData?.first_name || 'Parent'}`
        : `Message to ${selectedClassName || 'Class'}`;

      // Get target parent IDs
      let targetParentIds: string[] = [];
      if (recipientType === 'individual') {
        targetParentIds = [selectedParent];
      } else {
        // Get all parents in the selected class
        const classParents = parents.filter(p => 
          p.student.class?.name === selectedClassName
        );
        targetParentIds = classParents.map(p => p.id);
      }

      // Send SMS if selected
      if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
        const { error: smsError } = await supabase
          .from('messages')
          .insert({
            content: message,
            recipient_type: recipientType === 'individual' ? 'individual' : 'class',
            institution_id: staffProfile.institution_id,
            created_by: userId,
            status: 'pending',
            recipient_filter: recipientType === 'individual' 
              ? { parent_id: selectedParent }
              : { class_id: selectedClass },
          });

        if (smsError) throw smsError;
      }

      // Send in-app notifications AND create message threads for replies
      if (deliveryMethod === 'in_app' || deliveryMethod === 'both') {
        // For each parent, create or update a thread and add the message
        for (const parentId of targetParentIds) {
          // Check if thread exists between this staff and parent
          const { data: existingThread } = await supabase
            .from('message_threads')
            .select('id')
            .eq('staff_id', staffProfile.id)
            .eq('parent_id', parentId)
            .eq('subject', topic)
            .single();

          let threadId: string;

          if (existingThread) {
            threadId = existingThread.id;
          } else {
            // Create new thread
            const { data: newThread, error: threadError } = await supabase
              .from('message_threads')
              .insert({
                institution_id: staffProfile.institution_id,
                parent_id: parentId,
                staff_id: staffProfile.id,
                subject: topic,
              })
              .select('id')
              .single();

            if (threadError) throw threadError;
            threadId = newThread.id;
          }

          // Add message to thread
          const { error: msgError } = await supabase
            .from('thread_messages')
            .insert({
              thread_id: threadId,
              sender_type: 'staff',
              sender_id: staffProfile.id,
              content: message,
            });

          if (msgError) throw msgError;

          // Also create in-app notification for the bell icon
          const { error: notifError } = await supabase
            .from('in_app_notifications')
            .insert({
              institution_id: staffProfile.institution_id,
              parent_id: parentId,
              user_type: 'parent',
              title: topic,
              message: message,
              type: 'info',
              is_read: false,
              reference_type: 'message_thread',
              reference_id: threadId,
            });

          if (notifError) {
            console.error('Notification insert error:', notifError);
            throw notifError;
          }
        }
      }
    },
    onSuccess: () => {
      const methodLabel = deliveryMethod === 'both' ? 'SMS & notification' : 
                          deliveryMethod === 'sms' ? 'SMS' : 'Notification';
      toast.success(`${methodLabel} sent successfully`);
      queryClient.invalidateQueries({ queryKey: ['teacher-messages', userId] });
      setMessage('');
      setSelectedParent('');
      setSelectedClass('');
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Error sending message:', error);
      toast.error(error?.message || 'Failed to send message');
    },
  });

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    if (recipientType === 'individual' && !selectedParent) {
      toast.error('Please select a parent');
      return;
    }
    if (recipientType === 'class' && !selectedClass) {
      toast.error('Please select a class');
      return;
    }
    sendMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>
            Send a message to parents via SMS
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div>
            <Label>Send To</Label>
            <Select value={recipientType} onValueChange={(v: 'individual' | 'class') => setRecipientType(v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Parent</SelectItem>
                <SelectItem value="class">Entire Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recipientType === 'individual' ? (
            <div>
              <Label>Select Parent</Label>
              <Select value={selectedParent} onValueChange={setSelectedParent}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a parent" />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.first_name} {parent.last_name} ({parent.student.first_name}'s parent)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((tc) => (
                    <SelectItem key={tc.class_id} value={tc.class_id}>
                      {tc.class?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Delivery Method</Label>
            <div className="flex gap-2 mt-1.5">
              <Button
                type="button"
                size="sm"
                variant={deliveryMethod === 'sms' ? 'default' : 'outline'}
                onClick={() => setDeliveryMethod('sms')}
                className="flex-1"
              >
                <Smartphone className="h-4 w-4 mr-1" />
                SMS
              </Button>
              <Button
                type="button"
                size="sm"
                variant={deliveryMethod === 'in_app' ? 'default' : 'outline'}
                onClick={() => setDeliveryMethod('in_app')}
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-1" />
                In-App
              </Button>
              <Button
                type="button"
                size="sm"
                variant={deliveryMethod === 'both' ? 'default' : 'outline'}
                onClick={() => setDeliveryMethod('both')}
                className="flex-1"
              >
                Both
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {deliveryMethod === 'sms' && 'Send as SMS to parent phone'}
              {deliveryMethod === 'in_app' && 'Send as notification in parent portal'}
              {deliveryMethod === 'both' && 'Send both SMS and in-app notification'}
            </p>
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              className="mt-1.5"
              placeholder="Type your message here..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/160 characters {deliveryMethod !== 'in_app' && '(SMS limit)'}
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sendMutation.isPending}>
            {sendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
