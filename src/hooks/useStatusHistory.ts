import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useStatusHistory = () => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = async (entryId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('get_status_history_secure', {
        entry_id: entryId,
        limit_count: 50
      });

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const exportHistory = async () => {
    try {
      const csv = history.map(entry => ({
        ID: entry.id,
        EntryID: entry.data_entry_id,
        OldStatus: entry.old_status,
        NewStatus: entry.new_status,
        Comment: entry.comment || '',
        ChangedAt: entry.changed_at,
        ChangedBy: entry.changed_by_name || entry.changed_by
      }));
      
      // Simple CSV export simulation
      console.log('Exporting history:', csv);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('status_transition_log').select('count').limit(1);
      return { success: !error, error };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    history,
    loading,
    error,
    fetchHistory,
    hasData: history.length > 0,
    refresh: () => fetchHistory(),
    exportHistory,
    testConnection
  };
};