
import { useState, useEffect } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { supabase } from '@/integrations/supabase/client';

export interface UseSchoolCategoriesResult {
  categories: CategoryWithColumns[];
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

export const useSchoolCategories = (schoolId: string): UseSchoolCategoriesResult => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select(`
          *,
          columns (*)
        `)
        .eq('status', 'active')
        .order('name');

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchCategories();
    }
  }, [schoolId]);

  return {
    categories,
    isLoading,
    error,
    refreshCategories: fetchCategories
  };
};

export default useSchoolCategories;
