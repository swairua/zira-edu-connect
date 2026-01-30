import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface PaymentNotification {
  id: string;
  amount: number;
  studentName?: string;
  timestamp: Date;
}

export function useRealtimePayments() {
  const [recentNotifications, setRecentNotifications] = useState<PaymentNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscription for fee_payments...');

    const channel = supabase
      .channel('fee-payments-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fee_payments',
        },
        async (payload) => {
          console.log('New payment received:', payload);

          const newPayment = payload.new as any;

          // Fetch student name if we have the account ID
          let studentName = 'Unknown Student';
          if (newPayment.student_fee_account_id) {
            const { data: account } = await supabase
              .from('student_fee_accounts')
              .select('student_name')
              .eq('id', newPayment.student_fee_account_id)
              .single();
            
            if (account) {
              studentName = account.student_name;
            }
          }

          const notification: PaymentNotification = {
            id: newPayment.id,
            amount: newPayment.amount,
            studentName,
            timestamp: new Date(),
          };

          // Add to notifications list
          setRecentNotifications((prev) => [notification, ...prev].slice(0, 10));

          // Show toast notification
          toast.success('New Payment Received', {
            description: `${studentName} - KES ${newPayment.amount.toLocaleString()}`,
            duration: 5000,
          });

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
          queryClient.invalidateQueries({ queryKey: ['finance-recent-payments'] });
          queryClient.invalidateQueries({ queryKey: ['finance-defaulters'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fee_payments',
        },
        (payload) => {
          console.log('Payment updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
          queryClient.invalidateQueries({ queryKey: ['finance-recent-payments'] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const clearNotifications = () => {
    setRecentNotifications([]);
  };

  return {
    recentNotifications,
    isConnected,
    clearNotifications,
  };
}
