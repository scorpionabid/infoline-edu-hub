
import { supabase } from '@/integrations/supabase/client';
import { Category, adaptSupabaseCategory, adaptCategoryToSupabase } from '@/types/category';

// Bütün kateqoriyaları əldə etmək üçün API funksiyası
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('priority', { ascending: true });
      
    if (error) {
      console.error('Kateqoriyaları əldə edərkən xəta:', error);
      throw error;
    }
    
    // Mock data, əgər real data olmasa
    if (!data || data.length === 0) {
      return [
        {
          id: '1',
          name: 'Əsas məktəb məlumatları',
          assignment: 'all',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          priority: 1,
          description: 'Məktəb haqqında əsas məlumatlar',
          columnCount: 8,
          archived: false
        },
        {
          id: '2',
          name: 'Müəllim statistikası',
          assignment: 'sectors',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          priority: 2,
          description: 'Müəllimlər haqqında statistik məlumatlar',
          columnCount: 12,
          archived: false
        },
        {
          id: '3',
          name: 'Şagird məlumatları',
          assignment: 'all',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          priority: 3,
          description: 'Şagirdlər haqqında ətraflı məlumatlar',
          columnCount: 15,
          archived: false
        },
        {
          id: '4',
          name: 'İnfrastruktur',
          assignment: 'sectors',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          priority: 4,
          description: 'Məktəb infrastrukturu haqqında məlumatlar',
          columnCount: 6,
          archived: false
        },
        {
          id: '5',
          name: 'Maddi-texniki baza',
          assignment: 'sectors',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'inactive',
          priority: 5,
          description: 'Maddi-texniki baza haqqında məlumatlar',
          columnCount: 10,
          archived: false
        }
      ];
    }
    
    // Supabase datalarını uyğunlaşdıraq
    return data.map(adaptSupabaseCategory);
  } catch (error) {
    console.error('Kateqoriyaları əldə edərkən xəta:', error);
    throw error;
  }
};

// Kateqoriya əlavə etmək və ya yeniləmək üçün funksiya
export const addCategory = async (categoryData: Partial<Category> & { name: string }): Promise<Category> => {
  try {
    // Type compatibility üçün id öncədən təyin edək
    const categoryWithId: Category = {
      id: categoryData.id || '',
      name: categoryData.name,
      description: categoryData.description,
      assignment: categoryData.assignment || 'all',
      status: categoryData.status || 'active',
      deadline: categoryData.deadline,
      priority: categoryData.priority,
      columnCount: categoryData.columnCount || 0,
      createdAt: categoryData.createdAt || new Date().toISOString(),
      updatedAt: categoryData.updatedAt || new Date().toISOString(),
      archived: categoryData.archived || false
    };
    
    const supabaseData = adaptCategoryToSupabase(categoryWithId);
    
    // Yeni kateqoriya yaratma və ya mövcud olanı yeniləmə
    const { data, error } = categoryData.id 
      ? await supabase
          .from('categories')
          .update(supabaseData)
          .eq('id', categoryData.id)
          .select()
          .single()
      : await supabase
          .from('categories')
          .insert(supabaseData)
          .select()
          .single();

    if (error) {
      console.error('Kateqoriya əməliyyatı zamanı xəta:', error);
      throw error;
    }

    return adaptSupabaseCategory(data);
  } catch (error) {
    console.error('Kateqoriya əlavə etmə/yeniləmə zamanı xəta:', error);
    throw error;
  }
};

// Kateqoriyanı silmək üçün funksiya
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    // Əslində silmək yerinə arxivləşdiririk
    const { error } = await supabase
      .from('categories')
      .update({ archived: true, status: 'inactive' })
      .eq('id', id);

    if (error) {
      console.error('Kateqoriya silinərkən xəta:', error);
      throw error;
    }
  } catch (error) {
    console.error('Kateqoriya silinərkən xəta:', error);
    throw error;
  }
};

// Kateqoriya statusunu yeniləmək üçün funksiya
export const updateCategoryStatus = async (id: string, status: 'active' | 'inactive'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Kateqoriya statusu yeniləndikdə xəta:', error);
      throw error;
    }
  } catch (error) {
    console.error('Kateqoriya statusu yeniləndikdə xəta:', error);
    throw error;
  }
};
