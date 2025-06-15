
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/integrations/supabase/client';

interface ApprovalActionResult {
  success: boolean;
  message?: string;
}

export const useApprovalActions = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const [isProcessing, setIsProcessing] = useState(false);

  const approveItem = useCallback(async (
    itemId: string, 
    comment?: string
  ): Promise<ApprovalActionResult> => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: t('userNotAuthenticated'),
        variant: 'destructive'
      });
      return { success: false };
    }

    setIsProcessing(true);
    
    try {
      const [categoryId, schoolId] = itemId.split('-');
      
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          approval_comment: comment || null,
          updated_at: new Date().toISOString()
        })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('itemApprovedSuccessfully'),
      });

      return { success: true, message: t('itemApprovedSuccessfully') };

    } catch (error) {
      console.error('Error approving item:', error);
      toast({
        title: t('error'),
        description: t('errorApprovingItem'),
        variant: 'destructive'
      });
      return { success: false, message: t('errorApprovingItem') };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, t, toast]);

  const rejectItem = useCallback(async (
    itemId: string, 
    reason: string
  ): Promise<ApprovalActionResult> => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: t('userNotAuthenticated'),
        variant: 'destructive'
      });
      return { success: false };
    }

    if (!reason.trim()) {
      toast({
        title: t('error'),
        description: t('rejectionReasonRequired'),
        variant: 'destructive'
      });
      return { success: false };
    }

    setIsProcessing(true);
    
    try {
      const [categoryId, schoolId] = itemId.split('-');
      
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('itemRejectedSuccessfully'),
      });

      return { success: true, message: t('itemRejectedSuccessfully') };

    } catch (error) {
      console.error('Error rejecting item:', error);
      toast({
        title: t('error'),
        description: t('errorRejectingItem'),
        variant: 'destructive'
      });
      return { success: false, message: t('errorRejectingItem') };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, t, toast]);

  const batchApprove = useCallback(async (
    itemIds: string[], 
    comment?: string
  ): Promise<ApprovalActionResult> => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: t('userNotAuthenticated'),
        variant: 'destructive'
      });
      return { success: false };
    }

    setIsProcessing(true);
    
    try {
      const promises = itemIds.map(itemId => {
        const [categoryId, schoolId] = itemId.split('-');
        
        return supabase
          .from('data_entries')
          .update({
            status: 'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            approval_comment: comment || null,
            updated_at: new Date().toISOString()
          })
          .eq('category_id', categoryId)
          .eq('school_id', schoolId)
          .eq('status', 'pending');
      });

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }

      toast({
        title: t('success'),
        description: t('itemsApprovedSuccessfully', { count: itemIds.length }),
      });

      return { success: true, message: t('itemsApprovedSuccessfully', { count: itemIds.length }) };

    } catch (error) {
      console.error('Error batch approving items:', error);
      toast({
        title: t('error'),
        description: t('errorApprovingItems'),
        variant: 'destructive'
      });
      return { success: false, message: t('errorApprovingItems') };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, t, toast]);

  const batchReject = useCallback(async (
    itemIds: string[], 
    reason: string
  ): Promise<ApprovalActionResult> => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: t('userNotAuthenticated'),
        variant: 'destructive'
      });
      return { success: false };
    }

    if (!reason.trim()) {
      toast({
        title: t('error'),
        description: t('rejectionReasonRequired'),
        variant: 'destructive'
      });
      return { success: false };
    }

    setIsProcessing(true);
    
    try {
      const promises = itemIds.map(itemId => {
        const [categoryId, schoolId] = itemId.split('-');
        
        return supabase
          .from('data_entries')
          .update({
            status: 'rejected',
            rejected_by: user.id,
            rejected_at: new Date().toISOString(),
            rejection_reason: reason,
            updated_at: new Date().toISOString()
          })
          .eq('category_id', categoryId)
          .eq('school_id', schoolId)
          .eq('status', 'pending');
      });

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }

      toast({
        title: t('success'),
        description: t('itemsRejectedSuccessfully', { count: itemIds.length }),
      });

      return { success: true, message: t('itemsRejectedSuccessfully', { count: itemIds.length }) };

    } catch (error) {
      console.error('Error batch rejecting items:', error);
      toast({
        title: t('error'),
        description: t('errorRejectingItems'),
        variant: 'destructive'
      });
      return { success: false, message: t('errorRejectingItems') };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, t, toast]);

  return {
    approveItem,
    rejectItem,
    batchApprove,
    batchReject,
    isProcessing
  };
};
