
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useApprovalProcess = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const approveEntry = async (entryId: string, comment?: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Məlumat təsdiqləndi');
      return true;
    } catch (error: any) {
      console.error('Error approving entry:', error);
      toast.error('Təsdiqləmə zamanı xəta baş verdi');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const rejectEntry = async (entryId: string, reason: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejected_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Məlumat rədd edildi');
      return true;
    } catch (error: any) {
      console.error('Error rejecting entry:', error);
      toast.error('Rədd etmə zamanı xəta baş verdi');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    approveEntry,
    rejectEntry,
    isProcessing
  };
};
