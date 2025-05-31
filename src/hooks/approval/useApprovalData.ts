
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';

interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  entries: any[];
  completionRate: number;
}

export const useApprovalData = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<ApprovalItem[]>([]);
  const [rejectedItems, setRejectedItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load approval data
  const loadApprovalData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get data entries with related information
      const { data: entries, error } = await supabase
        .from('data_entries')
        .select(`
          id,
          status,
          category_id,
          school_id,
          created_at,
          created_by,
          value,
          categories (
            id,
            name
          ),
          schools (
            id,
            name
          )
        `)
        .in('status', ['pending', 'approved', 'rejected']);

      if (error) throw error;

      // Group entries by category and school
      const groupedData: Record<string, ApprovalItem> = {};
      
      entries?.forEach(entry => {
        const key = `${entry.category_id}-${entry.school_id}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            id: key,
            categoryId: entry.category_id,
            categoryName: entry.categories?.name || 'Unknown Category',
            schoolId: entry.school_id,
            schoolName: entry.schools?.name || 'Unknown School',
            submittedAt: entry.created_at,
            submittedBy: entry.created_by || 'Unknown User',
            status: entry.status as any,
            entries: [],
            completionRate: 0
          };
        }
        
        groupedData[key].entries.push(entry);
      });

      // Calculate completion rates and separate by status
      const pending: ApprovalItem[] = [];
      const approved: ApprovalItem[] = [];
      const rejected: ApprovalItem[] = [];

      Object.values(groupedData).forEach(item => {
        // Calculate completion rate based on filled fields
        const filledEntries = item.entries.filter(e => e.value && e.value.trim() !== '');
        item.completionRate = item.entries.length > 0 ? (filledEntries.length / item.entries.length) * 100 : 0;

        // Group by status
        switch (item.status) {
          case 'pending':
            pending.push(item);
            break;
          case 'approved':
            approved.push(item);
            break;
          case 'rejected':
            rejected.push(item);
            break;
        }
      });

      setPendingApprovals(pending);
      setApprovedItems(approved);
      setRejectedItems(rejected);

    } catch (error) {
      console.error('Error loading approval data:', error);
      toast({
        title: t('error'),
        description: t('errorLoadingApprovalData'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, t, toast]);

  // Approve item
  const approveItem = useCallback(async (itemId: string, comment?: string) => {
    const [categoryId, schoolId] = itemId.split('-');
    
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .eq('status', 'pending');

      if (error) throw error;
      
      // Reload data
      await loadApprovalData();
      
    } catch (error) {
      console.error('Error approving item:', error);
      throw error;
    }
  }, [user?.id, loadApprovalData]);

  // Reject item
  const rejectItem = useCallback(async (itemId: string, reason: string) => {
    const [categoryId, schoolId] = itemId.split('-');
    
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejected_by: user?.id
        })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .eq('status', 'pending');

      if (error) throw error;
      
      // Reload data
      await loadApprovalData();
      
    } catch (error) {
      console.error('Error rejecting item:', error);
      throw error;
    }
  }, [user?.id, loadApprovalData]);

  // View item details
  const viewItem = useCallback((item: ApprovalItem) => {
    // This would typically navigate to a detailed view
    console.log('Viewing item:', item);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadApprovalData();
  }, [loadApprovalData]);

  return {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    isLoading,
    approveItem,
    rejectItem,
    viewItem,
    refreshData: loadApprovalData
  };
};
