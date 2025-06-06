
import { useState, useCallback, useRef } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry } from '@/types/dataEntry';
import { Column } from '@/types/column';

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
    
    // Check if data is modified
    const isModified = JSON.stringify(newData) !== JSON.stringify(originalDataRef.current);
    setIsDataModified(isModified);
  }, []);

  // Handle field change
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldId]: value };
      
      // Check if data is modified
      const isModified = JSON.stringify(newData) !== JSON.stringify(originalDataRef.current);
      setIsDataModified(isModified);
      
      return newData;
    });
  }, []);

  // Set initial data
  const setInitialData = useCallback((data: Record<string, any>) => {
    setFormData(data);
    originalDataRef.current = { ...data };
    setIsDataModified(false);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    const columns = category?.columns || [];
    
    columns.forEach((column: Column) => {
      const value = formData[column.id];
      
      if (column.is_required && (!value || String(value).trim() === '')) {
        errors[column.id] = `${column.name} sahəsi tələb olunur`;
      }
    });
    
    setValidationErrors(errors);
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [formData, category]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(originalDataRef.current);
    setIsDataModified(false);
    setValidationErrors({});
  }, []);

  // Get completion status
  const completionStatus = useCallback(() => {
    const columns = category?.columns || [];
    if (columns.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = columns.filter((column: Column) => {
      const value = formData[column.id];
      return value && String(value).trim() !== '';
    }).length;
    
    return {
      completed,
      total: columns.length,
      percentage: Math.round((completed / columns.length) * 100)
    };
  }, [formData, category]);

  return {
    formData,
    isDataModified,
    validationErrors,
    entries,
    setEntries,
    updateFormData,
    handleFieldChange,
    setInitialData,
    validateForm,
    resetForm,
    completionStatus
  };
};

export default useFormManager;
