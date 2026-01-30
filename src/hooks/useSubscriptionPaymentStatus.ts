import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentStatusData {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mpesaReceipt: string | null;
  resultDesc: string | null;
  amount: number;
  phoneNumber: string | null;
  createdAt: string;
}

interface UseSubscriptionPaymentStatusOptions {
  paymentId: string | null;
  onComplete?: () => void;
  onFailed?: (error: string) => void;
}

export function useSubscriptionPaymentStatus({
  paymentId,
  onComplete,
  onFailed,
}: UseSubscriptionPaymentStatusOptions) {
  const queryClient = useQueryClient();
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Initial fetch and polling fallback
  const { data: payment, isLoading, refetch } = useQuery({
    queryKey: ['payment-status', paymentId],
    queryFn: async (): Promise<PaymentStatusData | null> => {
      if (!paymentId) return null;

      const { data, error } = await supabase
        .from('institution_payments')
        .select('id, status, mpesa_receipt, amount, mpesa_phone, created_at, metadata')
        .eq('id', paymentId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        status: data.status as PaymentStatusData['status'],
        mpesaReceipt: data.mpesa_receipt,
        resultDesc: (data.metadata as any)?.resultDesc || null,
        amount: data.amount,
        phoneNumber: data.mpesa_phone,
        createdAt: data.created_at,
      };
    },
    enabled: !!paymentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll every 3 seconds while pending/processing
      if (status === 'pending' || status === 'processing') {
        return 3000;
      }
      return false;
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!paymentId) return;

    const channel = supabase
      .channel(`payment-status-${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'institution_payments',
          filter: `id=eq.${paymentId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ['payment-status', paymentId] });
          
          if (newStatus === 'completed') {
            queryClient.invalidateQueries({ queryKey: ['institution-billing'] });
            queryClient.invalidateQueries({ queryKey: ['institution-payments'] });
            queryClient.invalidateQueries({ queryKey: ['institution-invoices'] });
            onComplete?.();
          } else if (newStatus === 'failed') {
            onFailed?.((payload.new.metadata as any)?.resultDesc || 'Payment failed');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [paymentId, queryClient, onComplete, onFailed]);

  // Timeout after 2 minutes
  useEffect(() => {
    if (!paymentId || payment?.status === 'completed' || payment?.status === 'failed') {
      return;
    }

    const timeout = setTimeout(() => {
      setIsTimedOut(true);
    }, 120000); // 2 minutes

    return () => clearTimeout(timeout);
  }, [paymentId, payment?.status]);

  // Calculate elapsed time
  const getElapsedTime = useCallback(() => {
    if (!payment?.createdAt) return 0;
    return Math.floor((Date.now() - new Date(payment.createdAt).getTime()) / 1000);
  }, [payment?.createdAt]);

  return {
    payment,
    isLoading,
    isTimedOut,
    refetch,
    getElapsedTime,
  };
}
