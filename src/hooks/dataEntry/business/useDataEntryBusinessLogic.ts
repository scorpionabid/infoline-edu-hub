
import { useState, useCallback } from 'react';
import { DataEntryStatus } from '@/types/dataEntry';
import { CategoryWithColumns } from '@/types/category';

export interface DataEntryBusinessLogicOptions {
  categoryId: string;
  schoolId: string;
  category?: CategoryWithColumns | null;
}

export interface DataEntryBusinessLogicResult {
  // Business state
  businessStatus: 'idle' | 'processing' | 'validating' | 'saving' | 'error';
  
  // Business operations
  processFormData: (data: Record<string, any>) => Record<string, any>;
  validateBusinessRules: (data: Record<string, any>) => { isValid: boolean; errors: string[] };
  calculateCompletionMetrics: (data: Record<string, any>) => { completed: number; total: number; percentage: number };
  
  // Status transitions
  canTransitionTo: (newStatus: DataEntryStatus) => boolean;
  getNextValidStates: () => DataEntryStatus[];
  
  // Data quality
  assessDataQuality: (data: Record<string, any>) => { score: number; issues: string[] };
}

export const useDataEntryBusinessLogic = ({
  categoryId,
  schoolId,
  category
}: DataEntryBusinessLogicOptions): DataEntryBusinessLogicResult => {
  const [businessStatus, setBusinessStatus] = useState<'idle' | 'processing' | 'validating' | 'saving' | 'error'>('idle');

  const processFormData = useCallback((data: Record<string, any>) => {
    setBusinessStatus('processing');
    
    // Apply business transformations
    const processedData = { ...data };
    
    // Example: normalize phone numbers, format dates, etc.
    Object.keys(processedData).forEach(key => {
      const value = processedData[key];
      if (typeof value === 'string') {
        processedData[key] = value.trim();
      }
    });
    
    setBusinessStatus('idle');
    return processedData;
  }, []);

  const validateBusinessRules = useCallback((data: Record<string, any>) => {
    setBusinessStatus('validating');
    
    const errors: string[] = [];
    
    // Apply business validation rules
    if (category?.columns) {
      category.columns.forEach(column => {
        const value = data[column.id];
        
        // Required field validation
        if (column.is_required && (!value || value === '')) {
          errors.push(`${column.name} is required`);
        }
        
        // Type-specific validations
        if (value && column.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
          errors.push(`${column.name} must be a valid email`);
        }
        
        if (value && column.type === 'number' && isNaN(Number(value))) {
          errors.push(`${column.name} must be a valid number`);
        }
      });
    }
    
    setBusinessStatus('idle');
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [category]);

  const calculateCompletionMetrics = useCallback((data: Record<string, any>) => {
    const totalFields = category?.columns?.length || 0;
    const completedFields = Object.keys(data).filter(key => 
      data[key] !== undefined && data[key] !== '' && data[key] !== null
    ).length;
    
    return {
      completed: completedFields,
      total: totalFields,
      percentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
    };
  }, [category]);

  const canTransitionTo = useCallback((newStatus: DataEntryStatus) => {
    // Define valid status transitions based on business rules
    const validTransitions: Record<DataEntryStatus, DataEntryStatus[]> = {
      [DataEntryStatus.DRAFT]: [DataEntryStatus.PENDING],
      [DataEntryStatus.PENDING]: [DataEntryStatus.APPROVED, DataEntryStatus.REJECTED, DataEntryStatus.DRAFT],
      [DataEntryStatus.APPROVED]: [DataEntryStatus.DRAFT],
      [DataEntryStatus.REJECTED]: [DataEntryStatus.DRAFT]
    };
    
    const currentStatus = DataEntryStatus.DRAFT; // This would come from actual state
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }, []);

  const getNextValidStates = useCallback(() => {
    const currentStatus = DataEntryStatus.DRAFT; // This would come from actual state
    
    const validTransitions: Record<DataEntryStatus, DataEntryStatus[]> = {
      [DataEntryStatus.DRAFT]: [DataEntryStatus.PENDING],
      [DataEntryStatus.PENDING]: [DataEntryStatus.APPROVED, DataEntryStatus.REJECTED],
      [DataEntryStatus.APPROVED]: [],
      [DataEntryStatus.REJECTED]: [DataEntryStatus.DRAFT]
    };
    
    return validTransitions[currentStatus] || [];
  }, []);

  const assessDataQuality = useCallback((data: Record<string, any>) => {
    let score = 100;
    const issues: string[] = [];
    
    const totalFields = category?.columns?.length || 0;
    const filledFields = Object.keys(data).filter(key => 
      data[key] !== undefined && data[key] !== '' && data[key] !== null
    ).length;
    
    // Completeness score
    const completenessScore = totalFields > 0 ? (filledFields / totalFields) * 100 : 100;
    if (completenessScore < 80) {
      issues.push('Data completeness is below 80%');
      score -= (80 - completenessScore);
    }
    
    // Data consistency checks
    Object.values(data).forEach(value => {
      if (typeof value === 'string' && value.length > 1000) {
        issues.push('Some fields contain unusually long text');
        score -= 5;
      }
    });
    
    return {
      score: Math.max(0, Math.min(100, score)),
      issues
    };
  }, [category]);

  return {
    businessStatus,
    processFormData,
    validateBusinessRules,
    calculateCompletionMetrics,
    canTransitionTo,
    getNextValidStates,
    assessDataQuality
  };
};

export default useDataEntryBusinessLogic;
