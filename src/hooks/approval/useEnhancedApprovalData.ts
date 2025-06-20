
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
 * Enhanced Approval Data Hook - Optimized version
 * 
 * Bu hook real data ilə approval workflow-u idarə edir:
 * - Real-time subscription to approval changes
 * - Advanced filtering and search
 * - Bulk operations support
 * - Optimized error handling
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
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  // Minimum interval between loads (prevent excessive API calls)
  const MIN_LOAD_INTERVAL = 3000; // 3 seconds

  // Load items function with throttling
  const loadItems = useCallback(async () => {
    const now = Date.now();
    
    // Throttle yoxlaması
    if (now - lastLoadTime < MIN_LOAD_INTERVAL && hasInitialLoad) {
      console.log('Load throttled, skipping...');
      return;
    }
    
    if (isLoading) {
      console.log('Already loading, skipping...');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLastLoadTime(now);
    
    try {
      console.log('Loading approval items with filter:', filter);
      
      // Load items and stats in parallel
      const [itemsResult, statsResult] = await Promise.all([
        EnhancedApprovalService.getApprovalItems(filter),
        EnhancedApprovalService.getApprovalStats(filter)
      ]);
      
      // Handle items result
      if (itemsResult.success && itemsResult.data) {
        setItems(itemsResult.data);
        console.log(`Loaded ${itemsResult.data.length} approval items`);
      } else {
        console.error('Failed to load items:', itemsResult.error);
        setError(itemsResult.error || 'Məlumatlar alınarkən xəta');
        setItems([]);
      }
      
      // Handle stats result
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      } else {
        console.warn('Failed to load stats:', statsResult.error);
        // Set default stats instead of showing error
        setStats({
          pending: 0,
          approved: 0,
          rejected: 0,
          draft: 0,
          total: 0
        });
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
  }, [filter, isLoading, hasInitialLoad, lastLoadTime]);

  // Optimized real-time subscription
  useEffect(() => {
    if (!props.autoRefresh) return;

    console.log('Setting up optimized real-time subscription');
    let updateTimeout: NodeJS.Timeout;

    const subscription = supabase
      .channel('approval-data-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'data_entries',
        filter: 'status=in.(pending,approved,rejected)'
      }, (payload) => {
        console.log('Real-time update received:', payload);
        
        // Clear existing timeout
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }
        
        // Debounce updates to prevent excessive reloads
        updateTimeout = setTimeout(() => {
          if (!isLoading && hasInitialLoad) {
            console.log('Executing debounced reload');
            loadItems();
          }
        }, 5000); // 5 second debounce
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      subscription.unsubscribe();
    };
  }, [props.autoRefresh, hasInitialLoad, loadItems]);

  // Auto-refresh with longer intervals
  useEffect(() => {
    if (!props.autoRefresh || !props.refreshInterval) return;

    // Minimum interval of 60 seconds to prevent excessive API calls
    const safeInterval = Math.max(props.refreshInterval, 60000);
    
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
  }, [props.autoRefresh, props.refreshInterval, hasInitialLoad, loadItems]);

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
      // Clear selection when filter changes
      setSelectedItems([]);
      loadItems();
    }
  }, [filter, hasInitialLoad, loadItems]);

  // Approve item function with optimistic updates
  const approveItem = useCallback(async (id: string, comment?: string) => {
    try {
      console.log('Approving item:', id, comment);
      
      // Optimistic update
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, status: DataEntryStatus.APPROVED }
            : item
        )
      );
      
      const result = await EnhancedApprovalService.approveEntry(id, comment);
      
      if (result.success) {
        console.log('Item approved successfully:', id);
        // Reload fresh data
        setTimeout(() => loadItems(), 1000);
      } else {
        // Revert optimistic update on error
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === id 
              ? { ...item, status: DataEntryStatus.PENDING }
              : item
          )
        );
        throw new Error(result.error || 'Təsdiq zamanı xəta');
      }
    } catch (error: any) {
      console.error('Error approving item:', error);
      setError(error.message);
      throw error;
    }
  }, [loadItems]);

  // Reject item function with optimistic updates
  const rejectItem = useCallback(async (id: string, reason: string, comment?: string) => {
    try {
      console.log('Rejecting item:', id, reason, comment);
      
      // Optimistic update
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, status: DataEntryStatus.REJECTED, rejectionReason: reason }
            : item
        )
      );
      
      const result = await EnhancedApprovalService.rejectEntry(id, reason, comment);
      
      if (result.success) {
        console.log('Item rejected successfully:', id);
        // Reload fresh data
        setTimeout(() => loadItems(), 1000);
      } else {
        // Revert optimistic update on error
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === id 
              ? { ...item, status: DataEntryStatus.PENDING, rejectionReason: undefined }
              : item
          )
        );
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
        
        // Reload fresh data
        setTimeout(() => loadItems(), 1000);
        
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

  // Update filter function with validation
  const updateFilter = useCallback((newFilter: Partial<ApprovalFilter>) => {
    console.log('Updating filter:', newFilter);
    setFilter(prevFilter => {
      const updatedFilter = { ...prevFilter, ...newFilter };
      
      // Only update if filter actually changed
      const isFilterChanged = JSON.stringify(prevFilter) !== JSON.stringify(updatedFilter);
      
      if (isFilterChanged) {
        console.log('Filter actually changed:', updatedFilter);
        return updatedFilter;
      } else {
        console.log('Filter unchanged, skipping update');
        return prevFilter;
      }
    });
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
