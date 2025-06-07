
// Legacy useDataEntry hook - Simplified for backward compatibility
// For new development, use useDataEntryManager or specific hooks from common/
import { useDataEntryManager } from './useDataEntryManager';
import { CategoryWithColumns } from '@/types/category';

interface UseDataEntryProps {
  schoolId?: string;
  categoryId?: string;
  onComplete?: () => void;
}

/**
 * @deprecated Use useDataEntryManager or specific hooks from common/ folder
 * This hook is maintained for backward compatibility only
 * Updated to use UnifiedDataEntryForm and UnifiedFieldRenderer
 */
export const useDataEntry = ({ 
  schoolId = '', 
  categoryId = '',
  onComplete 
}: UseDataEntryProps) => {
  
  // Use the refactored manager hook
  const manager = useDataEntryManager({
    categoryId,
    schoolId,
    category: null, // Will be loaded internally
    enableRealTime: false, // Disable for legacy compatibility
    enableCache: true,
    autoSave: true
  });
  
  // Legacy compatibility wrapper
  return {
    // Legacy interface mapping
    formData: manager.formData,
    updateFormData: manager.handleFormDataChange,
    categories: [], // Not implemented in legacy interface
    selectedCategory: undefined,
    currentCategory: undefined,
    loading: manager.isLoading,
    loadingEntry: manager.isLoading,
    submitting: manager.isSubmitting,
    isAutoSaving: manager.isSaving,
    isSubmitting: manager.isSubmitting,
    
    // Legacy handlers
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (event?.target?.name && event?.target?.value !== undefined) {
        manager.handleFieldChange(event.target.name, event.target.value);
      }
    },
    handleChange: manager.handleFieldChange,
    handleSubmit: async (event?: React.FormEvent) => {
      if (event) event.preventDefault();
      const result = await manager.handleSubmit();
      if (result?.success && onComplete) {
        onComplete();
      }
      return result;
    },
    handleSave: manager.handleSave,
    handleReset: manager.resetForm,
    handleCategoryChange: () => {
      console.warn('handleCategoryChange is deprecated. Use category-specific hooks instead.');
    },
    
    // Legacy data loading
    loadDataForSchool: () => manager.loadData(),
    entries: manager.entries,
    submitForApproval: manager.handleSubmit,
    
    // Legacy state
    saveStatus: manager.lastSaved ? 'saved' : 'pending',
    isDataModified: manager.isDataModified,
    error: manager.error || null,
    entryStatus: manager.entryStatus ? { [categoryId]: manager.entryStatus } : {},
    entryError: manager.error,
    entryId: null,
    
    // Legacy CRUD operations (simplified)
    saveEntry: async (data: any) => {
      manager.handleFormDataChange(data);
      return await manager.handleSave();
    },
    updateEntry: async (id: string, data: any) => {
      manager.handleFormDataChange(data);
      return await manager.handleSave();
    },
    deleteEntry: async (id: string) => {
      console.warn('deleteEntry is not supported in legacy interface');
      return Promise.resolve(false);
    },
    importExcel: async (file: File) => {
      console.warn('importExcel is not fully implemented in legacy interface');
      return {
        success: false,
        importedCount: 0,
        failedCount: 1,
        errors: [{ row: 1, error: 'Use useDataEntryManager for Excel import functionality' }]
      };
    }
  };
};

export default useDataEntry;
