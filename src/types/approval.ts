import { DataEntryStatus, DataEntryValue } from './dataEntry';

// Original types for backwards compatibility
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

// Enhanced types for new approval system
export interface EnhancedApprovalItem {
  id: string; // schoolId-categoryId format
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: DataEntryStatus;
  submittedBy?: string;
  submittedAt?: string;
  completionRate: number;
  canApprove: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  entries?: any[];
}

export interface EnhancedApprovalFilter {
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
  regionId?: string;
  sectorId?: string;
  categoryId?: string;
  searchTerm?: string;
  dateRange?: { start: Date; end: Date };
}

export interface EnhancedApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
}

export interface BulkApprovalResult {
  successful: number;
  failed: number;
  errors: string[];
}

export interface ApprovalServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}