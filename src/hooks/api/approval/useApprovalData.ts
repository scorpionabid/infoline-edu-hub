
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

interface ApprovalEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  entries: ApprovalEntry[];
  completionRate: number;
}

export const useApprovalData = () => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<ApprovalItem[]>([]);
  const [rejectedItems, setRejectedItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load real approval data from Supabase
  const loadApprovalData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      console.log('Loading approval data for user role:', user.role);
      
      // Get data entries based on user role
      let query = supabase
        .from('data_entries')
        .select(`
          *,
          schools!inner(id, name, sector_id, region_id),
          categories!inner(id, name)
        `);

      // Apply role-based filtering
      if (user.role === 'sectoradmin' && user.sector_id) {
        query = query.eq('schools.sector_id', user.sector_id);
      } else if (user.role === 'regionadmin' && user.region_id) {
        query = query.eq('schools.region_id', user.region_id);
      }
      // superadmin sees all data

      const { data: entries, error } = await query;

      if (error) {
        console.error('Error loading approval data:', error);
        throw error;
      }

      console.log('Loaded entries:', entries?.length || 0);

      if (!entries || entries.length === 0) {
        setPendingApprovals([]);
        setApprovedItems([]);
        setRejectedItems([]);
        return;
      }

      // Group entries by school and category
      const groupedData: Record<string, ApprovalItem> = {};
      
      entries.forEach((entry: any) => {
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
            status: entry.status as 'pending' | 'approved' | 'rejected',
            entries: [],
            completionRate: 0
          };
        }
        
        groupedData[key].entries.push({
          id: entry.id,
          school_id: entry.school_id,
          category_id: entry.category_id,
          column_id: entry.column_id,
          value: entry.value || '',
          status: entry.status,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          created_by: entry.created_by,
          approved_by: entry.approved_by,
          approved_at: entry.approved_at,
          rejected_by: entry.rejected_by,
          rejection_reason: entry.rejection_reason
        });
        
        // Update status to the most recent status
        if (entry.updated_at > groupedData[key].submittedAt) {
          groupedData[key].status = entry.status;
          groupedData[key].submittedAt = entry.updated_at;
        }
      });

      // Calculate completion rates and separate by status
      const pending: ApprovalItem[] = [];
      const approved: ApprovalItem[] = [];
      const rejected: ApprovalItem[] = [];

      Object.values(groupedData).forEach(item => {
        // Calculate completion rate
        const filledEntries = item.entries.filter(e => e.value && e.value.trim() !== '');
        item.completionRate = item.entries.length > 0 ? Math.round((filledEntries.length / item.entries.length) * 100) : 0;

        // Group by most common status in the group
        const statusCounts = item.entries.reduce((acc, entry) => {
          acc[entry.status] = (acc[entry.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonStatus = Object.entries(statusCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] as 'pending' | 'approved' | 'rejected';
        
        item.status = mostCommonStatus || 'pending';

        // Separate by status
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

      console.log('Grouped approval data:', { 
        pending: pending.length, 
        approved: approved.length, 
        rejected: rejected.length 
      });

      setPendingApprovals(pending);
      setApprovedItems(approved);
      setRejectedItems(rejected);

    } catch (error) {
      console.error('Error loading approval data:', error);
      toast.error('Təsdiq məlumatları yüklənilərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, user?.sector_id, user?.region_id, t]);

  // Approve item function
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
      
      toast.success('Məlumatlar uğurla təsdiqləndi');
      
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Məlumatları təsdiqləyərkən xəta baş verdi');
      throw error;
    }
  }, [user?.id, loadApprovalData]);

  // Reject item function
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
      
      toast.success('Məlumatlar rədd edildi');
      
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Məlumatları rədd edərkən xəta baş verdi');
      throw error;
    }
  }, [user?.id, loadApprovalData]);

  const viewItem = useCallback((item: ApprovalItem) => {
    console.log('Viewing approval item:', item);
  }, []);

  // Load data on mount
  useEffect(() => {
    if (user?.id) {
      loadApprovalData();
    }
  }, [loadApprovalData, user?.id]);

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

export default useApprovalData;
