import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ArrowLeft, User } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useStaffThreads, 
  useStaffThreadMessages, 
  useSendStaffMessage,
  StaffThread,
  StaffThreadMessage 
} from '@/hooks/useTeacherMessages';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function TeacherConversations() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: threads = [], isLoading: isLoadingThreads } = useStaffThreads();
  const { data: threadData, isLoading: isLoadingMessages } = useStaffThreadMessages(selectedThreadId);
  const sendMessage = useSendStaffMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (threadData?.messages) {
      scrollToBottom();
    }
  }, [threadData?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThreadId) return;
    
    try {
      await sendMessage.mutateAsync({
        threadId: selectedThreadId,
        content: newMessage.trim(),
      });
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const thread = threadData?.thread;
  const messages = threadData?.messages || [];

  if (selectedThreadId) {
    // Chat View
    return (
      <Card className="flex flex-col h-[600px]">
        {/* Header */}
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedThreadId(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {thread?.parent?.first_name} {thread?.parent?.last_name}
              </CardTitle>
              {thread?.subject && (
                <CardDescription className="text-xs">{thread.subject}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4">
            {isLoadingMessages ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className={cn("h-16 w-2/3", i % 2 === 0 ? "ml-auto" : "")} />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p>No messages in this conversation yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg: StaffThreadMessage) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.sender_type === 'staff' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2",
                        msg.sender_type === 'staff'
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.sender_type === 'staff' 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground"
                      )}>
                        {format(new Date(msg.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessage.isPending}
            />
            <Button 
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessage.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Thread List View
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
        <CardDescription>Your message threads with parents</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingThreads ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg">No conversations yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start a conversation by sending a message to a parent
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread: StaffThread) => (
              <div 
                key={thread.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50",
                  thread.unread_count > 0 && "border-primary/50 bg-primary/5"
                )}
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {thread.parent.first_name} {thread.parent.last_name}
                      </span>
                      {thread.unread_count > 0 && (
                        <Badge variant="default" className="h-5 min-w-5 px-1.5">
                          {thread.unread_count}
                        </Badge>
                      )}
                    </div>
                    {thread.subject && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {thread.subject}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(thread.last_message_at), 'MMM d, h:mm a')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
