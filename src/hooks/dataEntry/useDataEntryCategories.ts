
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';
import { Column, ColumnType } from '@/types/column';

export function useDataEntryCategories(categoryId?: string) {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithColumns | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;

      if (!data || !Array.isArray(data) || data.length === 0) {
        setCategories([]);
        setLoading(false);
        return;
      }

      const columnsPromises = data.map(async (category) => {
        const { data: columns, error: columnsError } = await supabase
          .from('columns')
          .select('*')
          .eq('category_id', category.id)
          .order('order_index', { ascending: true });
        if (columnsError) throw columnsError;

        // Sütunları düzgün tip formatına çevirmək
        const typedColumns: Column[] = (columns || []).map(col => ({
          id: col.id,
          category_id: col.category_id,
          name: col.name,
          type: col.type as ColumnType,
          is_required: col.is_required,
          placeholder: col.placeholder,
          help_text: col.help_text,
          default_value: col.default_value,
          options: col.options,
          validation: col.validation,
          order_index: col.order_index,
          status: col.status,
          created_at: col.created_at,
          updated_at: col.updated_at
        }));

        return {
          ...category,
          columns: typedColumns
        } as CategoryWithColumns;
      });

      const categoriesWithColumns = await Promise.all(columnsPromises);
      setCategories(categoriesWithColumns);

      if (categoryId) {
        setSelectedCategory(categoriesWithColumns.find(cat => cat.id === categoryId));
      }
    } catch (err: any) {
      setError(err.message || 'Kategoriler yüklenirken hata oluşdu');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    loadCategories,
  };
}
