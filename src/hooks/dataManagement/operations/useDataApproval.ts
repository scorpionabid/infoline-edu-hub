
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/hooks/auth/useUser';

export const useDataApproval = () => {
  const { user } = useUser();
  const userId = user?.id;
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleDataApprove = async (
    schoolId: string, 
    selectedColumn: any,
    comment?: string
  ): Promise<boolean> => {
    if (!selectedColumn?.id) {
      toast.error('Sütun seçilməyib');
      return false;
    }

    try {
      setSaving(true);
      console.log('Approving data for school:', schoolId, 'column:', selectedColumn.id);

      const { error } = await supabase
        .from('school_data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userId,
          approval_comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('column_id', selectedColumn.id);

      if (error) {
        console.error('Approve error:', error);
        throw error;
      }

      console.log('Data approved successfully for column:', selectedColumn.name);
      return true;
    } catch (error) {
      console.error('Failed to approve data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDataReject = async (
    schoolId: string, 
    selectedColumn: any,
    reason: string, 
    comment?: string
  ): Promise<boolean> => {
    if (!selectedColumn?.id) {
      toast.error('Sütun seçilməyib');
      return false;
    }

    try {
      setSaving(true);
      console.log('Rejecting data for school:', schoolId, 'column:', selectedColumn.id);

      const { error } = await supabase
        .from('school_data_entries')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: userId,
          rejection_reason: reason,
          rejection_comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('column_id', selectedColumn.id);

      if (error) {
        console.error('Reject error:', error);
        throw error;
      }

      console.log('Data rejected successfully for column:', selectedColumn.name);
      return true;
    } catch (error) {
      console.error('Failed to reject data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    handleDataApprove,
    handleDataReject,
    saving
  };
};
