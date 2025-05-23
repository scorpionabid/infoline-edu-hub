
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { useCategoryData, UseCategoryDataProps } from './useCategoryData';
import { useDataEntryState } from './useDataEntryState';

export interface UseDataEntryProps {
  categoryId?: string;
  schoolId?: string;
}

export const useDataEntry = ({ categoryId, schoolId }: UseDataEntryProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Default to empty strings for IDs to prevent undefined errors
  const safeCategoryId = categoryId || '';
  const safeSchoolId = schoolId || '';

  const categoryDataProps: UseCategoryDataProps = { categoryId: safeCategoryId };
  const { 
    category, 
    loading: isCategoryLoading, 
    error: categoryError 
  } = useCategoryData(categoryDataProps);
  
  const { 
    dataEntries, 
    isLoading: isEntriesLoading, 
    error: entriesError,
    saveDataEntries,
    fetchDataEntries
  } = useDataEntryState({ 
    categoryId: safeCategoryId, 
    schoolId: safeSchoolId
  });

  const isLoading = isCategoryLoading || isEntriesLoading;
  const error = categoryError || entriesError;

  // Safely check for all data - handle potential null/undefined values
  const safeCategory = category || { columns: [] };
  const safeColumns = Array.isArray(safeCategory.columns) ? safeCategory.columns.filter(Boolean) : [];
  const safeEntries = Array.isArray(dataEntries) ? dataEntries.filter(Boolean) : [];
  
  const hasAllData = safeColumns.length > 0 && 
    safeColumns.every(column => {
      return column && column.id && safeEntries.some(entry => entry && entry.column_id === column.id);
    });

  // Calculate completion percentage with safety checks
  const completionPercentage = safeColumns.length > 0
    ? Math.round((safeEntries.length / safeColumns.length) * 100)
    : 0;

  return {
    category: safeCategory,
    dataEntries: safeEntries,
    isLoading,
    error,
    hasAllData,
    completionPercentage,
    isSubmitting,
    isSubmitted,
    saveDataEntries,
    fetchDataEntries
  };
};

export default useDataEntry;
