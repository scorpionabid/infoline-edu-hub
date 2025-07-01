
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/hooks/auth/useUser';

export const useBulkOperations = () => {
  const { user } = useUser();
  const userId = user?.id;
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleBulkApprove = async (
    schoolIds: string[], 
    selectedColumn: any
  ): Promise<boolean> => {
    if (!selectedColumn?.id) {
      toast.error('Sütun seçilməyib');
      return false;
    }

    try {
      setSaving(true);
      console.log('Bulk approving data for schools:', schoolIds, 'column:', selectedColumn.id);

      const { error } = await supabase
        .from('school_data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('column_id', selectedColumn.id)
        .in('school_id', schoolIds);

      if (error) {
        console.error('Bulk approve error:', error);
        throw error;
      }

      console.log('Bulk approval successful for column:', selectedColumn.name);
      return true;
    } catch (error) {
      console.error('Failed to bulk approve data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleBulkReject = async (
    schoolIds: string[], 
    selectedColumn: any,
    reason: string
  ): Promise<boolean> => {
    if (!selectedColumn?.id) {
      toast.error('Sütun seçilməyib');
      return false;
    }

    try {
      setSaving(true);
      console.log('Bulk rejecting data for schools:', schoolIds, 'column:', selectedColumn.id);

      const { error } = await supabase
        .from('school_data_entries')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: userId,
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('column_id', selectedColumn.id)
        .in('school_id', schoolIds);

      if (error) {
        console.error('Bulk reject error:', error);
        throw error;
      }

      console.log('Bulk rejection successful for column:', selectedColumn.name);
      return true;
    } catch (error) {
      console.error('Failed to bulk reject data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    handleBulkApprove,
    handleBulkReject,
    saving
  };
};
