
import { useState, useCallback } from 'react';
import { DataEntryStatus } from '@/types/dataEntry';

export const useStatusManager = () => {
  const [status, setStatus] = useState<DataEntryStatus>(DataEntryStatus.DRAFT);

  const canTransitionTo = useCallback((newStatus: DataEntryStatus) => {
    const validTransitions: Record<DataEntryStatus, DataEntryStatus[]> = {
      [DataEntryStatus.DRAFT]: [DataEntryStatus.PENDING],
      [DataEntryStatus.PENDING]: [DataEntryStatus.APPROVED, DataEntryStatus.REJECTED, DataEntryStatus.DRAFT],
      [DataEntryStatus.APPROVED]: [DataEntryStatus.DRAFT],
      [DataEntryStatus.REJECTED]: [DataEntryStatus.DRAFT]
    };
    
    return validTransitions[status]?.includes(newStatus) || false;
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
