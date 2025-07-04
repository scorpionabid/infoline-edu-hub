
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Category, Column } from '@/types/column';
import type { DataStats, LoadingStates } from './types';

// Import categories and columns hooks
import { useCategories } from '@/hooks/categories/useCategories';
import { useColumns } from '@/hooks/columns/useColumns';

// Import refactored hooks
import { useDataManagementState } from './core/useDataManagementState';
import { useDataManagementPermissions } from './core/useDataManagementPermissions';
import { useDataManagementNavigation } from './core/useDataManagementNavigation';
import { useSchoolDataLoader } from './loaders/useSchoolDataLoader';
import { useDataTransformation } from './loaders/useDataTransformation';
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

  // Data loading and transformation
  const { loadSchoolData, loading: dataLoading } = useSchoolDataLoader();
  const { calculateStatsFromData } = useDataTransformation();

  // Operations
  const { handleDataSave, saving: savingData } = useSchoolDataOperations();
  const { handleDataApprove, handleDataReject, saving: savingApproval } = useDataApproval();
  const { handleBulkApprove, handleBulkReject, saving: savingBulk } = useBulkOperations();

  // Load categories and columns
  const { data: categories = [], isLoading: loadingCategories, error: categoriesError } = useCategories();
  const { data: columns = [], isLoading: loadingColumns, error: columnsError } = useColumns(selectedCategory?.id);
  const [stats, setStats] = useState<DataStats | null>(null);

  // Handle API errors
  useEffect(() => {
    if (categoriesError) {
      setError(categoriesError.message || 'Failed to load categories');
    } else if (columnsError) {
      setError(columnsError.message || 'Failed to load columns');
    }
  }, [categoriesError, columnsError, setError]);

  // Calculate stats from school data
  useEffect(() => {
    if (schoolData.length > 0) {
      setStats(calculateStatsFromData(schoolData));
    }
  }, [schoolData, calculateStatsFromData]);

  // Load school data when category and column are selected
  useEffect(() => {
    const loadData = async () => {
      if (selectedCategory?.id && selectedColumn?.id && currentStep === 'data') {
        try {
          console.log('Loading school data for:', { categoryId: selectedCategory.id, columnId: selectedColumn.id });
          const data = await loadSchoolData(selectedCategory.id, selectedColumn.id);
          setSchoolData(data);
          console.log('School data loaded successfully:', data.length, 'entries');
        } catch (error) {
          console.error('Failed to load school data:', error);
          setError(error instanceof Error ? error.message : 'Data loading failed');
        }
      }
    };
    
    loadData();
  }, [selectedCategory?.id, selectedColumn?.id, currentStep, loadSchoolData, setSchoolData, setError]);

  // Create wrapper functions that reload data after operations
  const createDataReloader = useCallback(() => {
    return async () => {
      if (selectedCategory?.id && selectedColumn?.id) {
        try {
          const data = await loadSchoolData(selectedCategory.id, selectedColumn.id);
          setSchoolData(data);
        } catch (error) {
          console.error('Failed to reload data:', error);
        }
      }
    };
  }, [selectedCategory?.id, selectedColumn?.id, loadSchoolData, setSchoolData]);

  const reloadData = createDataReloader();

  // Wrapper functions for operations
  const wrappedDataSave = async (schoolId: string, value: string): Promise<boolean> => {
    const result = await handleDataSave(schoolId, value, selectedCategory, selectedColumn);
    if (result) await reloadData();
    return result;
  };

  const wrappedDataApprove = async (schoolId: string, comment?: string): Promise<boolean> => {
    const result = await handleDataApprove(schoolId, selectedColumn, comment);
    if (result) await reloadData();
    return result;
  };

  const wrappedDataReject = async (schoolId: string, reason: string, comment?: string): Promise<boolean> => {
    const result = await handleDataReject(schoolId, selectedColumn, reason, comment);
    if (result) await reloadData();
    return result;
  };

  const wrappedBulkApprove = async (schoolIds: string[]): Promise<boolean> => {
    const result = await handleBulkApprove(schoolIds, selectedColumn);
    if (result) await reloadData();
    return result;
  };

  const wrappedBulkReject = async (schoolIds: string[], reason: string): Promise<boolean> => {
    const result = await handleBulkReject(schoolIds, selectedColumn, reason);
    if (result) await reloadData();
    return result;
  };

  // Category/Column handlers
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
    setStats(null);
  };

  // Combined loading state
  const combinedLoading = {
    categories: loadingCategories,
    columns: loadingColumns,
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
    refreshData: reloadData,
    resetWorkflow,
    clearError
  };
};

// Re-export types for backward compatibility
export type { DataManagementPermissions } from './core/useDataManagementPermissions';
export type { DataManagementStep, SchoolDataEntry, DataStats } from './types';
