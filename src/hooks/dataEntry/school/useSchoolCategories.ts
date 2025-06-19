
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
        .order('name');

      if (error) throw error;

      const categoriesWithColumns: CategoryWithColumns[] = (Array.isArray(data) ? data : []).map((category: any) => ({
        ...category,
        assignment: (category.assignment || 'all') as CategoryAssignment,
        columns: Array.isArray(category.columns)
          ? (category.columns || []).map((column: any) => ({
              ...column,
              type: column.type as ColumnType,
              status: column.status,
              options: column.options ? 
                (typeof column.options === 'string' ? JSON.parse(column.options) : column.options) : 
                [],
              validation: column.validation ? 
                (typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation) : 
                {}
            }))
          : []
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
