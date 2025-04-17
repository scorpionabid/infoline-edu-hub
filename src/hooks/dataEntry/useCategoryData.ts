
import { useState, useEffect, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/dataEntry';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType } from '@/types/column';

export const useCategoryData = ({ schoolId }: { schoolId?: string } = {}) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false });

      if (categoriesError) throw categoriesError;

      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoriesData.map(c => c.id))
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnsError) throw columnsError;

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

      const formattedCategories = categoriesData.map(category => {
        const categoryColumns = columnsData
          .filter(column => column.category_id === category.id)
          .map(column => {
            return {
              id: column.id,
              category_id: column.category_id,
              name: column.name,
              type: column.type as ColumnType,
              is_required: column.is_required,
              placeholder: column.placeholder,
              help_text: column.help_text,
              order_index: column.order_index,
              status: column.status as 'active' | 'inactive' | 'archived',
              validation: column.validation,
              default_value: column.default_value,
              options: column.options,
              created_at: column.created_at,
              updated_at: column.updated_at,
              entry: schoolId 
                ? entriesData.find(entry => 
                    entry.column_id === column.id && 
                    entry.school_id === schoolId
                  ) 
                : null
            } as Column;
          });

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
          completionPercentage: schoolId ? 
            calculateCompletionPercentage(categoryColumns.map(col => col.entry)) : 0
        } as CategoryWithColumns;
      });

      setCategories(formattedCategories);
    } catch (err: any) {
      console.error('Kateqoriyaları əldə edərkən xəta:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryById = (id?: string): CategoryWithColumns => {
    if (!id) return categories[0] || { id: '', name: '', columns: [], completionPercentage: 0 } as CategoryWithColumns;
    return categories.find(cat => cat.id === id) || categories[0] || { id: '', name: '', columns: [], completionPercentage: 0 } as CategoryWithColumns;
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

function calculateCompletionPercentage(entries: any[]) {
  if (!entries || entries.length === 0) return 0;
  
  const filledEntries = entries.filter(entry => entry && entry.value);
  return Math.round((filledEntries.length / entries.length) * 100);
}

const fetchCategoryColumns = async (categoryId: string) => {
  try {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: true });
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(column => ({
      id: column.id,
      category_id: column.category_id,
      name: column.name,
      type: column.type as ColumnType,
      is_required: column.is_required,
      placeholder: column.placeholder,
      help_text: column.help_text,
      order_index: column.order_index,
      status: column.status as 'active' | 'inactive' | 'archived',
      validation: column.validation,
      default_value: column.default_value,
      options: column.options,
      created_at: column.created_at,
      updated_at: column.updated_at
    } as Column));
  } catch (err) {
    console.error('Error fetching columns:', err);
    return [];
  }
};
