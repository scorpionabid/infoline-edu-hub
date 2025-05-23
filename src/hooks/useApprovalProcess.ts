
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useApprovalProcess = () => {
  const [loading, setLoading] = useState(false);

  const approveEntries = async (schoolId: string, categoryId: string, categoryName: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success(`${categoryName} entries approved successfully`);
      return { success: true };
    } catch (error: any) {
      toast.error(`Failed to approve entries: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const rejectEntries = async (schoolId: string, categoryId: string, categoryName: string, reason: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          rejected_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success(`${categoryName} entries rejected`);
      return { success: true };
    } catch (error: any) {
      toast.error(`Failed to reject entries: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    approveEntries,
    rejectEntries
  };
};
