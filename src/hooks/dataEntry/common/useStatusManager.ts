
import { useState, useCallback } from 'react';
import { DataEntryStatus } from '@/types/dataEntry';

export const useStatusManager = () => {
  const [status, setStatus] = useState<DataEntryStatus>('draft');

  const canTransitionTo = useCallback((newStatus: DataEntryStatus) => {
    const validTransitions: Record<DataEntryStatus, DataEntryStatus[]> = {
      'draft': ['pending'],
      'pending': ['approved', 'rejected', 'draft'],
      'approved': ['draft'],
      'rejected': ['draft'],
      'requires_revision': ['draft', 'pending']
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
