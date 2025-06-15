
// Data entry API hooks
export { useDataEntriesQuery } from './useDataEntriesQuery';
export type { UseDataEntriesQueryOptions } from './useDataEntriesQuery';

// Re-export service functions
export { 
  fetchDataEntries, 
  saveDataEntries, 
  updateDataEntriesStatus,
  DataEntryService 
} from '@/services/api/dataEntry';
