
import { useMemo } from 'react';
import { Column } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';

export interface ProgressMetrics {
  totalFields: number;
  filledFields: number;
  requiredFields: number;
  requiredFilledFields: number;
  completionPercentage: number;
  requiredCompletionPercentage: number;
}

export interface UseDataEntryProgressProps {
  columns: Column[];
  entries: DataEntry[];
  formData: Record<string, any>;
}

/**
 * Data entry progress tracking hook
 */
export function useDataEntryProgress({
  columns,
  entries,
  formData
}: UseDataEntryProgressProps) {
  
  // Calculate progress metrics
  const progressMetrics = useMemo((): ProgressMetrics => {
    const totalFields = columns.length;
    const requiredFields = columns.filter(col => col.is_required).length;
    
    // Count filled fields
    const filledFields = columns.filter(col => {
      const value = formData[col.id];
      return value && String(value).trim() !== '';
    }).length;
    
    // Count required filled fields
    const requiredFilledFields = columns.filter(col => {
      if (!col.is_required) return false;
      const value = formData[col.id];
      return value && String(value).trim() !== '';
    }).length;
    
    // Calculate percentages
    const completionPercentage = totalFields > 0 
      ? Math.round((filledFields / totalFields) * 100) 
      : 0;
      
    const requiredCompletionPercentage = requiredFields > 0 
      ? Math.round((requiredFilledFields / requiredFields) * 100) 
      : 100;
    
    return {
      totalFields,
      filledFields,
      requiredFields,
      requiredFilledFields,
      completionPercentage,
      requiredCompletionPercentage
    };
  }, [columns, formData]);
  
  // Check if form is ready for submission
  const isReadyForSubmission = useMemo(() => {
    return progressMetrics.requiredCompletionPercentage === 100;
  }, [progressMetrics]);
  
  // Get progress status text
  const getProgressStatus = () => {
    if (progressMetrics.completionPercentage === 100) {
      return 'completed';
    } else if (progressMetrics.requiredCompletionPercentage === 100) {
      return 'ready';
    } else if (progressMetrics.completionPercentage > 0) {
      return 'in_progress';
    } else {
      return 'not_started';
    }
  };
  
  return {
    progressMetrics,
    isReadyForSubmission,
    getProgressStatus,
    completionPercentage: progressMetrics.completionPercentage,
    requiredCompletionPercentage: progressMetrics.requiredCompletionPercentage
  };
}

export default useDataEntryProgress;
