
import { useState, useEffect } from 'react';

export interface SectorApprovalItem {
  id: string;
  sectorName: string;
  categoryName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  submittedBy: string;
  completionRate: number;
}

export const useSectorApprovalData = () => {
  const [pendingApprovals, setPendingApprovals] = useState<SectorApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<SectorApprovalItem[]>([]);
  const [rejectedItems, setRejectedItems] = useState<SectorApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setPendingApprovals([]);
      setApprovedItems([]);
      setRejectedItems([]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const approveSectorItem = async (itemId: string) => {
    // Mock approval
    console.log('Approving sector item:', itemId);
  };

  const rejectSectorItem = async (itemId: string, reason: string) => {
    // Mock rejection
    console.log('Rejecting sector item:', itemId, reason);
  };

  return {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    isLoading,
    approveSectorItem,
    rejectSectorItem
  };
};
