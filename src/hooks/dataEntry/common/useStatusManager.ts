
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
  showSubmitButton: boolean;
  showApprovalControls: boolean;
  allowedActions: string[];
  statusInfo: string;
  alerts: {
    approval?: string;
    rejection?: string;
    warning?: string;
    info?: string;
    message?: string;
    type?: 'info' | 'warning' | 'error' | 'success';
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
  executeTransition: (newStatus: DataEntryStatus, comment?: string) => Promise<void>;
  approveDraft: (comment?: string) => Promise<void>;
  rejectEntry: (reason: string) => Promise<void>;
  resetToDraft: () => Promise<void>;
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
    showSubmitButton: entryStatus === DataEntryStatus.DRAFT,
    showApprovalControls: entryStatus === DataEntryStatus.PENDING,
    allowedActions: entryStatus === DataEntryStatus.DRAFT ? ['save', 'submit'] : 
                   entryStatus === DataEntryStatus.PENDING ? ['approve', 'reject'] : [],
    statusInfo: entryStatus === DataEntryStatus.DRAFT ? 'This entry is in draft mode' :
               entryStatus === DataEntryStatus.PENDING ? 'This entry is pending approval' :
               entryStatus === DataEntryStatus.APPROVED ? 'This entry has been approved' :
               'This entry has been rejected',
    alerts: {
      approval: entryStatus === DataEntryStatus.APPROVED ? 'This entry has been approved' : undefined,
      rejection: entryStatus === DataEntryStatus.REJECTED ? 'This entry has been rejected' : undefined,
      warning: entryStatus === DataEntryStatus.PENDING ? 'This entry is pending approval' : undefined,
      info: entryStatus === DataEntryStatus.DRAFT ? 'This entry is in draft mode' : undefined,
      message: entryStatus === DataEntryStatus.APPROVED ? 'This entry has been approved' :
              entryStatus === DataEntryStatus.REJECTED ? 'This entry has been rejected' :
              entryStatus === DataEntryStatus.PENDING ? 'This entry is pending approval' :
              'This entry is in draft mode',
      type: entryStatus === DataEntryStatus.APPROVED ? 'success' :
           entryStatus === DataEntryStatus.REJECTED ? 'error' :
           entryStatus === DataEntryStatus.PENDING ? 'warning' : 'info'
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
    } catch (error: any) {
      console.error('Status transition failed:', error);
    }
  }, [entryStatus, updateStatus]);

  const approveDraft = useCallback(async (comment?: string) => {
    await executeTransition(DataEntryStatus.APPROVED, comment);
  }, [executeTransition]);

  const rejectEntry = useCallback(async (reason: string) => {
    await executeTransition(DataEntryStatus.REJECTED, reason);
  }, [executeTransition]);

  const resetToDraft = useCallback(async () => {
    await executeTransition(DataEntryStatus.DRAFT);
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
