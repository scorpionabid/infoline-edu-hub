
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, CategoryAssignment } from '@/types/category';
import { ColumnType } from '@/types/column';
import { toast } from 'sonner';

export const useSchoolCategories = (schoolId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns(*)
        `)
        .in('assignment', ['all', 'schools'])
        .eq('status', 'active')
        .order('order_index');

      if (error) throw error;

      const categoriesWithColumns: CategoryWithColumns[] = (data || []).map(category => ({
        ...category,
        assignment: category.assignment as CategoryAssignment,
        columns: (category.columns || []).map((column: any) => ({
          ...column,
          type: column.type as ColumnType,
          status: column.status as 'active' | 'inactive' | 'deleted',
          options: column.options ? 
            (typeof column.options === 'string' ? JSON.parse(column.options) : column.options) : 
            [],
          validation: column.validation ? 
            (typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation) : 
            {}
        }))
      }));

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching school categories:', err);
      setError(err.message);
      toast.error('Məktəb kateqoriyaları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [schoolId]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
