
import { useState, useEffect } from 'react';
import { DataEntryStatus } from '@/types/dataEntry';
import { ApprovalItem } from '@/types/approval';

interface UseApprovalDataReturn {
  pendingApprovals: ApprovalItem[];
  approvedItems: ApprovalItem[];
  rejectedItems: ApprovalItem[];
  isLoading: boolean;
  approveItem: (id: string, comment?: string) => void;
  rejectItem: (id: string, reason: string) => void;
  viewItem: (item: ApprovalItem) => void;
}

export const useApprovalData = (): UseApprovalDataReturn => {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<ApprovalItem[]>([]);
  const [rejectedItems, setRejectedItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock data for now
    setPendingApprovals([
      {
        id: '1',
        categoryId: 'cat-1',
        categoryName: 'Infrastruktur',
        schoolId: '123',
        schoolName: 'Test School',
        submittedBy: 'John Doe',
        submittedAt: '2025-04-18',
        status: DataEntryStatus.PENDING,
        entries: [],
        completionRate: 75,
      }
    ]);
  }, []);

  const approveItem = (id: string, comment?: string) => {
    console.log('Approving item:', id, comment);
    // Move item from pending to approved
    const item = pendingApprovals.find(p => p.id === id);
    if (item) {
      setPendingApprovals(prev => prev.filter(p => p.id !== id));
      setApprovedItems(prev => [...prev, { ...item, status: DataEntryStatus.APPROVED }]);
    }
  };

  const rejectItem = (id: string, reason: string) => {
    console.log('Rejecting item:', id, reason);
    // Move item from pending to rejected
    const item = pendingApprovals.find(p => p.id === id);
    if (item) {
      setPendingApprovals(prev => prev.filter(p => p.id !== id));
      setRejectedItems(prev => [...prev, { ...item, status: DataEntryStatus.REJECTED }]);
    }
  };

  const viewItem = (item: ApprovalItem) => {
    console.log('Viewing item:', item);
  };

  return {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    isLoading,
    approveItem,
    rejectItem,
    viewItem,
  };
};
