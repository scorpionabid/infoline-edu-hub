
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Category, Column } from '@/types/column';
import type { DataStats, LoadingStates } from './types';

// Import refactored hooks
import { useDataManagementState } from './core/useDataManagementState';
import { useDataManagementPermissions } from './core/useDataManagementPermissions';
import { useDataManagementNavigation } from './core/useDataManagementNavigation';
import { useSchoolDataLoader } from './loaders/useSchoolDataLoader';
import { useSchoolDataOperations } from './operations/useSchoolDataOperations';
import { useDataApproval } from './operations/useDataApproval';
import { useBulkOperations } from './operations/useBulkOperations';

export const useDataManagement = () => {
  const { toast } = useToast();
  
  // Core state management
  const {
    currentStep,
    selectedCategory,
    selectedColumn,
    schoolData,
    error,
    setCurrentStep,
    setSelectedCategory,
    setSelectedColumn,
    setSchoolData,
    setError,
    resetState,
    clearError
  } = useDataManagementState();

  // Permissions
  const { permissions } = useDataManagementPermissions();

  // Navigation
  const navigation = useDataManagementNavigation(
    currentStep,
    setCurrentStep,
    selectedCategory,
    selectedColumn
  );

  // Data loading
  const { loadSchoolData, loading: dataLoading } = useSchoolDataLoader();

  // Operations
  const { handleDataSave, saving: savingData } = useSchoolDataOperations();
  const { handleDataApprove, handleDataReject, saving: savingApproval } = useDataApproval();
  const { handleBulkApprove, handleBulkReject, saving: savingBulk } = useBulkOperations();

  // Local state for categories and columns
  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [stats, setStats] = useState<DataStats | null>(null);

  // Loading states
  const [loading, setLoading] = useState<LoadingStates>({
    categories: false,
    columns: false,
    schoolData: false,
    saving: false
  });

  const updateLoading = (key: keyof LoadingStates, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  // Calculate stats from school data
  const calculateStats = useCallback((data: typeof schoolData): DataStats => {
    const totalSchools = data.length;
    const pendingCount = data.filter(item => item.status === 'pending').length;
    const approvedCount = data.filter(item => item.status === 'approved').length;
    const rejectedCount = data.filter(item => item.status === 'rejected').length;
    const emptyCount = data.filter(item => item.status === 'empty').length;
    const completionRate = totalSchools > 0 ? Math.round((approvedCount / totalSchools) * 100) : 0;

    return {
      totalSchools,
      pendingCount,
      approvedCount,
      rejectedCount,
      emptyCount,
      completionRate,
      totalEntries: totalSchools,
      completedEntries: approvedCount,
      pendingEntries: pendingCount
    };
  }, []);

  // Update stats when school data changes
  useEffect(() => {
    if (schoolData.length > 0) {
      setStats(calculateStats(schoolData));
    }
  }, [schoolData, calculateStats]);

  // Load school data when category and column are selected
  useEffect(() => {
    const loadData = async () => {
      if (selectedCategory?.id && selectedColumn?.id && currentStep === 'data') {
        try {
          const data = await loadSchoolData(selectedCategory.id, selectedColumn.id);
          setSchoolData(data);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Data loading failed');
        }
      }
    };
    
    loadData();
  }, [selectedCategory?.id, selectedColumn?.id, currentStep, loadSchoolData, setSchoolData, setError]);

  // Wrapper functions for operations that reload data
  const wrappedDataSave = async (schoolId: string, value: string): Promise<boolean> => {
    const result = await handleDataSave(schoolId, value, selectedCategory, selectedColumn);
    if (result && selectedCategory?.id && selectedColumn?.id) {
      try {
        const data = await loadSchoolData(selectedCategory.id, selectedColumn.id);
        setSchoolData(data);
      } catch (error) {
        console.error('Failed to reload data after save:', error);
      }
    }
    return result;
  };

  const wrappedDataApprove = async (schoolId: string, comment?: string): Promise<boolean> => {
    const result = await handleDataApprove(schoolId, selectedColumn, comment);
    if (result && selectedCategory?.id && selectedColumn?.id) {
      try {
        const data = await loadSchoolData(selectedCategory.id, selectedColumn.id);
        setSchoolData(data);
      } catch (error) {
        console.error('Failed to reload data after approve:', error);
      }
    }
    return result;
  };

  const wrappedDataReject = async (schoolId: string, reason: string, comment?: string): Promise<boolean> => {
    const result = await handleDataReject(schoolId, selectedColumn, reason, comment);
    if (result && selectedCategory?.id && selectedColumn?.id) {
      try {
        const data = await loadSchoolData(selectedCategory.id, selectedColumn.id);
        setSchoolData(data);
      } catch (error) {
        console.error('Failed to reload data after reject:', error);
      }
    }
    return result;
  };

  const wrappedBulkApprove = async (schoolIds: string[]): Promise<boolean> => {
    const result = await handleBulkApprove(schoolIds, selectedColumn);
    if (result && selectedCategory?.id && selectedColumn?.id) {
      try {
        const data = await loadSchoolData(selectedCategory.id, selectedColumn.id);
        setSchoolData(data);
      } catch (error) {
        console.error('Failed to reload data after bulk approve:', error);
      }
    }
    return result;
  };

  const wrappedBulkReject = async (schoolIds: string[], reason: string): Promise<boolean> => {
    const result = await handleBulkReject(schoolIds, selectedColumn, reason);
    if (result && selectedCategory?.id && selectedColumn?.id) {
      try {
        const data = await loadSchoolData(selectedCategory.id, selectedColumn.id);
        setSchoolData(data);
      } catch (error) {
        console.error('Failed to reload data after bulk reject:', error);
      }
    }
    return result;
  };

  // Refresh data function
  const refreshData = async () => {
    if (selectedCategory?.id && selectedColumn?.id && currentStep === 'data') {
      try {
        const data = await loadSchoolData(selectedCategory.id, selectedColumn.id);
        setSchoolData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Refresh failed');
      }
    }
  };

  // Mock category and column handlers (these would typically load from API)
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedColumn(null);
    navigation.goToNextStep();
  };

  const handleColumnSelect = (column: Column) => {
    setSelectedColumn(column);
    navigation.goToNextStep();
  };

  // Reset workflow
  const resetWorkflow = () => {
    resetState();
    setCategories([]);
    setColumns([]);
    setStats(null);
    setLoading({
      categories: false,
      columns: false,
      schoolData: false,
      saving: false
    });
  };

  // Combined loading state
  const combinedLoading = {
    ...loading,
    schoolData: dataLoading,
    saving: savingData || savingApproval || savingBulk
  };

  return {
    // State
    currentStep,
    selectedCategory,
    selectedColumn,
    schoolData,
    stats,
    loading: combinedLoading,
    error,
    permissions,
    
    // Data sources
    categories,
    columns,
    
    // Navigation
    ...navigation,
    
    // Category/Column handlers
    handleCategorySelect,
    handleColumnSelect,
    
    // Data operations
    handleDataSave: wrappedDataSave,
    handleDataApprove: wrappedDataApprove,
    handleDataReject: wrappedDataReject,
    handleBulkApprove: wrappedBulkApprove,
    handleBulkReject: wrappedBulkReject,
    
    // Utilities
    refreshData,
    resetWorkflow,
    clearError
  };
};

// Re-export types for backward compatibility
export type { DataManagementPermissions } from './core/useDataManagementPermissions';
export type { DataManagementStep, SchoolDataEntry, DataStats } from './types';
