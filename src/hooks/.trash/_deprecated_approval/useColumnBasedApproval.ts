import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  ColumnBasedApprovalReturn,
  ColumnBasedApprovalHookProps,
  ColumnBasedFilter,
  ColumnInfo,
  SchoolDataEntry,
  ColumnBasedStats,
  CategoryWithColumnCount,
  BulkApprovalResult
} from '@/types/columnBasedApproval';
import ColumnBasedApprovalService from '@/services/approval/columnBasedApprovalService';
import { toast } from 'sonner';

/**
 * Column-Based Approval Hook
 * 
 * Bu hook sütun-əsaslı approval sistemi üçün state management və business logic təmin edir.
 * Sektoradmin interface üçün optimallaşdırılmışdır.
 */
export const useColumnBasedApproval = (
  props: ColumnBasedApprovalHookProps = {}
): ColumnBasedApprovalReturn => {
  
  // State management
  const [categories, setCategories] = useState<CategoryWithColumnCount[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(props.defaultColumnId || null);
  const [schoolData, setSchoolData] = useState<SchoolDataEntry[]>([]);
  const [filter, setFilter] = useState<ColumnBasedFilter>({
    status: 'all',
    showEmptyValues: false,
    showOnlyPending: false
  });
  const [stats, setStats] = useState<ColumnBasedStats>({
    totalSchools: 0,
    filledCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    emptyCount: 0,
    completionRate: 0
  });
  
  // Loading states
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  
  // Derived data
  const selectedColumn = useMemo(() => 
    columns.find(col => col.id === selectedColumnId) || null,
    [columns, selectedColumnId]
  );
  
  const filteredData = useMemo(() => {
    let filtered = schoolData;
    
    // Search filter
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.schoolName.toLowerCase().includes(searchTerm) ||
        item.sectorName.toLowerCase().includes(searchTerm) ||
        item.formattedValue.toLowerCase().includes(searchTerm)
      );
    }
    
    // Status filter
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(item => item.status === filter.status);
    }
    
    // Show only pending filter
    if (filter.showOnlyPending) {
      filtered = filtered.filter(item => item.canApprove);
    }
    
    // Show empty values filter
    if (!filter.showEmptyValues) {
      filtered = filtered.filter(item => 
        item.value !== null && item.value !== undefined && item.value !== ''
      );
    }
    
    return filtered;
  }, [schoolData, filter]);
  
  // Categories loading
  const loadCategories = useCallback(async () => {
    if (isLoadingCategories) return;
    
    setIsLoadingCategories(true);
    setError(null);
    
    try {
      console.log('[useColumnBasedApproval] Loading categories');
      
      const result = await ColumnBasedApprovalService.getCategories();
      
      if (result.success && result.data) {
        setCategories(result.data);
        console.log(`[useColumnBasedApproval] Loaded ${result.data.length} categories`);
        
        // Auto-select first category if default is not set
        if (!props.defaultCategoryId && result.data.length > 0) {
          const firstCategory = result.data[0];
          if (props.autoLoadColumns) {
            await loadColumns(firstCategory.id);
          }
        }
      } else {
        setError(result.error || 'Kateqoriyalar yüklənərkən xəta');
        setCategories([]);
      }
    } catch (error: any) {
      console.error('[useColumnBasedApproval] Error loading categories:', error);
      setError(error.message || 'Naməlum xəta');
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [isLoadingCategories, props.autoLoadColumns, props.defaultCategoryId]);
  
  // Columns loading
  const loadColumns = useCallback(async (categoryId: string) => {
    if (isLoadingColumns) return;
    
    setIsLoadingColumns(true);
    setError(null);
    
    try {
      console.log('[useColumnBasedApproval] Loading columns for category:', categoryId);
      
      const result = await ColumnBasedApprovalService.getColumnsByCategory(categoryId);
      
      if (result.success && result.data) {
        setColumns(result.data);
        console.log(`[useColumnBasedApproval] Loaded ${result.data.length} columns`);
        
        // Auto-select first column if no column is selected
        if (!selectedColumnId && result.data.length > 0) {
          const firstColumn = result.data[0];
          setSelectedColumnId(firstColumn.id);
        }
      } else {
        setError(result.error || 'Sütunlar yüklənərkən xəta');
        setColumns([]);
      }
    } catch (error: any) {
      console.error('[useColumnBasedApproval] Error loading columns:', error);
      setError(error.message || 'Naməlum xəta');
      setColumns([]);
    } finally {
      setIsLoadingColumns(false);
    }
  }, [isLoadingColumns, selectedColumnId]);
  
  // Column selection
  const selectColumn = useCallback(async (columnId: string) => {
    console.log('[useColumnBasedApproval] Selecting column:', columnId);
    
    setSelectedColumnId(columnId);
    setSelectedSchoolIds([]); // Clear selection when changing column
    
    // Load data for selected column
    await loadSchoolData(columnId);
  }, []);
  
  // School data loading
  const loadSchoolData = useCallback(async (columnId: string) => {
    if (isLoadingData) return;
    
    setIsLoadingData(true);
    setError(null);
    
    try {
      console.log('[useColumnBasedApproval] Loading school data for column:', columnId);
      
      // Load data and stats in parallel
      const [dataResult, statsResult] = await Promise.all([
        ColumnBasedApprovalService.getSchoolDataByColumn(columnId, filter),
        ColumnBasedApprovalService.getStatsForColumn(columnId, filter)
      ]);
      
      if (dataResult.success && dataResult.data) {
        setSchoolData(dataResult.data);
        console.log(`[useColumnBasedApproval] Loaded ${dataResult.data.length} school data entries`);
      } else {
        setError(dataResult.error || 'Məktəb məlumatları yüklənərkən xəta');
        setSchoolData([]);
      }
      
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
        console.log('[useColumnBasedApproval] Loaded stats:', statsResult.data);
      } else {
        console.warn('[useColumnBasedApproval] Failed to load stats:', statsResult.error);
        // Don't set error for stats failure, just use default stats
      }
    } catch (error: any) {
      console.error('[useColumnBasedApproval] Error loading school data:', error);
      setError(error.message || 'Naməlum xəta');
      setSchoolData([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [isLoadingData, filter]);
  
  // Refresh data
  const refreshData = useCallback(async () => {
    if (selectedColumnId) {
      await loadSchoolData(selectedColumnId);
    }
  }, [selectedColumnId, loadSchoolData]);
  
  // Filter management
  const updateFilter = useCallback((newFilter: Partial<ColumnBasedFilter>) => {
    console.log('[useColumnBasedApproval] Updating filter:', newFilter);
    
    setFilter(prevFilter => {
      const updatedFilter = { ...prevFilter, ...newFilter };
      return updatedFilter;
    });
    
    // Clear selection when filter changes
    setSelectedSchoolIds([]);
  }, []);
  
  const resetFilter = useCallback(() => {
    console.log('[useColumnBasedApproval] Resetting filter');
    
    setFilter({
      status: 'all',
      showEmptyValues: false,
      showOnlyPending: false
    });
    setSelectedSchoolIds([]);
  }, []);
  
  // Approval actions
  const approveEntry = useCallback(async (schoolId: string, comment?: string): Promise<boolean> => {
    if (!selectedColumnId) {
      toast.error('Sütun seçilməyib');
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      console.log('[useColumnBasedApproval] Approving entry:', { schoolId, columnId: selectedColumnId, comment });
      
      const result = await ColumnBasedApprovalService.approveEntry(schoolId, selectedColumnId, comment);
      
      if (result.success) {
        toast.success('Məlumat uğurla təsdiqləndi');
        
        // Update local state optimistically
        setSchoolData(prevData => 
          prevData.map(item => 
            item.schoolId === schoolId 
              ? { ...item, status: 'approved' as any, canApprove: false, canReject: false }
              : item
          )
        );
        
        // Refresh data to get updated stats
        await refreshData();
        
        return true;
      } else {
        toast.error(result.error || 'Təsdiq zamanı xəta');
        return false;
      }
    } catch (error: any) {
      console.error('[useColumnBasedApproval] Error approving entry:', error);
      toast.error(error.message || 'Naməlum xəta');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedColumnId, refreshData]);
  
  const rejectEntry = useCallback(async (schoolId: string, reason: string, comment?: string): Promise<boolean> => {
    if (!selectedColumnId) {
      toast.error('Sütun seçilməyib');
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      console.log('[useColumnBasedApproval] Rejecting entry:', { schoolId, columnId: selectedColumnId, reason, comment });
      
      const result = await ColumnBasedApprovalService.rejectEntry(schoolId, selectedColumnId, reason, comment);
      
      if (result.success) {
        toast.success('Məlumat uğurla rədd edildi');
        
        // Update local state optimistically
        setSchoolData(prevData => 
          prevData.map(item => 
            item.schoolId === schoolId 
              ? { ...item, status: 'rejected' as any, rejectionReason: reason, canApprove: false, canReject: false }
              : item
          )
        );
        
        // Refresh data to get updated stats
        await refreshData();
        
        return true;
      } else {
        toast.error(result.error || 'Rədd zamanı xəta');
        return false;
      }
    } catch (error: any) {
      console.error('[useColumnBasedApproval] Error rejecting entry:', error);
      toast.error(error.message || 'Naməlum xəta');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedColumnId, refreshData]);
  
  // Bulk operations
  const bulkApprove = useCallback(async (schoolIds: string[], comment?: string): Promise<BulkApprovalResult> => {
    if (!selectedColumnId) {
      toast.error('Sütun seçilməyib');
      return { processedCount: 0, successCount: 0, errorCount: 0, errors: [] };
    }
    
    setIsProcessing(true);
    
    try {
      console.log('[useColumnBasedApproval] Bulk approving entries:', { schoolIds, columnId: selectedColumnId, comment });
      
      const result = await ColumnBasedApprovalService.bulkApprove(schoolIds, selectedColumnId, comment);
      
      if (result.success && result.data) {
        const { successCount, errorCount } = result.data;
        
        if (successCount > 0) {
          toast.success(`${successCount} məlumat uğurla təsdiqləndi`);
        }
        
        if (errorCount > 0) {
          toast.warning(`${errorCount} məlumat təsdiqlənə bilmədi`);
        }
        
        // Clear selection and refresh data
        setSelectedSchoolIds([]);
        await refreshData();
        
        return result.data;
      } else {
        toast.error(result.error || 'Toplu təsdiq zamanı xəta');
        return { processedCount: 0, successCount: 0, errorCount: 0, errors: [] };
      }
    } catch (error: any) {
      console.error('[useColumnBasedApproval] Error in bulk approval:', error);
      toast.error(error.message || 'Naməlum xəta');
      return { processedCount: 0, successCount: 0, errorCount: 0, errors: [] };
    } finally {
      setIsProcessing(false);
    }
  }, [selectedColumnId, refreshData]);
  
  const bulkReject = useCallback(async (schoolIds: string[], reason: string, comment?: string): Promise<BulkApprovalResult> => {
    if (!selectedColumnId) {
      toast.error('Sütun seçilməyib');
      return { processedCount: 0, successCount: 0, errorCount: 0, errors: [] };
    }
    
    setIsProcessing(true);
    
    try {
      console.log('[useColumnBasedApproval] Bulk rejecting entries:', { schoolIds, columnId: selectedColumnId, reason, comment });
      
      const result = await ColumnBasedApprovalService.bulkReject(schoolIds, selectedColumnId, reason, comment);
      
      if (result.success && result.data) {
        const { successCount, errorCount } = result.data;
        
        if (successCount > 0) {
          toast.success(`${successCount} məlumat uğurla rədd edildi`);
        }
        
        if (errorCount > 0) {
          toast.warning(`${errorCount} məlumat rədd edilə bilmədi`);
        }
        
        // Clear selection and refresh data
        setSelectedSchoolIds([]);
        await refreshData();
        
        return result.data;
      } else {
        toast.error(result.error || 'Toplu rədd zamanı xəta');
        return { processedCount: 0, successCount: 0, errorCount: 0, errors: [] };
      }
    } catch (error: any) {
      console.error('[useColumnBasedApproval] Error in bulk rejection:', error);
      toast.error(error.message || 'Naməlum xəta');
      return { processedCount: 0, successCount: 0, errorCount: 0, errors: [] };
    } finally {
      setIsProcessing(false);
    }
  }, [selectedColumnId, refreshData]);
  
  // Selection management
  const selectSchool = useCallback((schoolId: string, selected: boolean) => {
    setSelectedSchoolIds(prev => {
      if (selected) {
        return prev.includes(schoolId) ? prev : [...prev, schoolId];
      } else {
        return prev.filter(id => id !== schoolId);
      }
    });
  }, []);
  
  const selectAll = useCallback(() => {
    const allSelectableIds = filteredData
      .filter(item => item.canApprove)
      .map(item => item.schoolId);
    setSelectedSchoolIds(allSelectableIds);
  }, [filteredData]);
  
  const selectNone = useCallback(() => {
    setSelectedSchoolIds([]);
  }, []);
  
  const selectPending = useCallback(() => {
    const pendingIds = filteredData
      .filter(item => item.canApprove)
      .map(item => item.schoolId);
    setSelectedSchoolIds(pendingIds);
  }, [filteredData]);
  
  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const resetState = useCallback(() => {
    setCategories([]);
    setColumns([]);
    setSelectedColumnId(null);
    setSchoolData([]);
    setSelectedSchoolIds([]);
    setError(null);
    setStats({
      totalSchools: 0,
      filledCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      emptyCount: 0,
      completionRate: 0
    });
  }, []);
  
  // Auto-load categories on mount
  useEffect(() => {
    if (props.autoLoadCategories !== false) {
      loadCategories();
    }
  }, []); // Only run on mount
  
  // Auto-load columns when default category is set
  useEffect(() => {
    if (props.defaultCategoryId && props.autoLoadColumns) {
      loadColumns(props.defaultCategoryId);
    }
  }, [props.defaultCategoryId, props.autoLoadColumns, loadColumns]);
  
  // Auto-load data when column is selected
  useEffect(() => {
    if (selectedColumnId) {
      loadSchoolData(selectedColumnId);
    }
  }, [selectedColumnId, filter]); // Re-load when filter changes
  
  // Clear error when data changes
  useEffect(() => {
    if (schoolData.length > 0) {
      setError(null);
    }
  }, [schoolData]);
  
  return {
    // State
    categories,
    columns,
    selectedColumnId,
    selectedColumn,
    schoolData,
    filteredData,
    filter,
    stats,
    isLoadingCategories,
    isLoadingColumns,
    isLoadingData,
    isProcessing,
    error,
    selectedSchoolIds,
    
    // Actions
    loadCategories,
    loadColumns,
    selectColumn,
    loadSchoolData,
    refreshData,
    updateFilter,
    resetFilter,
    approveEntry,
    rejectEntry,
    bulkApprove,
    bulkReject,
    selectSchool,
    selectAll,
    selectNone,
    selectPending,
    clearError,
    resetState
  };
};

export default useColumnBasedApproval;
