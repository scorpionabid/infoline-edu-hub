import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { DataEntryStatus } from '@/types/dataEntry';

interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  submittedAt: string;
  submittedBy: string;
  status: DataEntryStatus;
  entries: any[];
  completionRate: number;
}

export const useApprovalData = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<ApprovalItem[]>([]);
  const [rejectedItems, setRejectedItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use ref to prevent multiple simultaneous loads
  const loadingRef = useRef(false);

  // Simplified data loading without complex joins
  const loadApprovalData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('Already loading, skipping...');
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log('Loading approval data for user:', user.id);
      
      // Step 1: Get data entries (RLS will automatically filter)
      const { data: entries, error: entriesError } = await supabase
        .from('data_entries')
        .select('*')
        .in('status', ['pending', 'approved', 'rejected']);

      if (entriesError) {
        console.error('Error loading entries:', entriesError);
        throw entriesError;
      }

      console.log('Loaded entries:', entries?.length || 0);

      if (!entries || entries.length === 0) {
        setPendingApprovals([]);
        setApprovedItems([]);
        setRejectedItems([]);
        return;
      }

      // Step 2: Get unique school IDs
      const schoolIds = [...new Set(entries.map(e => e.school_id))];
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .in('id', schoolIds);

      if (schoolsError) {
        console.error('Error loading schools:', schoolsError);
        throw schoolsError;
      }

      // Step 3: Get unique category IDs
      const categoryIds = [...new Set(entries.map(e => e.category_id))];
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds);

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        throw categoriesError;
      }

      // Step 4: Create lookup maps
      const schoolMap = new Map(schools?.map(s => [s.id, s.name]) || []);
      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);

      // Step 5: Group entries by category and school
      const groupedData: Record<string, ApprovalItem> = {};
      
      entries.forEach(entry => {
        const key = `${entry.category_id}-${entry.school_id}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            id: key,
            categoryId: entry.category_id,
            categoryName: categoryMap.get(entry.category_id) || 'Unknown Category',
            schoolId: entry.school_id,
            schoolName: schoolMap.get(entry.school_id) || 'Unknown School',
            submittedAt: entry.created_at,
            submittedBy: entry.created_by || 'Unknown User',
            status: entry.status as DataEntryStatus,
            entries: [],
            completionRate: 0
          };
        }
        
        groupedData[key].entries.push(entry);
        
        // Update status to the most recent status
        if (entry.updated_at > groupedData[key].submittedAt) {
          groupedData[key].status = entry.status as DataEntryStatus;
          groupedData[key].submittedAt = entry.updated_at;
        }
      });

      // Step 6: Calculate completion rates and separate by status
      const pending: ApprovalItem[] = [];
      const approved: ApprovalItem[] = [];
      const rejected: ApprovalItem[] = [];

      Object.values(groupedData).forEach(item => {
        // Calculate completion rate
        const filledEntries = item.entries.filter(e => e.value && e.value.trim() !== '');
        const completionValue = item.entries.length > 0 ? (filledEntries.length / item.entries.length) * 100 : 0;
        item.completionRate = Math.round(completionValue);

        // Group by most common status in the group
        const statusCounts = item.entries.reduce((acc, entry) => {
          acc[entry.status] = (acc[entry.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonStatus = Object.entries(statusCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] as DataEntryStatus;
        
        item.status = mostCommonStatus || DataEntryStatus.PENDING;

        // Separate by status
        switch (item.status) {
          case DataEntryStatus.PENDING:
            pending.push(item);
            break;
          case DataEntryStatus.APPROVED:
            approved.push(item);
            break;
          case DataEntryStatus.REJECTED:
            rejected.push(item);
            break;
        }
      });

      console.log('Grouped data:', { pending: pending.length, approved: approved.length, rejected: rejected.length });

      setPendingApprovals(pending);
      setApprovedItems(approved);
      setRejectedItems(rejected);

    } catch (error) {
      console.error('Error loading approval data:', error);
      toast({
        title: t('error') || 'Error',
        description: t('errorLoadingApprovalData') || 'Error loading approval data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, t, toast]); // Remove dependencies that cause re-creation

  // Simplified approve function
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
      
      await loadApprovalData();
      
      toast({
        title: t('success') || 'Success',
        description: t('itemApproved') || 'Item approved successfully',
      });
      
    } catch (error) {
      console.error('Error approving item:', error);
      toast({
        title: t('error') || 'Error',
        description: t('errorApprovingItem') || 'Error approving item',
        variant: 'destructive'
      });
      throw error;
    }
  }, [user?.id, loadApprovalData, t, toast]);

  // Simplified reject function
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
      
      await loadApprovalData();
      
      toast({
        title: t('success') || 'Success',
        description: t('itemRejected') || 'Item rejected successfully',
      });
      
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast({
        title: t('error') || 'Error',
        description: t('errorRejectingItem') || 'Error rejecting item',
        variant: 'destructive'
      });
      throw error;
    }
  }, [user?.id, loadApprovalData, t, toast]);

  const viewItem = useCallback((item: ApprovalItem) => {
    console.log('Viewing item:', item);
  }, []);

  // Load data on mount - Fixed dependency loop
  useEffect(() => {
    if (user?.id && !loadingRef.current) {
      loadApprovalData();
    }
  }, [user?.id]); // Only depend on user ID to prevent infinite loop

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
