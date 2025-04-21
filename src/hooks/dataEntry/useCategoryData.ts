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
      console.log('Fetching categories for school:', schoolId);

      // Əvvəlcə kateqoriyaları əldə edək
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }

      if (!categoriesData || !Array.isArray(categoriesData) || categoriesData.length === 0) {
        console.log('No categories found or invalid data format');
        setCategories([]);
        setLoading(false);
        return;
      }

      console.log('Found categories:', categoriesData.length);

      // Bütün kateqoriyalar üçün sütunları əldə edək
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoriesData.map(cat => cat.id))
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnsError) {
        console.error('Error fetching columns:', columnsError);
        throw columnsError;
      }

      if (!columnsData || !Array.isArray(columnsData)) {
        console.log('No columns found or invalid data format');
        // Kateqoriyaları sütunlar olmadan qaytaraq
        const categoriesWithEmptyColumns = categoriesData.map(cat => ({
          ...cat,
          columns: []
        }));
        setCategories(categoriesWithEmptyColumns);
        setLoading(false);
        return;
      }

      console.log('Found columns:', columnsData.length);

      // Sütunları düzgün formata çevirək
      const processedColumns = columnsData.map((col: any) => {
        let options = null;
        try {
          // Əgər options JSON formatında saxlanılırsa
          if (col.options && typeof col.options === 'string') {
            options = JSON.parse(col.options);
          } else {
            options = col.options;
          }
        } catch (e) {
          console.error('Error parsing column options:', e);
          options = []; // Xəta halında boş massiv istifadə edirik
        }

        return {
          id: col.id,
          category_id: col.category_id,
          name: col.name,
          type: col.type as ColumnType,
          is_required: col.is_required || false,
          order_index: col.order_index || 0,
          placeholder: col.placeholder || '',
          help_text: col.help_text || '',
          options: options || [],
          validation: col.validation || null,
          status: col.status || 'active',
          created_at: col.created_at,
          updated_at: col.updated_at
        };
      });

      // Kateqoriyaları və sütunları birləşdirək
      const categoriesWithColumns = categoriesData.map(category => {
        const categoryColumns = processedColumns.filter(col => col.category_id === category.id) || [];
        return {
          ...category,
          columns: categoryColumns
        };
      });

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error in fetchCategories:', err);
      setError(err.message || 'Kateqoriyaları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};
