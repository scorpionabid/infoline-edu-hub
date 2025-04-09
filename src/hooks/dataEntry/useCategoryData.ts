
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
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
    assignment: 'all',
    deadline: '2024-12-31',
    status: 'active',
    priority: 1,
    createdAt: new Date().toISOString(),
    columns: [
      {
        id: '101',
        categoryId: '1',
        name: 'Ad',
        type: 'text',
        isRequired: true,
        order: 1,
        status: 'active',
        validationRules: { maxLength: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '102',
        categoryId: '1',
        name: 'Soyad',
        type: 'text',
        isRequired: true,
        order: 2,
        status: 'active',
        validationRules: { maxLength: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    name: 'Müəllim Məlumatları',
    description: 'Müəllimlərlə bağlı əsas məlumatlar',
    assignment: 'all',
    deadline: '2024-12-31',
    status: 'active',
    priority: 2,
    createdAt: new Date().toISOString(),
    columns: [
      {
        id: '201',
        categoryId: '2',
        name: 'Ad',
        type: 'text',
        isRequired: true,
        order: 1,
        status: 'active',
        validationRules: { maxLength: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '202',
        categoryId: '2',
        name: 'Soyad',
        type: 'text',
        isRequired: true,
        order: 2,
        status: 'active',
        validationRules: { maxLength: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
      // Debug məlumatı
      console.log("Kateqoriyalar yüklənir, istifadəçi:", user);

      // Hal-hazırda real data əvəzinə mock datadan istifadə edirik
      // Real tətbiqetmə üçün supabase sorğularından istifadə edəcəyik
      
      // Supabase-dən kateqoriyaları yükləmə cəhdi edilir
      // Uğursuz olarsa, mock datadan istifadə edirik
      let categoriesData = null;
      let columnsData = null;
      
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('status', 'active')
          .order('priority', { ascending: false });
          
        if (catError) {
          console.error("Supabase kateqoriya sorğusu xətası:", catError);
          throw catError;
        }
        
        categoriesData = catData;
          
        const { data: colData, error: colError } = await supabase
          .from('columns')
          .select('*')
          .eq('status', 'active')
          .order('order_index', { ascending: true });
          
        if (colError) {
          console.error("Supabase sütun sorğusu xətası:", colError);
          throw colError;
        }
        
        columnsData = colData;
        
        console.log("Supabase-dən alınan kateqoriyalar:", categoriesData);
        console.log("Supabase-dən alınan sütunlar:", columnsData);
      } catch (supabaseError) {
        console.warn("Supabase sorğusu uğursuz oldu, mock datadan istifadə edilir:", supabaseError);
      }
      
      // Əgər supabase-dən data alına bilmədisə, mock datadan istifadə edirik
      if (!categoriesData || !columnsData) {
        console.log("Mock datadan istifadə edilir");
        
        // Categories adaptasiya etmə funksiyası
        const adaptCategories = (data: any[]): CategoryWithColumns[] => {
          return data.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            assignment: category.assignment,
            deadline: category.deadline,
            status: category.status,
            priority: category.priority,
            created_at: category.createdAt || category.created_at,
            updated_at: category.updatedAt || category.updated_at,
            columns: category.columns.map((col: any) => ({
              id: col.id,
              category_id: col.categoryId || col.category_id,
              name: col.name,
              type: col.type,
              is_required: col.isRequired || col.is_required,
              order_index: col.order || col.order_index,
              status: col.status,
              validation: col.validationRules || col.validation,
              default_value: col.defaultValue || col.default_value,
              placeholder: col.placeholder,
              help_text: col.helpText || col.help_text,
              options: col.options,
              created_at: col.createdAt || col.created_at,
              updated_at: col.updatedAt || col.updated_at
            }))
          }));
        };

        setCategories(adaptCategories(mockCategoriesData));
      } else {
        // Əgər real datanı aldıqsa, onu adaptasiya edib state-ə yazırıq
        // Kateqoriya və sütunları birləşdirək
        const dataWithColumns: CategoryWithColumns[] = categoriesData.map(category => {
          const categoryColumns = columnsData.filter(column => column.category_id === category.id);
          
          return {
            id: category.id,
            name: category.name,
            description: category.description || '',
            assignment: category.assignment,
            deadline: category.deadline,
            status: category.status,
            priority: category.priority || 0,
            created_at: category.created_at,
            updated_at: category.updated_at,
            columns: categoryColumns.map(col => ({
              id: col.id,
              category_id: col.category_id,
              name: col.name,
              type: col.type,
              is_required: col.is_required || false,
              order_index: col.order_index || 0,
              status: col.status,
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
      }
    } catch (err: any) {
      setError(err);
      console.error("Kateqoriyaları əldə etmə xətası:", err);
      toast.error("Kateqoriyaları yükləmək mümkün olmadı", {
        description: "Xahiş edirik bir az sonra yenidən cəhd edin"
      });
      
      // Xəta zamanı boş kateqoriya siyahısı qaytarırıq
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error };
};
