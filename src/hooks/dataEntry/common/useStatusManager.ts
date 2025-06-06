
import { useState, useCallback } from 'react';
import { DataEntryStatus } from '@/types/dataEntry';

export interface StatusPermissions {
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canReset: boolean;
  canView: boolean;
  readOnly: boolean;
  showEditControls: boolean;
  allowedActions: string[];
  alerts: {
    approval?: string;
    rejection?: string;
    warning?: string;
    info?: string;
  };
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
    canReject: entryStatus === DataEntryStatus.PENDING,
    canReset: entryStatus !== DataEntryStatus.DRAFT,
    canView: true,
    readOnly: entryStatus !== DataEntryStatus.DRAFT,
    showEditControls: entryStatus === DataEntryStatus.DRAFT,
    allowedActions: entryStatus === DataEntryStatus.DRAFT ? ['save', 'submit'] : 
                   entryStatus === DataEntryStatus.PENDING ? ['approve', 'reject'] : [],
    alerts: {
      approval: entryStatus === DataEntryStatus.APPROVED ? 'This entry has been approved' : undefined,
      rejection: entryStatus === DataEntryStatus.REJECTED ? 'This entry has been rejected' : undefined,
      warning: entryStatus === DataEntryStatus.PENDING ? 'This entry is pending approval' : undefined,
      info: entryStatus === DataEntryStatus.DRAFT ? 'This entry is in draft mode' : undefined
    }
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
