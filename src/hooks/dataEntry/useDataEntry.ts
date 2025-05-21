
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

  const categoryDataProps: UseCategoryDataProps = { categoryId };
  const { category, loading: isCategoryLoading, error: categoryError } = useCategoryData(categoryDataProps);
  
  const { 
    dataEntries, 
    isLoading: isEntriesLoading, 
    error: entriesError,
    saveDataEntries,
    fetchDataEntries
  } = useDataEntryState({ 
    categoryId: categoryId || '', 
    schoolId: schoolId || '' 
  });

  const isLoading = isCategoryLoading || isEntriesLoading;
  const error = categoryError || entriesError;

  // Check if we have data for all the columns
  const hasAllData = category && category.columns && category.columns.every(column => {
    return dataEntries.some(entry => entry.column_id === column.id);
  });

  // Calculate completion percentage
  const completionPercentage = category && category.columns && category.columns.length > 0
    ? Math.round((dataEntries.length / category.columns.length) * 100)
    : 0;

  return {
    category,
    dataEntries,
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
