
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column, CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useCategoryData = (categoryId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Konverter fonksiyonları
  const convertOptions = (options: any): string[] | { value: string; label: string }[] => {
    if (!options) return [];
    
    try {
      // options bir string ise, JSON olarak parse edelim
      if (typeof options === 'string') {
        return JSON.parse(options);
      }
      // options array ise
      if (Array.isArray(options)) {
        return options;
      }
      // options nesne ise
      return options;
    } catch (error) {
      console.error('Options dönüştürme hatası:', error);
      return [];
    }
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });
      
      if (categoryId) {
        query = query.eq('id', categoryId);
      }
      
      const { data: categoriesData, error: categoriesError } = await query;
      
      if (categoriesError) {
        throw categoriesError;
      }
      
      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
        setLoading(false);
        return;
      }
      
      // For each category, fetch its columns
      const categoriesWithColumns = await Promise.all(
        categoriesData.map(async (category) => {
          const { data: columnsData, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id)
            .order('order_index', { ascending: true });
          
          if (columnsError) {
            console.error('Sütunlar çekilirken hata:', columnsError);
            return {
              ...category,
              columns: []
            };
          }
          
          // Convert column data from Supabase to our app format
          const columns: Column[] = (columnsData || []).map(dbColumn => {
            const column: Column = {
              id: dbColumn.id,
              category_id: dbColumn.category_id,
              name: dbColumn.name,
              type: dbColumn.type,
              is_required: dbColumn.is_required,
              help_text: dbColumn.help_text,
              placeholder: dbColumn.placeholder,
              options: convertOptions(dbColumn.options),
              validation: dbColumn.validation as any,
              default_value: dbColumn.default_value,
              order_index: dbColumn.order_index,
              status: dbColumn.status || 'active',
              created_at: dbColumn.created_at,
              updated_at: dbColumn.updated_at,
              // Add the parent_column_id property
              parent_column_id: null
            };
            return column;
          });
          
          return {
            ...category,
            columns
          };
        })
      );
      
      setCategories(categoriesWithColumns as CategoryWithColumns[]);
    } catch (error: any) {
      console.error('Kategorilər yüklənərkən xəta:', error);
      setError(t('errorLoadingData'));
      toast.error(t('errorLoadingData'), {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [categoryId, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryById = useCallback((id?: string): CategoryWithColumns | undefined => {
    if (!id) return undefined;
    return categories.find(cat => cat.id === id);
  }, [categories]);

  return {
    categories,
    loading,
    error,
    getCategoryById,
    refreshCategories: fetchCategories
  };
};
