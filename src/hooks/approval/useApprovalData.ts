
import { useState, useEffect, useCallback } from 'react';
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
  sectorId?: string;
  regionId?: string;
}

export const useApprovalData = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<ApprovalItem[]>([]);
  const [rejectedItems, setRejectedItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get user role and related IDs for RLS filtering
  const getUserRoleInfo = useCallback(async () => {
    if (!user?.id) return null;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, region_id, sector_id, school_id')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return data;
  }, [user?.id]);

  // Build query based on user role and permissions
  const buildApprovalQuery = useCallback((roleInfo: any) => {
    let query = supabase
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
          name,
          region_id,
          sector_id
        )
      `);

    // Apply RLS filtering based on user role
    if (roleInfo?.role === 'superadmin') {
      // SuperAdmin can see all entries
      query = query.in('status', [DataEntryStatus.PENDING, DataEntryStatus.APPROVED, DataEntryStatus.REJECTED]);
    } else if (roleInfo?.role === 'regionadmin') {
      // RegionAdmin can only see entries from their region
      query = query
        .in('status', [DataEntryStatus.PENDING, DataEntryStatus.APPROVED, DataEntryStatus.REJECTED])
        .eq('schools.region_id', roleInfo.region_id);
    } else if (roleInfo?.role === 'sectoradmin') {
      // SectorAdmin can only see entries from their sector
      query = query
        .in('status', [DataEntryStatus.PENDING, DataEntryStatus.APPROVED, DataEntryStatus.REJECTED])
        .eq('schools.sector_id', roleInfo.sector_id);
    } else if (roleInfo?.role === 'schooladmin') {
      // SchoolAdmin can only see their own school's entries
      query = query
        .in('status', [DataEntryStatus.PENDING, DataEntryStatus.APPROVED, DataEntryStatus.REJECTED])
        .eq('school_id', roleInfo.school_id);
    } else {
      // No role found, return empty query
      return null;
    }

    return query;
  }, []);

  // Load approval data with RLS compliance
  const loadApprovalData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get user role information first
      const roleInfo = await getUserRoleInfo();
      if (!roleInfo) {
        console.warn('No role information found for user');
        setIsLoading(false);
        return;
      }

      // Build and execute query with role-based filtering
      const query = buildApprovalQuery(roleInfo);
      if (!query) {
        console.warn('No valid query built for user role');
        setIsLoading(false);
        return;
      }

      const { data: entries, error } = await query;

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
            regionId: entry.schools?.region_id,
            sectorId: entry.schools?.sector_id,
            submittedAt: entry.created_at,
            submittedBy: entry.created_by || 'Unknown User',
            status: entry.status as DataEntryStatus,
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
  }, [user, t, toast, getUserRoleInfo, buildApprovalQuery]);

  // Check if user has permission to approve/reject
  const checkApprovalPermission = useCallback(async (item: ApprovalItem): Promise<boolean> => {
    if (!user?.id) return false;
    
    const roleInfo = await getUserRoleInfo();
    if (!roleInfo) return false;

    // SuperAdmin can approve everything
    if (roleInfo.role === 'superadmin') return true;
    
    // RegionAdmin can approve items from their region
    if (roleInfo.role === 'regionadmin' && item.regionId === roleInfo.region_id) return true;
    
    // SectorAdmin can approve items from their sector
    if (roleInfo.role === 'sectoradmin' && item.sectorId === roleInfo.sector_id) return true;
    
    // SchoolAdmin cannot approve their own submissions
    if (roleInfo.role === 'schooladmin') return false;
    
    return false;
  }, [user?.id, getUserRoleInfo]);

  // Approve item with permission check
  const approveItem = useCallback(async (itemId: string, comment?: string) => {
    const item = pendingApprovals.find(i => i.id === itemId);
    if (!item) return;

    // Check permissions
    const hasPermission = await checkApprovalPermission(item);
    if (!hasPermission) {
      toast({
        title: t('error'),
        description: t('noPermissionToApprove'),
        variant: 'destructive'
      });
      return;
    }

    const [categoryId, schoolId] = itemId.split('-');
    
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: DataEntryStatus.APPROVED,
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .eq('status', DataEntryStatus.PENDING);

      if (error) throw error;
      
      // Reload data
      await loadApprovalData();
      
      toast({
        title: t('success'),
        description: t('itemApproved'),
      });
      
    } catch (error) {
      console.error('Error approving item:', error);
      toast({
        title: t('error'),
        description: t('errorApprovingItem'),
        variant: 'destructive'
      });
      throw error;
    }
  }, [pendingApprovals, checkApprovalPermission, user?.id, loadApprovalData, t, toast]);

  // Reject item with permission check
  const rejectItem = useCallback(async (itemId: string, reason: string) => {
    const item = pendingApprovals.find(i => i.id === itemId);
    if (!item) return;

    // Check permissions
    const hasPermission = await checkApprovalPermission(item);
    if (!hasPermission) {
      toast({
        title: t('error'),
        description: t('noPermissionToReject'),
        variant: 'destructive'
      });
      return;
    }

    const [categoryId, schoolId] = itemId.split('-');
    
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: DataEntryStatus.REJECTED,
          rejection_reason: reason,
          rejected_by: user?.id
        })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .eq('status', DataEntryStatus.PENDING);

      if (error) throw error;
      
      // Reload data
      await loadApprovalData();
      
      toast({
        title: t('success'),
        description: t('itemRejected'),
      });
      
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast({
        title: t('error'),
        description: t('errorRejectingItem'),
        variant: 'destructive'
      });
      throw error;
    }
  }, [pendingApprovals, checkApprovalPermission, user?.id, loadApprovalData, t, toast]);

  // View item details
  const viewItem = useCallback((item: ApprovalItem) => {
    // This would typically navigate to a detailed view
    console.log('Viewing item:', item);
  }, []);

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('approval-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_entries'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Reload data when there are changes
          loadApprovalData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadApprovalData]);

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
    refreshData: loadApprovalData,
    checkApprovalPermission
  };
};
