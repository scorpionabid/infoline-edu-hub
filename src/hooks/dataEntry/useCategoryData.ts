import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, Column, adaptDbColumnToAppColumn } from '@/types/column';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const useCategoryData = () => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const formatColumnOptions = (options: any): string[] | { value: string; label: string }[] => {
    if (!options) return [];
    
    try {
      if (typeof options === 'string') {
        return JSON.parse(options);
      }
      if (Array.isArray(options)) {
        return options.map(opt => {
          if (typeof opt === 'string') return opt;
          if (typeof opt === 'object' && 'value' in opt && 'label' in opt) {
            return { value: String(opt.value), label: String(opt.label) };
          }
          return '';
        }).filter(Boolean);
      }
    } catch (e) {
      console.error('Error parsing column options:', e);
    }
    return [];
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('archived', false)
        .order('priority', { ascending: true });

      if (categoriesError) throw categoriesError;

      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnsError) throw columnsError;

      const categoriesWithColumns: CategoryWithColumns[] = categoriesData.map(category => {
        const categoryColumns = columnsData
          .filter(column => column.category_id === category.id)
          .map(column => {
            const formattedOptions = formatColumnOptions(column.options);
            const formattedColumn: Column = {
              id: column.id,
              category_id: column.category_id,
              name: column.name,
              type: column.type as any,
              is_required: column.is_required,
              order_index: column.order_index,
              status: column.status as 'active' | 'inactive' | 'draft',
              validation: column.validation,
              default_value: column.default_value,
              placeholder: column.placeholder,
              help_text: column.help_text,
              options: formattedOptions,
              created_at: column.created_at,
              updated_at: column.updated_at,
              parent_column_id: column.parent_column_id
            };
            return formattedColumn;
          });

        const formattedCategory: CategoryWithColumns = {
          id: category.id,
          name: category.name,
          description: category.description,
          assignment: category.assignment as 'all' | 'sectors',
          deadline: category.deadline,
          status: category.status as 'active' | 'inactive' | 'draft',
          priority: category.priority,
          created_at: category.created_at,
          updated_at: category.updated_at,
          archived: category.archived || false,
          column_count: categoryColumns.length,
          columns: categoryColumns
        };

        return formattedCategory;
      });

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Kateqoriyaları əldə edərkən xəta:', err);
      setError(new Error(t('errorFetchingCategories')));
      toast({
        title: t('error'),
        description: t('errorFetchingCategories'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user, fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

export default useCategoryData;
