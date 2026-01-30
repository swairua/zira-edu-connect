import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ArrowLeft, User } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ParentLayout } from '@/components/parent/ParentLayout';
import { 
  useParentThreads, 
  useParentThreadMessages, 
  useSendParentMessage,
  MessageThread,
  ThreadMessage 
} from '@/hooks/useParentMessages';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ParentMessages() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: threads = [], isLoading: isLoadingThreads } = useParentThreads();
  const { data: threadData, isLoading: isLoadingMessages } = useParentThreadMessages(selectedThreadId);
  const sendMessage = useSendParentMessage();

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

  return (
    <ParentLayout title="Messages" showStudentSelector={false}>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className={cn(selectedThreadId && "hidden sm:block")}>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(selectedThreadId ? "p-0" : "")}>
            {selectedThreadId ? (
              // Chat View - inline JSX to prevent re-creation
              <div className="flex flex-col h-[calc(100vh-12rem)]">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b bg-background">
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
                    <h3 className="font-medium">
                      {thread?.staff?.first_name} {thread?.staff?.last_name}
                    </h3>
                    {thread?.staff?.designation && (
                      <p className="text-xs text-muted-foreground">{thread.staff.designation}</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {isLoadingMessages ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className={cn("h-16 w-2/3", i % 2 === 0 ? "" : "ml-auto")} />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mb-2" />
                      <p>No messages in this conversation yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg: ThreadMessage) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            msg.sender_type === 'parent' ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-2",
                              msg.sender_type === 'parent'
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              msg.sender_type === 'parent' 
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

                {/* Input */}
                <div className="p-4 border-t bg-background">
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
              </div>
            ) : (
              // Thread List View - inline JSX to prevent re-creation
              <div className="space-y-2">
                {isLoadingThreads ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : threads.length === 0 ? (
                  <Card className="py-12">
                    <CardContent className="flex flex-col items-center text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg">No messages yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Messages from teachers will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  threads.map((thread: MessageThread) => (
                    <Card 
                      key={thread.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-accent/50",
                        thread.unread_count > 0 && "border-primary/50 bg-primary/5"
                      )}
                      onClick={() => setSelectedThreadId(thread.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {thread.staff.first_name} {thread.staff.last_name}
                                </span>
                                {thread.unread_count > 0 && (
                                  <Badge variant="default" className="h-5 min-w-5 px-1.5">
                                    {thread.unread_count}
                                  </Badge>
                                )}
                              </div>
                              {thread.staff.designation && (
                                <p className="text-xs text-muted-foreground">{thread.staff.designation}</p>
                              )}
                              {thread.subject && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {thread.subject}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(thread.last_message_at), 'MMM d')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  );
}
