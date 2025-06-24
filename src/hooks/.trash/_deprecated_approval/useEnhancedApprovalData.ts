import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import EnhancedApprovalService, { 
  ApprovalFilter, 
  ApprovalItem, 
  ApprovalStats, 
  ServiceResponse 
} from '@/services/approval/enhancedApprovalService';
import { DataEntryStatus } from '@/types/core/dataEntry';

export interface UseEnhancedApprovalDataProps {
  initialFilter?: ApprovalFilter;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseEnhancedApprovalDataReturn {
  // Data
  items: ApprovalItem[];
  stats: ApprovalStats;
  filter: ApprovalFilter;
  
  // States
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadItems: () => Promise<void>;
  approveItem: (id: string, comment?: string) => Promise<void>;
  rejectItem: (id: string, reason: string, comment?: string) => Promise<void>;
  bulkApproval: (ids: string[], action: 'approve' | 'reject', params: any) => Promise<ServiceResponse>;
  updateFilter: (newFilter: Partial<ApprovalFilter>) => void;
  resetFilter: () => void;
  
  // Derived data
  pendingItems: ApprovalItem[];
  approvedItems: ApprovalItem[];
  rejectedItems: ApprovalItem[];
  draftItems: ApprovalItem[];
  
  // Selection management
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  selectAll: () => void;
  selectNone: () => void;
  isAllSelected: boolean;
}

/**
 * Enhanced Approval Data Hook
 * 
 * Bu hook real data ilə approval workflow-u idarə edir:
 * - Real-time subscription to approval changes
 * - Advanced filtering and search
 * - Bulk operations support
 * - Smart caching and optimization
 */
export const useEnhancedApprovalData = (
  props: UseEnhancedApprovalDataProps = {}
): UseEnhancedApprovalDataReturn => {
  
  // State management
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    total: 0
  });
  const [filter, setFilter] = useState<ApprovalFilter>(() => 
    props.initialFilter || { status: 'pending' }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Load items function
  const loadItems = useCallback(async () => {
    if (isLoading) {
      console.log('Already loading, skipping...');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading approval items with filter:', filter);
      
      // Load items
      const itemsResult = await EnhancedApprovalService.getApprovalItems(filter);
      
      if (itemsResult.success && itemsResult.data) {
        setItems(itemsResult.data);
        console.log(`Loaded ${itemsResult.data.length} approval items`);
      } else {
        console.error('Failed to load items:', itemsResult.error);
        setError(itemsResult.error || 'Məlumatlar alınarkən xəta');
        setItems([]);
      }
      
      // Load stats only if items were loaded successfully
      if (itemsResult.success) {
        const statsResult = await EnhancedApprovalService.getApprovalStats(filter);
        
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        } else {
          console.warn('Failed to load stats:', statsResult.error);
          // Set default stats
          setStats({
            pending: 0,
            approved: 0,
            rejected: 0,
            draft: 0,
            total: 0
          });
        }
      }
      
    } catch (error: any) {
      console.error('Error loading approval data:', error);
      setError(error.message || 'Naməlum xəta');
      setItems([]);
      setStats({
        pending: 0,
        approved: 0,
        rejected: 0,
        draft: 0,
        total: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter]); // Remove isLoading from dependencies to avoid infinite loop

  // DÜZƏLDILMIŞ: Throttled real-time subscription
  useEffect(() => {
    if (!props.autoRefresh) return;

    console.log('Setting up THROTTLED real-time subscription for approval data');
    let updateTimeout: NodeJS.Timeout;

    const subscription = supabase
      .channel('approval-data-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'data_entries',
        filter: 'status=in.(pending,approved,rejected)'
      }, (payload) => {
        console.log('Real-time update received (throttled):', payload);
        
        // Clear existing timeout
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }
        
        // Throttle updates to prevent excessive reloads
        updateTimeout = setTimeout(() => {
          if (!isLoading && hasInitialLoad) {
            console.log('Executing throttled reload');
            loadItems();
          }
        }, 2000); // 2 second throttle
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      subscription.unsubscribe();
    };
  }, [props.autoRefresh, hasInitialLoad]); // Add hasInitialLoad dependency

  // DÜZƏLDILMIŞ: Less frequent auto-refresh
  useEffect(() => {
    if (!props.autoRefresh || !props.refreshInterval) return;

    // Minimum interval of 30 seconds to prevent excessive API calls
    const safeInterval = Math.max(props.refreshInterval, 30000);
    
    console.log(`Setting up auto-refresh interval: ${safeInterval}ms`);
    const interval = setInterval(() => {
      if (!isLoading && hasInitialLoad) {
        console.log('Auto-refresh triggered');
        loadItems();
      }
    }, safeInterval);
    
    return () => {
      console.log('Cleaning up auto-refresh interval');
      clearInterval(interval);
    };
  }, [props.autoRefresh, props.refreshInterval, hasInitialLoad]);

  // Initial load - only once when component mounts
  useEffect(() => {
    if (!hasInitialLoad) {
      console.log('Initial load triggered');
      setHasInitialLoad(true);
      loadItems();
    }
  }, []); // Empty dependency array for one-time load

  // Reload when filter changes (but not on initial load)
  useEffect(() => {
    if (hasInitialLoad) {
      console.log('Filter changed, reloading data:', filter);
      loadItems();
    }
  }, [filter]);

  // Approve item function
  const approveItem = useCallback(async (id: string, comment?: string) => {
    try {
      console.log('Approving item:', id, comment);
      
      const result = await EnhancedApprovalService.approveEntry(id, comment);
      
      if (result.success) {
        // Update local state optimistically
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === id 
              ? { ...item, status: DataEntryStatus.APPROVED }
              : item
          )
        );
        
        // Reload to get fresh data
        await loadItems();
        
        console.log('Item approved successfully:', id);
      } else {
        throw new Error(result.error || 'Təsdiq zamanı xəta');
      }
    } catch (error: any) {
      console.error('Error approving item:', error);
      setError(error.message);
      throw error;
    }
  }, [loadItems]);

  // Reject item function
  const rejectItem = useCallback(async (id: string, reason: string, comment?: string) => {
    try {
      console.log('Rejecting item:', id, reason, comment);
      
      const result = await EnhancedApprovalService.rejectEntry(id, reason, comment);
      
      if (result.success) {
        // Update local state optimistically
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === id 
              ? { ...item, status: DataEntryStatus.REJECTED, rejectionReason: reason }
              : item
          )
        );
        
        // Reload to get fresh data
        await loadItems();
        
        console.log('Item rejected successfully:', id);
      } else {
        throw new Error(result.error || 'Rədd zamanı xəta');
      }
    } catch (error: any) {
      console.error('Error rejecting item:', error);
      setError(error.message);
      throw error;
    }
  }, [loadItems]);

  // Bulk approval function
  const bulkApproval = useCallback(async (
    ids: string[], 
    action: 'approve' | 'reject', 
    params: any
  ): Promise<ServiceResponse> => {
    try {
      console.log('Bulk action:', action, ids.length, 'items', params);
      
      const result = await EnhancedApprovalService.bulkApprovalAction(ids, action, params);
      
      if (result.success) {
        // Clear selection
        setSelectedItems([]);
        
        // Reload to get fresh data
        await loadItems();
        
        console.log('Bulk action completed:', result);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error in bulk action:', error);
      setError(error.message);
      return {
        success: false,
        error: error.message || 'Toplu əməliyyat zamanı xəta'
      };
    }
  }, [loadItems]);

  // Update filter function
  const updateFilter = useCallback((newFilter: Partial<ApprovalFilter>) => {
    console.log('Updating filter:', newFilter);
    setFilter(prevFilter => {
      // Shallow comparison to avoid unnecessary re-renders
      const updatedFilter = { ...prevFilter, ...newFilter };
      const isFilterChanged = JSON.stringify(prevFilter) !== JSON.stringify(updatedFilter);
      
      if (isFilterChanged) {
        console.log('Filter actually changed:', updatedFilter);
        return updatedFilter;
      } else {
        console.log('Filter unchanged, skipping update');
        return prevFilter;
      }
    });
    setSelectedItems([]); // Clear selection when filter changes
  }, []);

  // Reset filter function
  const resetFilter = useCallback(() => {
    console.log('Resetting filter');
    setFilter({ status: 'pending' });
    setSelectedItems([]);
  }, []);

  // Derived data with memoization
  const pendingItems = useMemo(() => 
    items.filter(item => item.status === DataEntryStatus.PENDING), 
    [items]
  );
  
  const approvedItems = useMemo(() => 
    items.filter(item => item.status === DataEntryStatus.APPROVED), 
    [items]
  );
  
  const rejectedItems = useMemo(() => 
    items.filter(item => item.status === DataEntryStatus.REJECTED), 
    [items]
  );
  
  const draftItems = useMemo(() => 
    items.filter(item => item.status === DataEntryStatus.DRAFT), 
    [items]
  );

  // Selection management
  const selectAll = useCallback(() => {
    const selectableItems = items.filter(item => item.canApprove);
    setSelectedItems(selectableItems.map(item => item.id));
  }, [items]);

  const selectNone = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isAllSelected = useMemo(() => {
    const selectableItems = items.filter(item => item.canApprove);
    return selectableItems.length > 0 && selectedItems.length === selectableItems.length;
  }, [items, selectedItems]);

  // Clear error when filter changes
  useEffect(() => {
    setError(null);
  }, [filter]);

  return {
    // Data
    items,
    stats,
    filter,
    
    // States
    isLoading,
    error,
    
    // Actions
    loadItems,
    approveItem,
    rejectItem,
    bulkApproval,
    updateFilter,
    resetFilter,
    
    // Derived data
    pendingItems,
    approvedItems,
    rejectedItems,
    draftItems,
    
    // Selection management
    selectedItems,
    setSelectedItems,
    selectAll,
    selectNone,
    isAllSelected
  };
};

export default useEnhancedApprovalData;