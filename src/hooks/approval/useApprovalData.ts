
import { useState, useEffect } from 'react';
import { EnhancedApprovalItem, EnhancedApprovalStats } from '@/types/approval';

export interface UseApprovalDataResult {
  pendingApprovals: EnhancedApprovalItem[];
  approvedItems: EnhancedApprovalItem[];
  rejectedItems: EnhancedApprovalItem[];
  stats: EnhancedApprovalStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useApprovalData = (): UseApprovalDataResult => {
  const [pendingApprovals, setPendingApprovals] = useState<EnhancedApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<EnhancedApprovalItem[]>([]);
  const [rejectedItems, setRejectedItems] = useState<EnhancedApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats: EnhancedApprovalStats = {
    pending: pendingApprovals.length,
    approved: approvedItems.length,
    rejected: rejectedItems.length,
    draft: 0,
    total: pendingApprovals.length + approvedItems.length + rejectedItems.length
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // TODO: Burada real API çağırışı olacaq
      // Hələlik mock data:
      setPendingApprovals([]);
      setApprovedItems([]);
      setRejectedItems([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    stats,
    isLoading,
    error,
    refetch: fetchData
  };
};
