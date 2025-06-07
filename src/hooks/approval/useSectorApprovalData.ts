import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { SectorApprovalItem } from '@/types/sectorData';

// Define SectorDataEntry interface locally with proper types
interface SectorDataEntry {
  id: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  category_id: string;
  sector_id: string;
  column_id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  value: string;
}

export const useSectorApprovalData = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  
  const [pendingApprovals, setPendingApprovals] = useState<SectorApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<SectorApprovalItem[]>([]);
  const [rejectedItems, setRejectedItems] = useState<SectorApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get user role and related IDs for RLS filtering
  const getUserRoleInfo = useCallback(async () => {
    if (!user?.id) return null;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, region_id, sector_id')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return data;
  }, [user?.id]);

  // Build query based on user role and permissions
  const buildSectorApprovalQuery = useCallback((roleInfo: any) => {
    let query = supabase
      .from('sector_data_entries')
      .select(`
        id,
        status,
        category_id,
        sector_id,
        column_id,
        created_at,
        created_by,
        updated_at,
        value,
        categories (
          id,
          name
        ),
        sectors (
          id,
          name,
          region_id
        )
      `);

    // Apply RLS filtering based on user role
    if (roleInfo?.role === 'superadmin') {
      // SuperAdmin can see all entries
      query = query.in('status', ['pending', 'approved', 'rejected']);
    } else if (roleInfo?.role === 'regionadmin') {
      // RegionAdmin can only see entries from their region
      query = query
        .in('status', ['pending', 'approved', 'rejected'])
        .eq('sectors.region_id', roleInfo.region_id);
    } else if (roleInfo?.role === 'sectoradmin') {
      // SectorAdmin can only see their own sector's entries
      query = query
        .in('status', ['pending', 'approved', 'rejected'])
        .eq('sector_id', roleInfo.sector_id);
    } else {
      // No permission to view sector data
      return null;
    }

    return query;
  }, []);

  // Load sector approval data with RLS compliance
  const loadSectorApprovalData = useCallback(async () => {
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
      const query = buildSectorApprovalQuery(roleInfo);
      if (!query) {
        console.warn('No valid query built for user role');
        setIsLoading(false);
        return;
      }

      const { data: entries, error } = await query;

      if (error) throw error;

      // Group entries by category and sector
      const groupedData: Record<string, SectorApprovalItem> = {};
      
      entries?.forEach(entry => {
        const key = `${entry.category_id}-${entry.sector_id}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            id: key,
            categoryId: entry.category_id,
            categoryName: entry.categories?.name || 'Unknown Category',
            sectorId: entry.sector_id,
            sectorName: entry.sectors?.name || 'Unknown Sector',
            regionId: entry.sectors?.region_id,
            submittedAt: entry.created_at,
            submittedBy: entry.created_by || 'Unknown User',
            status: entry.status as 'pending' | 'approved' | 'rejected',
            entries: [],
            completionRate: 0
          };
        }
        
        // Convert entry to SectorDataEntry format with proper type casting
        const sectorEntry: SectorDataEntry = {
          id: entry.id,
          status: entry.status as 'approved' | 'pending' | 'rejected' | 'draft',
          category_id: entry.category_id,
          sector_id: entry.sector_id,
          column_id: entry.column_id || '',
          created_at: entry.created_at,
          created_by: entry.created_by,
          updated_at: entry.updated_at || entry.created_at,
          value: entry.value
        };
        
        groupedData[key].entries.push(sectorEntry);
      });

      // Calculate completion rates and separate by status
      const pending: SectorApprovalItem[] = [];
      const approved: SectorApprovalItem[] = [];
      const rejected: SectorApprovalItem[] = [];

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
      console.error('Error loading sector approval data:', error);
      toast({
        title: t('error'),
        description: t('errorLoadingSectorApprovalData'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, t, toast, getUserRoleInfo, buildSectorApprovalQuery]);

  // Check if user has permission to approve/reject sector data
  const checkSectorApprovalPermission = useCallback(async (item: SectorApprovalItem): Promise<boolean> => {
    if (!user?.id) return false;
    
    const roleInfo = await getUserRoleInfo();
    if (!roleInfo) return false;

    // SuperAdmin can approve everything
    if (roleInfo.role === 'superadmin') return true;
    
    // RegionAdmin can approve items from their region
    if (roleInfo.role === 'regionadmin' && item.regionId === roleInfo.region_id) return true;
    
    // SectorAdmin cannot approve their own submissions
    if (roleInfo.role === 'sectoradmin') return false;
    
    return false;
  }, [user?.id, getUserRoleInfo]);

  // Approve sector item with permission check
  const approveSectorItem = useCallback(async (itemId: string, comment?: string) => {
    const item = pendingApprovals.find(i => i.id === itemId);
    if (!item) return;

    // Check permissions
    const hasPermission = await checkSectorApprovalPermission(item);
    if (!hasPermission) {
      toast({
        title: t('error'),
        description: t('noPermissionToApprove'),
        variant: 'destructive'
      });
      return;
    }

    const [categoryId, sectorId] = itemId.split('-');
    
    try {
      const { error } = await supabase
        .from('sector_data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('category_id', categoryId)
        .eq('sector_id', sectorId)
        .eq('status', 'pending');

      if (error) throw error;
      
      // Reload data
      await loadSectorApprovalData();
      
      toast({
        title: t('success'),
        description: t('sectorItemApproved'),
      });
      
    } catch (error) {
      console.error('Error approving sector item:', error);
      toast({
        title: t('error'),
        description: t('errorApprovingSectorItem'),
        variant: 'destructive'
      });
      throw error;
    }
  }, [pendingApprovals, checkSectorApprovalPermission, user?.id, loadSectorApprovalData, t, toast]);

  // Reject sector item with permission check
  const rejectSectorItem = useCallback(async (itemId: string, reason: string) => {
    const item = pendingApprovals.find(i => i.id === itemId);
    if (!item) return;

    // Check permissions
    const hasPermission = await checkSectorApprovalPermission(item);
    if (!hasPermission) {
      toast({
        title: t('error'),
        description: t('noPermissionToReject'),
        variant: 'destructive'
      });
      return;
    }

    const [categoryId, sectorId] = itemId.split('-');
    
    try {
      const { error } = await supabase
        .from('sector_data_entries')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejected_by: user?.id,
          rejected_at: new Date().toISOString()
        })
        .eq('category_id', categoryId)
        .eq('sector_id', sectorId)
        .eq('status', 'pending');

      if (error) throw error;
      
      // Reload data
      await loadSectorApprovalData();
      
      toast({
        title: t('success'),
        description: t('sectorItemRejected'),
      });
      
    } catch (error) {
      console.error('Error rejecting sector item:', error);
      toast({
        title: t('error'),
        description: t('errorRejectingSectorItem'),
        variant: 'destructive'
      });
      throw error;
    }
  }, [pendingApprovals, checkSectorApprovalPermission, user?.id, loadSectorApprovalData, t, toast]);

  // Setup real-time subscription for sector data
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('sector-approval-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sector_data_entries'
        },
        (payload) => {
          console.log('Real-time sector approval update received:', payload);
          // Reload data when there are changes
          loadSectorApprovalData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadSectorApprovalData]);

  // Load data on mount
  useEffect(() => {
    loadSectorApprovalData();
  }, [loadSectorApprovalData]);

  return {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    isLoading,
    approveSectorItem,
    rejectSectorItem,
    refreshData: loadSectorApprovalData,
    checkSectorApprovalPermission
  };
};
