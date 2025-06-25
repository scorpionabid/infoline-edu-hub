
import { useState, useCallback } from 'react';
import { DataEntryStatus, DATA_ENTRY_STATUS, DATA_ENTRY_STATUS_TRANSITIONS } from '@/types/dataEntry';

export const useStatusManager = () => {
  const [status, setStatus] = useState<DataEntryStatus>(DATA_ENTRY_STATUS.DRAFT);

  const canTransitionTo = useCallback((newStatus: DataEntryStatus) => {
    return DATA_ENTRY_STATUS_TRANSITIONS[status]?.includes(newStatus) || false;
  }, [status]);

  const updateStatus = useCallback((newStatus: DataEntryStatus) => {
    if (canTransitionTo(newStatus)) {
      setStatus(newStatus);
      return true;
    }
    return false;
  }, [canTransitionTo]);

  return {
    status,
    setStatus,
    updateStatus,
    canTransitionTo
  };
};
