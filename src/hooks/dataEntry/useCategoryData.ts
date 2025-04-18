
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';
import { Column, ColumnType } from '@/types/column';
import { Json } from '@/types/json';

export const useCategoryData = (schoolId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Əvvəlcə kateqoriyaları əldə edək
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Bütün kateqoriyalar üçün sütunları əldə edək
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoriesData.map(cat => cat.id))
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnsError) throw columnsError;

      // Sütunları düzgün formata çevirək
      const processedColumns = columnsData.map((col: any) => {
        return {
          id: col.id,
          category_id: col.category_id,
          name: col.name,
          type: col.type as ColumnType,
          is_required: col.is_required,
          order_index: col.order_index,
          placeholder: col.placeholder,
          help_text: col.help_text,
          options: processOptions(col.options),
          validation: processValidation(col.validation),
          default_value: col.default_value,
          status: col.status,
          created_at: col.created_at,
          updated_at: col.updated_at,
          parent_column_id: col.parent_column_id
        } as Column;
      });

      // Sütunları kateqoriyalara görə qruplaşdıraq
      const groupedByCategory = processedColumns.reduce((acc, column) => {
        if (!acc[column.category_id]) {
          acc[column.category_id] = [];
        }
        acc[column.category_id].push(column);
        return acc;
      }, {} as Record<string, Column[]>);

      // Son nəticəni hazırlayaq
      const categoriesWithColumns = categoriesData.map(category => {
        return {
          ...category,
          columns: groupedByCategory[category.id] || []
        } as CategoryWithColumns;
      });

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching category data:', err);
      setError(err.message || 'Kateqoriya məlumatlarını əldə edərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Sütun variantlarını emal edən köməkçi funksiya
  const processOptions = (options: Json) => {
    if (!options) return [];
    
    try {
      if (Array.isArray(options)) {
        return options.map(opt => {
          if (typeof opt === 'string') {
            return { label: opt, value: opt };
          }
          return opt;
        });
      }
      return [];
    } catch (e) {
      console.error('Error processing options:', e);
      return [];
    }
  };

  // Validasiya məlumatlarını emal edən köməkçi funksiya
  const processValidation = (validation: Json) => {
    if (!validation) return {};
    
    try {
      if (typeof validation === 'object' && validation !== null) {
        return validation;
      }
      return {};
    } catch (e) {
      console.error('Error processing validation:', e);
      return {};
    }
  };

  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    getCategoryById,
    refreshCategories
  };
};
