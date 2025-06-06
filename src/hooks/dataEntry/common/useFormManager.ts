
import { useState, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/category';

export interface UseFormManagerOptions {
  categoryId: string;
  schoolId: string;
  category?: CategoryWithColumns | null;
}

export interface UseFormManagerResult {
  formData: Record<string, any>;
  isDataModified: boolean;
  validationErrors: Record<string, string>;
  handleFieldChange: (fieldId: string, value: any) => void;
  validateForm: () => { isValid: boolean; errors: Record<string, string> };
  resetForm: () => void;
  completionStatus: () => { completed: number; total: number; percentage: number };
}

export const useFormManager = ({
  categoryId,
  schoolId,
  category
}: UseFormManagerOptions): UseFormManagerResult => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDataModified, setIsDataModified] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setIsDataModified(true);
    
    // Clear validation error for this field
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    
    // Mock validation - check required fields
    if (category?.columns) {
      category.columns.forEach(column => {
        if (column.is_required && !formData[column.id]) {
          errors[column.id] = `${column.name} is required`;
        }
      });
    }

    setValidationErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [formData, category]);

  const resetForm = useCallback(() => {
    setFormData({});
    setIsDataModified(false);
    setValidationErrors({});
  }, []);

  const completionStatus = useCallback(() => {
    const totalFields = category?.columns?.length || 0;
    const completedFields = Object.keys(formData).filter(key => 
      formData[key] !== undefined && formData[key] !== ''
    ).length;
    
    return {
      completed: completedFields,
      total: totalFields,
      percentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
    };
  }, [formData, category]);

  return {
    formData,
    isDataModified,
    validationErrors,
    handleFieldChange,
    validateForm,
    resetForm,
    completionStatus
  };
};

export default useFormManager;
