
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryEntryData } from '@/types/dataEntry';

export const useForm = (schoolId: string) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Fetch categories for the school
  const { data: categories, isLoading } = useQuery({
    queryKey: ['school-categories', schoolId],
    queryFn: async () => {
      // Get categories with completion status
      const { data, error } = await supabase.rpc('get_school_completion_stats', {
        p_school_id: schoolId
      });
      
      if (error) throw new Error(error.message);
      
      return data.map((cat: any) => ({
        ...cat,
        completionRate: cat.completion_percentage || 0,
        completionPercentage: cat.completion_percentage || 0
      })) as CategoryEntryData[];
    },
    enabled: !!schoolId
  });
  
  // Handle category selection
  const selectCategory = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);
  
  // Get selected category data
  const getSelectedCategory = useCallback(() => {
    if (!selectedCategory || !categories) return null;
    return categories.find(cat => cat.id === selectedCategory) || null;
  }, [selectedCategory, categories]);
  
  return {
    categories,
    isLoading,
    selectedCategory,
    selectCategory,
    getSelectedCategory
  };
};
