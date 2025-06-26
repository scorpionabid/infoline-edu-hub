/**
 * Status History Components Index
 * 
 * Bu faylda status history ilə bağlı bütün komponentlər export edilir.
 */

export { default as StatusHistoryTable } from './StatusHistoryTable';
export { default as StatusHistoryDashboard } from './StatusHistoryDashboard';

// Export all types for external use
export type {
  StatusHistoryEntry,
  StatusHistoryOptions,
  // StatusHistoryServiceResponse
} from '@/services/statusHistoryService';

export type {
  UseStatusHistoryOptions,
  // UseStatusHistoryReturn
} from '@/hooks/useStatusHistory';
