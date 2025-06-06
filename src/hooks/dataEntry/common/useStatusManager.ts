import { useState, useCallback } from 'react';
import { DataEntryStatus } from '@/types/dataEntry';

// Unified StatusPermissions interface that matches both systems
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
  statusInfo: {
    current: DataEntryStatus;
    canTransitionTo: DataEntryStatus[];
    restrictions: string[];
  };
  alerts: {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    actionRequired: boolean;
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
  readOnlyReason?: string;
  statusDisplay: string;
  updateStatus: (status: DataEntryStatus) => void;
  executeTransition: (newStatus: DataEntryStatus) => Promise<void>;
  approveDraft: () => Promise<void>;
  rejectEntry: (reason: string) => Promise<void>;
  resetToDraft: () => Promise<void>;
}

export const useStatusManager = ({
  categoryId,
  schoolId,
  onStatusChange
}: UseStatusManagerOptions): UseStatusManagerResult => {
  const [entryStatus, setEntryStatus] = useState<DataEntryStatus>(DataEntryStatus.DRAFT);
  const [readOnlyReason, setReadOnlyReason] = useState<string>();

  const updateStatus = useCallback((status: DataEntryStatus) => {
    setEntryStatus(status);
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [onStatusChange]);

  const statusPermissions: StatusPermissions = {
    canEdit: entryStatus === DataEntryStatus.DRAFT || entryStatus === DataEntryStatus.REJECTED,
    canSubmit: entryStatus === DataEntryStatus.DRAFT || entryStatus === DataEntryStatus.REJECTED,
    canApprove: entryStatus === DataEntryStatus.PENDING,
    canReject: entryStatus === DataEntryStatus.PENDING,
    canReset: entryStatus === DataEntryStatus.APPROVED || entryStatus === DataEntryStatus.REJECTED,
    canView: true,
    readOnly: entryStatus === DataEntryStatus.APPROVED || entryStatus === DataEntryStatus.PENDING,
    showEditControls: entryStatus === DataEntryStatus.DRAFT || entryStatus === DataEntryStatus.REJECTED,
    showSubmitButton: entryStatus === DataEntryStatus.DRAFT || entryStatus === DataEntryStatus.REJECTED,
    showApprovalControls: entryStatus === DataEntryStatus.PENDING,
    allowedActions: getValidTransitions(entryStatus),
    statusInfo: {
      current: entryStatus,
      canTransitionTo: getValidTransitions(entryStatus) as DataEntryStatus[],
      restrictions: getStatusRestrictions(entryStatus)
    },
    alerts: {
      type: entryStatus === DataEntryStatus.APPROVED ? 'success' : 
            entryStatus === DataEntryStatus.REJECTED ? 'error' : 
            entryStatus === DataEntryStatus.PENDING ? 'warning' : 'info',
      message: entryStatus === DataEntryStatus.APPROVED ? 'Data has been approved' : 
               entryStatus === DataEntryStatus.REJECTED ? 'Data has been rejected' : 
               entryStatus === DataEntryStatus.PENDING ? 'Data is pending approval' : 
               'Data is in draft status',
      actionRequired: entryStatus === DataEntryStatus.PENDING,
      approval: entryStatus === DataEntryStatus.APPROVED ? 'Data has been approved' : undefined,
      rejection: entryStatus === DataEntryStatus.REJECTED ? 'Data has been rejected' : undefined,
      warning: entryStatus === DataEntryStatus.PENDING ? 'Data is pending approval' : undefined
    }
  };

  const executeTransition = useCallback(async (newStatus: DataEntryStatus) => {
    console.log('Executing status transition:', { from: entryStatus, to: newStatus });
    updateStatus(newStatus);
  }, [entryStatus, updateStatus]);

  const approveDraft = useCallback(async () => {
    await executeTransition(DataEntryStatus.APPROVED);
  }, [executeTransition]);

  const rejectEntry = useCallback(async (reason: string) => {
    console.log('Rejecting entry with reason:', reason);
    await executeTransition(DataEntryStatus.REJECTED);
  }, [executeTransition]);

  const resetToDraft = useCallback(async () => {
    await executeTransition(DataEntryStatus.DRAFT);
  }, [executeTransition]);

  const getStatusDisplay = () => {
    switch (entryStatus) {
      case DataEntryStatus.DRAFT: return 'Draft';
      case DataEntryStatus.PENDING: return 'Pending Approval';
      case DataEntryStatus.APPROVED: return 'Approved';
      case DataEntryStatus.REJECTED: return 'Rejected';
      default: return 'Unknown';
    }
  };

  return {
    entryStatus,
    statusPermissions,
    canEdit: statusPermissions.canEdit,
    canSubmit: statusPermissions.canSubmit,
    canApprove: statusPermissions.canApprove,
    canReject: statusPermissions.canReject,
    readOnly: statusPermissions.readOnly,
    readOnlyReason,
    statusDisplay: getStatusDisplay(),
    updateStatus,
    executeTransition,
    approveDraft,
    rejectEntry,
    resetToDraft
  };
};

function getValidTransitions(status: DataEntryStatus): string[] {
  switch (status) {
    case DataEntryStatus.DRAFT:
      return ['submit'];
    case DataEntryStatus.PENDING:
      return ['approve', 'reject'];
    case DataEntryStatus.APPROVED:
      return ['reset'];
    case DataEntryStatus.REJECTED:
      return ['edit', 'submit'];
    default:
      return [];
  }
}

function getStatusRestrictions(status: DataEntryStatus): string[] {
  switch (status) {
    case DataEntryStatus.APPROVED:
      return ['Cannot edit approved data'];
    case DataEntryStatus.PENDING:
      return ['Cannot edit while pending approval'];
    case DataEntryStatus.REJECTED:
      return ['Must address rejection reasons'];
    default:
      return [];
  }
}

export default useStatusManager;
