
import { DataEntryStatus, DataEntryValue } from './dataEntry';

export interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  submittedBy: string;
  submittedAt: string;
  status: DataEntryStatus;
  entries: DataEntryValue[];
  completionRate: number;
}

export interface ApprovalManagerProps {
  pendingApprovals: ApprovalItem[];
  approvedItems: ApprovalItem[];
  rejectedItems: ApprovalItem[];
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, reason: string) => void;
  onView: (item: ApprovalItem) => void;
  isLoading: boolean;
}

export interface ApprovalAction {
  type: 'approve' | 'reject';
  itemId: string;
  comment?: string;
  reason?: string;
}

export interface ApprovalFilters {
  status?: DataEntryStatus;
  schoolId?: string;
  categoryId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
}
