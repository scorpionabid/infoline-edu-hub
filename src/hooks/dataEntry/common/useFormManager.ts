// Core form state and data management (extracted from useDataEntryManager.ts)
import { useState, useCallback, useRef } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry } from '@/types/dataEntry';

interface UseFormManagerOptions {
  categoryId: string;
  schoolId: string;
  category: CategoryWithColumns | null;
}

export const useFormManager = ({ categoryId, schoolId, category }: UseFormManagerOptions) => {
  // Core form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDataModified, setIsDataModified] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [entries, setEntries] = useState<DataEntry[]>([]);
  
  // Form state tracking
  const originalDataRef = useRef<Record<string, any>>({});
  
  // Update form data with modification tracking
  const updateFormData = useCallback((newData: Record<string, any>) => {
    setFormData(newData);
    
    // Check if data is modified by comparing with original
    const isModified = JSON.stringify(newData) !== JSON.stringify(originalDataRef.current);
    setIsDataModified(isModified);
    
    // Clear validation errors when data changes
    setValidationErrors({});
  }, []);
  
  // Handle individual field changes
  const handleFieldChange = useCallback((columnId: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [columnId]: value };
      
      // Check if modified
      const isModified = JSON.stringify(newData) !== JSON.stringify(originalDataRef.current);
      setIsDataModified(isModified);
      
      return newData;
    });
    
    // Clear validation error for this field
    if (validationErrors[columnId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnId];
        return newErrors;
      });
    }
  }, [validationErrors]);
  
  // Reset form to original state
  const resetForm = useCallback(() => {
    setFormData({ ...originalDataRef.current });
    setIsDataModified(false);
    setValidationErrors({});
  }, []);
  
  // Set initial data and mark as original
  const setInitialData = useCallback((data: Record<string, any>) => {
    const cleanData = { ...data };
    setFormData(cleanData);
    originalDataRef.current = cleanData;
    setIsDataModified(false);
    setValidationErrors({});
  }, []);
  
  // Validate form data
  const validateForm = useCallback(() => {
    if (!category?.columns) return { isValid: false, errors: {} };
    
    const errors: Record<string, string> = {};
    
    category.columns.forEach(column => {
      if (column.is_required) {
        const value = formData[column.id];
        if (!value || String(value).trim() === '') {
          errors[column.id] = `${column.name} is required`;
        }
      }
      
      // Additional validation based on column type
      if (column.type === 'number' && formData[column.id]) {
        const numValue = Number(formData[column.id]);
        if (isNaN(numValue)) {
          errors[column.id] = `${column.name} must be a number`;
        }
      }
      
      if (column.type === 'email' && formData[column.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[column.id])) {
          errors[column.id] = `${column.name} must be a valid email`;
        }
      }
    });
    
    setValidationErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [category, formData]);
  
  // Get completion status
  const getCompletionStatus = useCallback(() => {
    if (!category?.columns) return { completed: 0, total: 0, percentage: 0 };
    
    const requiredColumns = category.columns.filter(col => col.is_required);
    const completedFields = requiredColumns.filter(col => {
      const value = formData[col.id];
      return value && String(value).trim() !== '';
    });
    
    return {
      completed: completedFields.length,
      total: requiredColumns.length,
      percentage: Math.round((completedFields.length / requiredColumns.length) * 100) || 0
    };
  }, [category, formData]);
  
  return {
    // State
    formData,
    isDataModified,
    validationErrors,
    entries,
    setEntries,
    
    // Actions
    updateFormData,
    handleFieldChange,
    resetForm,
    setInitialData,
    validateForm,
    
    // Status
    completionStatus: getCompletionStatus(),
    canSubmit: getCompletionStatus().percentage === 100 && Object.keys(validationErrors).length === 0
  };
};

export default useFormManager;
