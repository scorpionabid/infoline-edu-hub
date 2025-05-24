
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/common/useToast';

export const useApprovalProcess = () => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const approveEntry = async (entryId: string, reason?: string) => {
    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (dbError) throw dbError;
      
      success('Məlumat təsdiqləndi');
    } catch (err) {
      error('Təsdiqləmə zamanı xəta baş verdi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectEntry = async (entryId: string, reason: string) => {
    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (dbError) throw dbError;
      
      success('Məlumat rədd edildi');
    } catch (err) {
      error('Rədd etmə zamanı xəta baş verdi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    approveEntry,
    rejectEntry
  };
};
