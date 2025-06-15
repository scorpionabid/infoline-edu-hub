
import { DataEntryStatus } from '@/types/dataEntry';

const VALID_TRANSITIONS: Record<DataEntryStatus, DataEntryStatus[]> = {
  'draft': ['pending', 'approved'],
  'pending': ['approved', 'rejected', 'requires_revision'],
  'approved': ['requires_revision'],
  'rejected': ['pending', 'requires_revision'],
  'requires_revision': ['pending', 'approved']
};

export const useStatusManager = () => {
  const canTransition = (from: DataEntryStatus, to: DataEntryStatus): boolean => {
    return VALID_TRANSITIONS[from]?.includes(to) || false;
  };

  const getValidTransitions = (status: DataEntryStatus): DataEntryStatus[] => {
    return VALID_TRANSITIONS[status] || [];
  };

  const getStatusColor = (status: DataEntryStatus): string => {
    switch (status) {
      case 'draft': return 'gray';
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'requires_revision': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: DataEntryStatus): string => {
    switch (status) {
      case 'draft': return 'Qaralama';
      case 'pending': return 'Gözləyir';
      case 'approved': return 'Təsdiqlənib';
      case 'rejected': return 'Rədd edilib';
      case 'requires_revision': return 'Düzəliş tələb olunur';
      default: return status;
    }
  };

  return {
    canTransition,
    getValidTransitions,
    getStatusColor,
    getStatusLabel,
    VALID_TRANSITIONS
  };
};
