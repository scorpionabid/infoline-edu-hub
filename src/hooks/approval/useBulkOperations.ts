
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface BulkOperationResult {
  id: string;
  success: boolean;
  error?: string;
  message?: string;
}

interface BulkOperationSummary {
  total: number;
  successful: number;
  failed: number;
  results: BulkOperationResult[];
}

export const useBulkOperations = () => {
  const user = useAuthStore(selectUser);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  // Bulk approve entries
  const bulkApprove = useCallback(async (
    entries: Array<{ id: string; type: 'school' | 'sector' }>,
    comment?: string
  ): Promise<BulkOperationSummary> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-approve-entries', {
        body: {
          entries,
          comment
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Bulk approval failed');
      }

      toast({
        title: t('success'),
        description: `${data.summary.successful} ${t('entriesApproved')}, ${data.summary.failed} ${t('entriesFailed')}`,
      });

      return data.summary;

    } catch (error) {
      console.error('Bulk approval error:', error);
      toast({
        title: t('error'),
        description: t('bulkApprovalError'),
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, t, toast]);

  // Bulk reject entries
  const bulkReject = useCallback(async (
    entries: Array<{ id: string; type: 'school' | 'sector' }>,
    reason: string
  ): Promise<BulkOperationSummary> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsProcessing(true);
    try {
      const results: BulkOperationResult[] = [];

      for (const entry of entries) {
        try {
          const [categoryId, entityId] = entry.id.split('-');
          
          if (entry.type === 'school') {
            const { error } = await supabase
              .from('data_entries')
              .update({
                status: 'rejected',
                rejected_at: new Date().toISOString(),
                rejected_by: user.id,
                rejection_reason: reason
              })
              .eq('category_id', categoryId)
              .eq('school_id', entityId)
              .eq('status', 'pending');

            if (error) throw error;

          } else if (entry.type === 'sector') {
            const { error } = await supabase
              .from('sector_data_entries')
              .update({
                status: 'rejected',
                rejected_at: new Date().toISOString(),
                rejected_by: user.id,
                rejection_reason: reason
              })
              .eq('category_id', categoryId)
              .eq('sector_id', entityId)
              .eq('status', 'pending');

            if (error) throw error;
          }

          results.push({
            id: entry.id,
            success: true,
            message: 'Entry rejected successfully'
          });

        } catch (error) {
          console.error(`Error rejecting entry ${entry.id}:`, error);
          results.push({
            id: entry.id,
            success: false,
            error: error.message
          });
        }
      }

      const summary = {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };

      toast({
        title: t('success'),
        description: `${summary.successful} ${t('entriesRejected')}, ${summary.failed} ${t('entriesFailed')}`,
      });

      return summary;

    } catch (error) {
      console.error('Bulk rejection error:', error);
      toast({
        title: t('error'),
        description: t('bulkRejectionError'),
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, t, toast]);

  // Auto-approve entries based on deadline
  const triggerAutoApproval = useCallback(async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-approve-deadline');

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Auto-approval failed');
      }

      toast({
        title: t('success'),
        description: `${data.summary.total_school_approvals + data.summary.total_sector_approvals} ${t('entriesAutoApproved')}`,
      });

      return data.summary;

    } catch (error) {
      console.error('Auto-approval error:', error);
      toast({
        title: t('error'),
        description: t('autoApprovalError'),
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [t, toast]);

  return {
    bulkApprove,
    bulkReject,
    triggerAutoApproval,
    isProcessing
  };
};
