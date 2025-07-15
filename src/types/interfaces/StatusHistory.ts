export interface UseStatusHistoryOptions {
  entryId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface StatusHistoryEntry {
  id: string;
  data_entry_id: string;
  old_status: string;
  new_status: string;
  comment?: string;
  changed_at: string;
  changed_by: string;
  changed_by_name?: string;
  changed_by_email?: string;
  metadata?: Record<string, any>;
}

export interface StatusHistoryData {
  history: StatusHistoryEntry[];
  loading: boolean;
  error: Error | null;
  hasData: boolean;
  refresh: () => void;
  fetchHistory: (entryId?: string) => Promise<void>;
  exportHistory: () => Promise<void>;
  testConnection: () => Promise<{ success: boolean; error?: any }>;
}