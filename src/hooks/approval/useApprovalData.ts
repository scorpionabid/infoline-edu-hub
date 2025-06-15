
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { isValidUUID } from '@/utils/uuidValidator';
import { DataEntryStatus, DataEntryStatusEnum } from '@/types/dataEntry';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  
  const loadingRef = useRef(false);

  const queryClient = useQueryClient();

  const loadApprovalData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    if (loadingRef.current) {
      console.log('Already loading, skipping...');
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log('Loading approval data for user:', user.id);
      
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

      const schoolIds = [...new Set(entries.map(e => e.school_id))];
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .in('id', schoolIds);

      if (schoolsError) {
        console.error('Error loading schools:', schoolsError);
        throw schoolsError;
      }

      const categoryIds = [...new Set(entries.map(e => e.category_id))];
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds);

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        throw categoriesError;
      }

      const schoolMap = new Map(schools?.map(s => [s.id, s.name]) || []);
      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);

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
            submittedBy: isValidUUID(entry.created_by) ? entry.created_by : 'Unknown User',
            status: entry.status as DataEntryStatus,
            entries: [],
            completionRate: 0
          };
        }
        
        groupedData[key].entries.push(entry);
        
        if (entry.updated_at > groupedData[key].submittedAt) {
          groupedData[key].status = entry.status as DataEntryStatus;
          groupedData[key].submittedAt = entry.updated_at;
        }
      });

      const pending: ApprovalItem[] = [];
      const approved: ApprovalItem[] = [];
      const rejected: ApprovalItem[] = [];

      Object.values(groupedData).forEach(item => {
        const filledEntries = item.entries.filter(e => e.value && e.value.trim() !== '');
        const totalEntries = item.entries.length;
        const completionValue = totalEntries > 0 ? (filledEntries.length / totalEntries) * 100 : 0;
        item.completionRate = Math.round(completionValue);

        const statusCounts = item.entries.reduce((acc, entry) => {
          acc[entry.status] = (acc[entry.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonStatus = Object.entries(statusCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] as DataEntryStatus;
        
        item.status = mostCommonStatus || 'pending';

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
  }, [user?.id, t, toast]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case DataEntryStatusEnum.PENDING:
        return 'yellow';
      case DataEntryStatusEnum.APPROVED:
        return 'green';
      case DataEntryStatusEnum.REJECTED:
        return 'red';
      case DataEntryStatusEnum.REQUIRES_REVISION:
        return 'orange';
      default:
        return 'gray';
    }
  };

  useEffect(() => {
    if (user?.id && !loadingRef.current) {
      loadApprovalData();
    }
  }, [user?.id]);

  return {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    isLoading,
    approveItem,
    rejectItem,
    viewItem,
    refreshData: loadApprovalData,
    getStatusColor
  };
};
