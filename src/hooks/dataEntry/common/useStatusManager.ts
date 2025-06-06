
import { useState, useCallback } from 'react';
import { DataEntryStatus } from '@/types/dataEntry';

export interface StatusPermissions {
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
}

export interface UseStatusManagerOptions {
  categoryId: string;
  schoolId: string;
  onStatusChange?: (newStatus: DataEntryStatus) => void;
}

export interface UseStatusManagerResult {
  entryStatus: DataEntryStatus;
  statusPermissions: StatusPermissions;
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  readOnly: boolean;
  readOnlyReason: string | null;
  statusDisplay: string;
  updateStatus: (status: DataEntryStatus) => void;
  executeTransition: (newStatus: DataEntryStatus, comment?: string) => Promise<{ success: boolean; message?: string; error?: string; }>;
  approveDraft: (comment?: string) => Promise<{ success: boolean; message?: string; error?: string; }>;
  rejectEntry: (reason: string) => Promise<{ success: boolean; message?: string; error?: string; }>;
  resetToDraft: () => Promise<{ success: boolean; message?: string; error?: string; }>;
}

export const useStatusManager = ({ 
  categoryId, 
  schoolId, 
  onStatusChange 
}: UseStatusManagerOptions): UseStatusManagerResult => {
  const [entryStatus, setEntryStatus] = useState<DataEntryStatus>(DataEntryStatus.DRAFT);

  const statusPermissions: StatusPermissions = {
    canEdit: entryStatus === DataEntryStatus.DRAFT,
    canSubmit: entryStatus === DataEntryStatus.DRAFT,
    canApprove: entryStatus === DataEntryStatus.PENDING,
    canReject: entryStatus === DataEntryStatus.PENDING
  };

  const updateStatus = useCallback((status: DataEntryStatus) => {
    setEntryStatus(status);
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [onStatusChange]);

  const executeTransition = useCallback(async (
    newStatus: DataEntryStatus, 
    comment?: string
  ) => {
    try {
      console.log('Status transition:', { from: entryStatus, to: newStatus, comment });
      updateStatus(newStatus);
      return { success: true, message: 'Status updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [entryStatus, updateStatus]);

  const approveDraft = useCallback(async (comment?: string) => {
    return executeTransition(DataEntryStatus.APPROVED, comment);
  }, [executeTransition]);

  const rejectEntry = useCallback(async (reason: string) => {
    return executeTransition(DataEntryStatus.REJECTED, reason);
  }, [executeTransition]);

  const resetToDraft = useCallback(async () => {
    return executeTransition(DataEntryStatus.DRAFT);
  }, [executeTransition]);

  const readOnly = !statusPermissions.canEdit;
  const readOnlyReason = entryStatus === DataEntryStatus.APPROVED ? 'approved' :
                        entryStatus === DataEntryStatus.PENDING ? 'pending' : null;

  const statusDisplay = entryStatus === DataEntryStatus.DRAFT ? 'Draft' :
                       entryStatus === DataEntryStatus.PENDING ? 'Pending Approval' :
                       entryStatus === DataEntryStatus.APPROVED ? 'Approved' :
                       entryStatus === DataEntryStatus.REJECTED ? 'Rejected' : 'Unknown';

  return {
    entryStatus,
    statusPermissions,
    canEdit: statusPermissions.canEdit,
    canSubmit: statusPermissions.canSubmit,
    canApprove: statusPermissions.canApprove,
    canReject: statusPermissions.canReject,
    readOnly,
    readOnlyReason,
    statusDisplay,
    updateStatus,
    executeTransition,
    approveDraft,
    rejectEntry,
    resetToDraft
  };
};

export default useStatusManager;
