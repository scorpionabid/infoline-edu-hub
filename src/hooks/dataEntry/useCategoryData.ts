
import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, ColumnType, Column } from '@/types/column';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface UseCategoryDataReturn {
  categories: CategoryWithColumns[];
  isLoading: boolean;
  error: Error | null;
}

const mockCategoriesData = [
  {
    id: '1',
    name: 'Şagird Məlumatları',
    description: 'Şagirdlərlə bağlı əsas məlumatlar',
    assignment: 'all' as 'all' | 'sectors',
    deadline: '2024-12-31',
    status: 'active' as 'active' | 'inactive' | 'draft',
    priority: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived: false,
    column_count: 2,
    columns: [
      {
        id: '101',
        category_id: '1',
        name: 'Ad',
        type: 'text' as ColumnType,
        is_required: true,
        order_index: 1,
        status: 'active',
        validation: { maxLength: 50 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '102',
        category_id: '1',
        name: 'Soyad',
        type: 'text' as ColumnType,
        is_required: true,
        order_index: 2,
        status: 'active',
        validation: { maxLength: 50 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    name: 'Müəllim Məlumatları',
    description: 'Müəllimlərlə bağlı əsas məlumatlar',
    assignment: 'all' as 'all' | 'sectors',
    deadline: '2024-12-31',
    status: 'active' as 'active' | 'inactive' | 'draft',
    priority: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived: false,
    column_count: 2,
    columns: [
      {
        id: '201',
        category_id: '2',
        name: 'Ad',
        type: 'text' as ColumnType,
        is_required: true,
        order_index: 1,
        status: 'active',
        validation: { maxLength: 50 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '202',
        category_id: '2',
        name: 'Soyad',
        type: 'text' as ColumnType,
        is_required: true,
        order_index: 2,
        status: 'active',
        validation: { maxLength: 50 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
];

export const useCategoryData = (): UseCategoryDataReturn => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Kateqoriyalar yüklənir, istifadəçi:", user);

      let { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false });
        
      if (catError) {
        console.error("Supabase kateqoriya sorğusu xətası:", catError);
        throw catError;
      }
      
      if (!categoriesData || categoriesData.length === 0) {
        console.log("Supabase-dən kateqoriya tapılmadı, mock datadan istifadə edilir");
        setCategories(mockCategoriesData);
        setIsLoading(false);
        return;
      }
      
      console.log("Supabase-dən alınan kateqoriyalar:", categoriesData);
      
      let { data: columnsData, error: colError } = await supabase
        .from('columns')
        .select('*')
        .eq('status', 'active')
        .order('order_index', { ascending: true });
        
      if (colError) {
        console.error("Supabase sütun sorğusu xətası:", colError);
        throw colError;
      }
      
      console.log("Supabase-dən alınan sütunlar:", columnsData);
      
      const dataWithColumns: CategoryWithColumns[] = categoriesData.map(category => {
        const categoryColumns = columnsData?.filter(column => column.category_id === category.id) || [];
        
        return {
          id: category.id,
          name: category.name,
          description: category.description || '',
          assignment: category.assignment as 'all' | 'sectors',
          deadline: category.deadline,
          status: category.status as 'active' | 'inactive' | 'draft',
          priority: category.priority || 0,
          created_at: category.created_at,
          updated_at: category.updated_at,
          archived: category.archived || false,
          column_count: category.column_count || 0,
          columns: categoryColumns.map(col => ({
            id: col.id,
            category_id: col.category_id,
            name: col.name,
            type: col.type as ColumnType,
            is_required: col.is_required || false,
            order_index: col.order_index || 0,
            status: col.status as 'active' | 'inactive' | 'draft',
            validation: col.validation,
            default_value: col.default_value,
            placeholder: col.placeholder,
            help_text: col.help_text,
            options: col.options,
            created_at: col.created_at,
            updated_at: col.updated_at
          }))
        };
      });
      
      console.log("Hazırlanmış data:", dataWithColumns);
      setCategories(dataWithColumns);
    } catch (err: any) {
      setError(err);
      console.error("Kateqoriyaları əldə etmə xətası:", err);
      toast.error("Kateqoriyaları yükləmək mümkün olmadı", {
        description: "Xahiş edirik bir az sonra yenidən cəhd edin"
      });
      
      // Fallback olaraq mock data təyin et
      setCategories(mockCategoriesData);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error };
};
