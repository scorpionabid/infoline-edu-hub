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

  return {
    history,
    loading,
    error,
    fetchHistory
  };
};