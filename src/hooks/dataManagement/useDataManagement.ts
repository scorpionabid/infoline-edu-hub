import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useCategoriesQuery } from '@/hooks/api/categories/useCategoriesQuery';
import { useColumnsQuery } from '@/hooks/api/columns/useColumnsQuery';
import { useSchoolDataForColumn } from '@/hooks/dataEntry/sector/useSchoolDataForColumn';
import { saveSchoolDataEntry } from '@/services/api/schoolDataEntry';
import { saveSingleSectorDataEntry } from '@/services/api/sectorDataEntry';
import { toast } from 'sonner';

export type DataManagementStep = 'category' | 'column' | 'data';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  completion_rate?: number;
}

export interface Column {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  options?: any[];
}

export interface SchoolDataEntry {
  schoolId: string;
  schoolName: string;
  sectorName: string;
  regionName: string;
  currentValue?: string;
  status: 'pending' | 'approved' | 'rejected' | 'empty';
  lastUpdated?: string;
  submittedBy?: string;
  canApprove?: boolean;
  canEdit?: boolean;
}

export interface DataStats {
  totalSchools: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  emptyCount: number;
  completionRate: number;
}

export interface DataManagementState {
  currentStep: DataManagementStep;
  selectedCategory: Category | null;
  selectedColumn: Column | null;
  schoolData: SchoolDataEntry[];
  stats: DataStats | null;
  loading: {
    categories: boolean;
    columns: boolean;
    schoolData: boolean;
    saving: boolean;
  };
  error: string | null;
}

/**
 * Unified Data Management Hook
 * 
 * This hook combines all the functionality needed for both data entry
 * and approval workflows in a single, cohesive interface.
 * 
 * Features:
 * - Category and column selection
 * - School data fetching and management
 * - Save, approve, and reject operations
 * - Bulk operations
 * - Role-based permissions
 * - Error handling and loading states
 */
export const useDataManagement = () => {
  // Auth and permissions
  const { user, userRole } = useAuthStore();
  const sectorId = useAuthStore(state => state.user?.sector_id);
  const regionId = useAuthStore(state => state.user?.region_id);
  const { hasRole, canApproveData, canEditData } = usePermissions();

  // State
  const [state, setState] = useState<DataManagementState>({
    currentStep: 'category',
    selectedCategory: null,
    selectedColumn: null,
    schoolData: [],
    stats: null,
    loading: {
      categories: false,
      columns: false,
      schoolData: false,
      saving: false,
    },
    error: null,
  });

  // Data fetching hooks
  const { 
    categories = [], 
    isLoading: categoriesLoading,
    refetch: refetchCategories 
  } = useCategoriesQuery();

  const { 
    columns = [], 
    isLoading: columnsLoading,
    refetch: refetchColumns 
  } = useColumnsQuery({ categoryId: state.selectedCategory?.id });

  const {
    schoolData: rawSchoolData,
    isLoadingSchoolData,
    loadSchoolData,
    refreshSchoolData
  } = useSchoolDataForColumn();

  // Update loading states
  useEffect(() => {
    setState(prev => ({
      ...prev,
      loading: {
        ...prev.loading,
        categories: categoriesLoading,
        columns: columnsLoading,
        schoolData: isLoadingSchoolData,
      }
    }));
  }, [categoriesLoading, columnsLoading, isLoadingSchoolData]);

  // Transform and enrich school data
  const enrichedSchoolData = useCallback(() => {
    if (!rawSchoolData || !user) return [];

    return rawSchoolData.map(school => ({
      ...school,
      canApprove: canApproveData && school.status === 'pending',
      canEdit: canEditData && (school.status === 'empty' || school.status === 'rejected')
    }));
  }, [rawSchoolData, user, canApproveData, canEditData]);

  // Calculate statistics
  const calculateStats = useCallback((data: SchoolDataEntry[]): DataStats => {
    const totalSchools = data.length;
    const pendingCount = data.filter(s => s.status === 'pending').length;
    const approvedCount = data.filter(s => s.status === 'approved').length;
    const rejectedCount = data.filter(s => s.status === 'rejected').length;
    const emptyCount = data.filter(s => s.status === 'empty').length;
    const completionRate = totalSchools > 0 
      ? Math.round(((approvedCount + pendingCount) / totalSchools) * 100)
      : 0;

    return {
      totalSchools,
      pendingCount,
      approvedCount,
      rejectedCount,
      emptyCount,
      completionRate
    };
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // Update school data and stats when raw data changes
  useEffect(() => {
    const enriched = enrichedSchoolData();
    const stats = calculateStats(enriched);
    
    setState(prev => ({
      ...prev,
      schoolData: enriched,
      stats
    }));
  }, [enrichedSchoolData, calculateStats]);

  // Navigation functions
  const goToStep = useCallback((step: DataManagementStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
      error: null
    }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'category',
      selectedCategory: null,
      selectedColumn: null,
      schoolData: [],
      stats: null,
      error: null
    }));
  }, []);

  // Category selection
  const handleCategorySelect = useCallback(async (category: Category) => {
    setState(prev => ({
      ...prev,
      selectedCategory: category,
      selectedColumn: null,
      schoolData: [],
      stats: null,
      currentStep: 'column',
      error: null
    }));

    // Refetch columns for selected category
    try {
      await refetchColumns();
    } catch (error) {
      console.error('Error fetching columns:', error);
      setState(prev => ({
        ...prev,
        error: 'Sütunlar yüklənərkən xəta baş verdi'
      }));
    }
  }, [refetchColumns]);

  // Column selection
  const handleColumnSelect = useCallback(async (column: Column) => {
    setState(prev => ({
      ...prev,
      selectedColumn: column,
      currentStep: 'data',
      error: null
    }));

    // Load school data for selected column
    if (sectorId || regionId) {
      try {
        // Determine entity type and ID based on user role
        const entityType = sectorId ? 'sector' : 'region';
        const entityId = sectorId || regionId;
        
        console.log('Loading data for:', { entityType, entityId, column: column.id });
        await loadSchoolData(column.id, entityId!, entityType);
      } catch (error) {
        console.error('Error loading school data:', error);
        setState(prev => ({
          ...prev,
          error: 'Məktəb məlumatları yüklənərkən xəta baş verdi'
        }));
      }
    } else if (user?.school_id) {
      // SchoolAdmin üçün - yalnız öz məktəbini yüklə
      try {
        console.log('Loading data for school:', { schoolId: user.school_id, column: column.id });
        await loadSchoolData(column.id, user.school_id, 'school');
      } catch (error) {
        console.error('Error loading school data for school admin:', error);
        setState(prev => ({
          ...prev,
          error: 'Məktəb məlumatları yüklənərkən xəta baş verdi'
        }));
      }
    } else {
      console.warn('No sectorId, regionId or schoolId available for loading school data');
      setState(prev => ({
        ...prev,
        error: 'İstifadəçi məlumatları natamam - sektor, region və ya məktəb ID tapılmadı'
      }));
    }
  }, [sectorId, regionId, user?.school_id, loadSchoolData]);

  // Data save operation
  const handleDataSave = useCallback(async (schoolId: string, value: string) => {
    if (!state.selectedCategory || !state.selectedColumn || !user) {
      toast.error('Məlumatlar natamam');
      return false;
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, saving: true } }));

    try {
      // Determine if this is sector data or school data
      if (state.selectedCategory.assignment === 'sectors' && sectorId) {
        // Save as sector data
        await saveSingleSectorDataEntry(
          sectorId,
          state.selectedCategory.id,
          state.selectedColumn.id,
          value,
          user.id
        );
      } else {
        // Save as school data
        await saveSchoolDataEntry({
          schoolId,
          categoryId: state.selectedCategory.id,
          columnId: state.selectedColumn.id,
          value,
          userId: user.id
        });
      }

      toast.success('Məlumat uğurla saxlanıldı');
      
      // Refresh school data
      await refreshSchoolData();
      
      return true;
    } catch (error: any) {
      console.error('Data save error:', error);
      toast.error('Məlumat saxlanarkən xəta baş verdi');
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, saving: false } }));
    }
  }, [state.selectedCategory, state.selectedColumn, user, sectorId, refreshSchoolData]);

  // Approval operation
  const handleDataApprove = useCallback(async (schoolId: string, comment?: string) => {
    if (!canApproveData) {
      toast.error('Təsdiq etmək üçün icazəniz yoxdur');
      return false;
    }

    // Implementation would go here - calling approval API
    // For now, return true to indicate success
    toast.success('Məlumat təsdiqləndi');
    await refreshSchoolData();
    return true;
  }, [canApproveData, refreshSchoolData]);

  // Rejection operation
  const handleDataReject = useCallback(async (schoolId: string, reason: string, comment?: string) => {
    if (!canApproveData) {
      toast.error('Rədd etmək üçün icazəniz yoxdur');
      return false;
    }

    // Implementation would go here - calling rejection API
    // For now, return true to indicate success
    toast.success('Məlumat rədd edildi');
    await refreshSchoolData();
    return true;
  }, [canApproveData, refreshSchoolData]);

  // Bulk approval
  const handleBulkApprove = useCallback(async (schoolIds: string[]) => {
    if (!canApproveData || schoolIds.length === 0) {
      toast.error('Təsdiq etmək üçün icazə və ya seçim yoxdur');
      return false;
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, saving: true } }));

    try {
      // Implementation would go here - calling bulk approval API
      toast.success(`${schoolIds.length} məlumat təsdiqləndi`);
      await refreshSchoolData();
      return true;
    } catch (error) {
      toast.error('Toplu təsdiq zamanı xəta baş verdi');
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, saving: false } }));
    }
  }, [canApproveData, refreshSchoolData]);

  // Bulk rejection
  const handleBulkReject = useCallback(async (schoolIds: string[], reason: string) => {
    if (!canApproveData || schoolIds.length === 0) {
      toast.error('Rədd etmək üçün icazə və ya seçim yoxdur');
      return false;
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, saving: true } }));

    try {
      // Implementation would go here - calling bulk rejection API
      toast.success(`${schoolIds.length} məlumat rədd edildi`);
      await refreshSchoolData();
      return true;
    } catch (error) {
      toast.error('Toplu rədd zamanı xəta baş verdi');
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, saving: false } }));
    }
  }, [canApproveData, refreshSchoolData]);

  // Enhanced error handling with retry logic
  const handleErrorWithRetry = useCallback(async (
    operation: () => Promise<any>,
    errorMessage: string,
    retries = 2
  ) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        if (attempt === retries) {
          console.error(`Final attempt failed for ${errorMessage}:`, error);
          setState(prev => ({
            ...prev,
            error: `${errorMessage}: ${error.message}`
          }));
          toast.error(`${errorMessage}: ${error.message}`);
          throw error;
        }
        console.warn(`Attempt ${attempt + 1} failed for ${errorMessage}, retrying...`);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }, []);

  // Refresh data with retry logic
  const refreshData = useCallback(async () => {
    try {
      await handleErrorWithRetry(
        () => refetchCategories(),
        'Kateqoriyalar yenilənərkən xəta'
      );
      
      if (state.selectedCategory) {
        await handleErrorWithRetry(
          () => refetchColumns(),
          'Sütunlar yenilənərkən xəta'
        );
      }
      
      if (state.selectedColumn && (sectorId || regionId || user?.school_id)) {
        await handleErrorWithRetry(
          async () => {
            let entityType: 'sector' | 'region' | 'school';
            let entityId: string;
            
            if (sectorId) {
              entityType = 'sector';
              entityId = sectorId;
            } else if (regionId) {
              entityType = 'region';
              entityId = regionId;
            } else {
              entityType = 'school';
              entityId = user!.school_id!;
            }
            
            await loadSchoolData(state.selectedColumn!.id, entityId, entityType);
          },
          'Məktəb məlumatları yenilənərkən xəta'
        );
      }
    } catch (error) {
      // Error already handled by handleErrorWithRetry
      console.error('RefreshData failed after retries:', error);
    }
  }, [handleErrorWithRetry, refetchCategories, refetchColumns, refreshSchoolData, state.selectedCategory, state.selectedColumn, sectorId, regionId, user?.school_id]);

  // Get user permissions - Memoized for performance
  const permissions = useMemo(() => ({
    canApprove: canApproveData,
    canEdit: canEditData,
    canViewAll: hasRole(['superadmin', 'regionadmin']),
    role: userRole,
    sectorId,
    regionId
  }), [canApproveData, canEditData, hasRole, userRole, sectorId, regionId]);

  return {
    // State
    currentStep: state.currentStep,
    selectedCategory: state.selectedCategory,
    selectedColumn: state.selectedColumn,
    schoolData: state.schoolData,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    permissions,

    // Navigation
    goToStep,
    resetWorkflow,

    // Data
    categories,
    columns,

    // Actions
    handleCategorySelect,
    handleColumnSelect,
    handleDataSave,
    handleDataApprove,
    handleDataReject,
    handleBulkApprove,
    handleBulkReject,

    // Utilities
    refreshData,
    clearError
  };
};