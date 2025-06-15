
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { CategoryWithColumns } from '@/types/category';
import { toast } from 'sonner';

export const useSchoolDataEntry = (schoolId?: string) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!schoolId || !user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns(*)
        `)
        .eq('status', 'active')
        .order('order_index');

      if (error) throw error;

      const categoriesWithColumns: CategoryWithColumns[] = (data || []).map(category => ({
        ...category,
        columns: category.columns || []
      }));

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching school categories:', err);
      setError(err.message);
      toast.error('Kateqoriyalar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [schoolId, user]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
