import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useAddTicketResponse } from '@/hooks/useSupportTickets';

interface TicketResponseFormProps {
  ticketId: string;
  disabled?: boolean;
}

export function TicketResponseForm({ ticketId, disabled }: TicketResponseFormProps) {
  const [message, setMessage] = useState('');
  const { mutate: addResponse, isPending } = useAddTicketResponse();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    addResponse(
      { ticketId, message: message.trim() },
      {
        onSuccess: () => setMessage(''),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Type your response..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled || isPending}
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!message.trim() || disabled || isPending}
        >
          <Send className="mr-2 h-4 w-4" />
          {isPending ? 'Sending...' : 'Send Response'}
        </Button>
      </div>
    </form>
  );
}
