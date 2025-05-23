
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

  // Safely check for all data
  const hasAllData = category && category.columns && Array.isArray(category.columns) && 
    category.columns.every(column => {
      return column && column.id && dataEntries && Array.isArray(dataEntries) && 
        dataEntries.some(entry => entry && entry.column_id === column.id);
    });

  // Calculate completion percentage with safety checks
  const completionPercentage = (category?.columns && Array.isArray(category.columns) && category.columns.length > 0)
    ? Math.round(((dataEntries?.length || 0) / category.columns.length) * 100)
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
