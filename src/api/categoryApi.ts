
import { supabase } from '@/integrations/supabase/client';
import { Category, adaptSupabaseCategory } from '@/types/category';

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
