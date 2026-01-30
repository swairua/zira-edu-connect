import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClassFeeStats {
  classId: string;
  className: string;
  studentCount: number;
  totalFees: number;
  totalPaid: number;
  outstanding: number;
  collectionRate: number;
  defaulterCount: number;
}

interface FeeCollectionStats {
  totalFees: number;
  totalPaid: number;
  outstanding: number;
  collectionRate: number;
  totalStudents: number;
  paidInFull: number;
  partialPayments: number;
  defaulters: number;
  classStats: ClassFeeStats[];
}

export function useFeeCollectionStats(institutionId: string | null, classId?: string) {
  return useQuery({
    queryKey: ['fee-collection-stats', institutionId, classId],
    queryFn: async (): Promise<FeeCollectionStats> => {
      if (!institutionId) {
        return {
          totalFees: 0,
          totalPaid: 0,
          outstanding: 0,
          collectionRate: 0,
          totalStudents: 0,
          paidInFull: 0,
          partialPayments: 0,
          defaulters: 0,
          classStats: [],
        };
      }

      // Fetch student fee accounts
      const { data: accounts, error } = await supabase
        .from('student_fee_accounts')
        .select('*')
        .eq('institution_id', institutionId);

      if (error) {
        console.error('Error fetching fee accounts:', error);
        throw error;
      }

      if (!accounts || accounts.length === 0) {
        return {
          totalFees: 0,
          totalPaid: 0,
          outstanding: 0,
          collectionRate: 0,
          totalStudents: 0,
          paidInFull: 0,
          partialPayments: 0,
          defaulters: 0,
          classStats: [],
        };
      }

      // Filter by class if specified
      const filteredAccounts = classId 
        ? accounts.filter(a => {
            // Match by class name since student_fee_accounts stores class as text
            return a.class?.toLowerCase().includes(classId.toLowerCase());
          })
        : accounts;

      // Calculate totals
      const totalFees = filteredAccounts.reduce((sum, a) => sum + (a.total_fees || 0), 0);
      const totalPaid = filteredAccounts.reduce((sum, a) => sum + (a.total_paid || 0), 0);
      const outstanding = totalFees - totalPaid;
      const collectionRate = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

      // Status counts
      const paidInFull = filteredAccounts.filter(a => a.status === 'paid').length;
      const partialPayments = filteredAccounts.filter(a => a.status === 'partial').length;
      const defaulters = filteredAccounts.filter(a => a.status === 'defaulter').length;

      // Group by class
      const classMap = new Map<string, typeof accounts>();
      for (const account of accounts) {
        const className = account.class || 'Unknown';
        if (!classMap.has(className)) {
          classMap.set(className, []);
        }
        classMap.get(className)!.push(account);
      }

      // Build class stats
      const classStats: ClassFeeStats[] = Array.from(classMap.entries()).map(([className, classAccounts]) => {
        const classTotalFees = classAccounts.reduce((sum, a) => sum + (a.total_fees || 0), 0);
        const classTotalPaid = classAccounts.reduce((sum, a) => sum + (a.total_paid || 0), 0);
        const classOutstanding = classTotalFees - classTotalPaid;
        const classCollectionRate = classTotalFees > 0 ? (classTotalPaid / classTotalFees) * 100 : 0;
        const classDefaulters = classAccounts.filter(a => a.status === 'defaulter').length;

        return {
          classId: className,
          className,
          studentCount: classAccounts.length,
          totalFees: classTotalFees,
          totalPaid: classTotalPaid,
          outstanding: classOutstanding,
          collectionRate: Math.round(classCollectionRate * 10) / 10,
          defaulterCount: classDefaulters,
        };
      }).sort((a, b) => b.collectionRate - a.collectionRate);

      return {
        totalFees,
        totalPaid,
        outstanding,
        collectionRate: Math.round(collectionRate * 10) / 10,
        totalStudents: filteredAccounts.length,
        paidInFull,
        partialPayments,
        defaulters,
        classStats,
      };
    },
    enabled: !!institutionId,
  });
}
