
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';

const useSchoolColumnReport = (schoolId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategoriesWithColumns = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Kateqoriyaları əldə et
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });

      if (categoriesError) throw categoriesError;

      const categoriesWithColumnsPromises = categoriesData.map(async (cat) => {
        // Hər kateqoriya üçün sütunları əldə et
        const { data: columnsData, error: columnsError } = await supabase
          .from('columns')
          .select('*')
          .eq('category_id', cat.id)
          .order('order_index', { ascending: true });

        if (columnsError) throw columnsError;

        // Kateqoriya və sütun məlumatlarını birləşdir
        const formattedColumns = columnsData.map(col => {
          // Ensure column order is properly set
          const order = col.order || col.order_index || 0;
          
          return {
            id: col.id,
            name: col.name,
            type: col.type,
            categoryId: col.category_id,
            isRequired: col.is_required,
            order,
            orderIndex: col.order_index,
            status: col.status || 'active',
            options: col.options || []
          };
        });

        return {
          category: {
            id: cat.id,
            name: cat.name,
            description: cat.description || '',
            order: cat.order || cat.priority || 1,
            priority: cat.priority || 1,
            status: cat.status || 'active',
            assignment: cat.assignment || 'all',
            deadline: cat.deadline
          },
          columns: formattedColumns
        };
      });

      const categoriesWithColumns = await Promise.all(categoriesWithColumnsPromises);
      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching categories with columns:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  const fetchSchoolDataEntries = useCallback(async (categoryId: string) => {
    if (!schoolId) return [];

    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching school data entries:', err);
      return [];
    }
  }, [schoolId]);

  // Cari kateqoriyanın təsdiqlənmə statusunu əldə et
  const getCategoryStatus = useCallback(async (categoryId: string) => {
    if (!schoolId) return 'pending';

    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('status, updated_at')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (!data || data.length === 0) return 'pending';
      
      return data[0].status;
    } catch (err: any) {
      console.error('Error fetching category status:', err);
      return 'pending';
    }
  }, [schoolId]);

  // Lazım olan test məlumatları
  const getMockSchoolData = useCallback(() => {
    const defaultCategories: CategoryWithColumns[] = [
      {
        id: 'cat-1',
        name: 'Məktəb məlumatları',
        description: 'Əsas məktəb məlumatları',
        assignment: 'all',
        priority: 1,
        deadline: new Date().toISOString(),
        status: 'active',
        order: 1,
        category: {
          id: 'cat-1',
          name: 'Məktəb məlumatları',
          description: 'Əsas məktəb məlumatları',
          order: 1,
          priority: 1
        },
        columns: [
          {
            id: 'col-1',
            categoryId: 'cat-1',
            name: 'Şagird sayı',
            type: 'number',
            isRequired: true,
            order: 1,
            orderIndex: 1,
            status: 'active'
          },
          {
            id: 'col-2',
            categoryId: 'cat-1',
            name: 'Müəllim sayı',
            type: 'number',
            isRequired: true,
            order: 2,
            orderIndex: 2,
            status: 'active'
          }
        ]
      },
      {
        id: 'cat-2',
        name: 'İnfrastruktur',
        description: 'Məktəbin infrastrukturu barədə məlumatlar',
        assignment: 'sectors',
        priority: 2,
        status: 'active',
        order: 2,
        category: {
          id: 'cat-2',
          name: 'İnfrastruktur',
          description: 'Məktəbin infrastrukturu barədə məlumatlar',
          order: 2,
          priority: 2
        },
        columns: [
          {
            id: 'col-3',
            categoryId: 'cat-2',
            name: 'Sinif otaqlarının sayı',
            type: 'number',
            isRequired: true,
            order: 1,
            orderIndex: 1,
            status: 'active'
          }
        ]
      },
      {
        id: 'cat-3',
        name: 'Əlavə məlumatlar',
        description: 'Əlavə məlumatlar',
        assignment: 'all',
        priority: 3,
        status: 'active',
        order: 3,
        category: {
          id: 'cat-3',
          name: 'Əlavə məlumatlar',
          description: 'Əlavə məlumatlar',
          order: 3,
          priority: 3
        },
        columns: [
          {
            id: 'col-4',
            categoryId: 'cat-3',
            name: 'İdman zalı mövcuddur',
            type: 'checkbox',
            isRequired: true,
            order: 1,
            orderIndex: 1,
            status: 'active'
          }
        ]
      }
    ];

    return defaultCategories;
  }, []);

  useEffect(() => {
    if (schoolId) {
      fetchCategoriesWithColumns();
    } else {
      // Test məlumatlarını yüklə
      setCategories(getMockSchoolData());
      setLoading(false);
    }
  }, [schoolId, fetchCategoriesWithColumns, getMockSchoolData]);

  return {
    categories,
    loading,
    error,
    fetchCategoriesWithColumns,
    fetchSchoolDataEntries,
    getCategoryStatus
  };
};

export default useSchoolColumnReport;
