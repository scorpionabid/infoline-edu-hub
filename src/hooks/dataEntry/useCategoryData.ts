
import { useState, useEffect, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/dataEntry';
import { supabase } from '@/integrations/supabase/client';
import { ColumnType } from '@/types/column';

export const useCategoryData = ({ schoolId }: { schoolId?: string }) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Kateqoriyaları əldə edirik
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Sütunları əldə edirik
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoriesData.map(c => c.id))
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnsError) throw columnsError;

      // Əgər bir məktəb seçilibsə, məlumatları da əldə edirik
      let entriesData: any[] = [];
      
      if (schoolId) {
        const { data: entriesResult, error: entriesError } = await supabase
          .from('data_entries')
          .select('*')
          .eq('school_id', schoolId)
          .in('category_id', categoriesData.map(c => c.id));

        if (!entriesError) {
          entriesData = entriesResult || [];
        }
      }

      // Kateqoriyaları və onların sütunlarını birləşdiririk
      const formattedCategories = categoriesData.map(category => {
        const categoryColumns = columnsData
          .filter(column => column.category_id === category.id)
          .map(column => ({
            id: column.id,
            category_id: column.category_id,
            name: column.name,
            type: column.type as ColumnType,
            is_required: column.is_required,
            placeholder: column.placeholder,
            help_text: column.help_text,
            order_index: column.order_index,
            status: column.status as 'active' | 'inactive' | 'draft',
            validation: column.validation,
            default_value: column.default_value,
            options: column.options,
            parent_column_id: column.parent_column_id,
            created_at: column.created_at,
            updated_at: column.updated_at,
            // Əgər məlumat varsa, onu əlavə edirik
            entry: schoolId 
              ? entriesData.find(entry => 
                  entry.column_id === column.id && 
                  entry.school_id === schoolId
                ) 
              : null
          }));

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          assignment: category.assignment,
          deadline: category.deadline,
          status: category.status,
          priority: category.priority,
          created_at: category.created_at,
          updated_at: category.updated_at,
          columns: categoryColumns,
          // Tamamlanma faizini hesablayırıq (əgər məktəb ID varsa)
          completionPercentage: schoolId ? 
            calculateCompletionPercentage(categoryColumns.map(col => col.entry)) : 0
        };
      });

      setCategories(formattedCategories);
    } catch (err: any) {
      console.error('Kateqoriyaları əldə edərkən xəta:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // Kateqoriyalar yüklənərkən onları əldə edirik
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ID-yə görə kateqoriyanı əldə etmək üçün helper funksiya
  const getCategoryById = (id?: string): CategoryWithColumns => {
    if (!id) return categories[0] || { id: '', name: '', columns: [] };
    return categories.find(cat => cat.id === id) || categories[0] || { id: '', name: '', columns: [] };
  };

  const refreshCategories = async () => {
    return fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    getCategoryById,
    refreshCategories
  };
};

// Bir kateqoriya üçün tamamlanma faizini hesablamaq üçün helper funksiya
function calculateCompletionPercentage(entries: any[]) {
  if (!entries || entries.length === 0) return 0;
  
  const filledEntries = entries.filter(entry => entry && entry.value);
  return Math.round((filledEntries.length / entries.length) * 100);
}
