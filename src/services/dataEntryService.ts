
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { Column } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';
import { CategoryWithColumns } from '@/types/dashboard';
import { mapDbColumnToAppColumn } from '@/utils/typeMappings';

/**
 * Məktəb üçün kategoriyaları və sütunları əldə etmək
 * @param schoolId Məktəb ID
 */
export const fetchCategoriesAndColumns = async (schoolId: string): Promise<CategoryWithColumns[]> => {
  try {
    console.log('Fetching categories and columns for school ID:', schoolId);
    
    // Kateqoriyaları əldə et
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true });

    if (categoriesError) throw categoriesError;
    
    if (!categories || categories.length === 0) {
      console.log('No categories found');
      return [];
    }
    
    console.log(`Found ${categories.length} categories`);
    
    // Hər kateqoriya üçün sütunları əldə et
    const categoriesWithColumns: CategoryWithColumns[] = await Promise.all(categories.map(async (category) => {
      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', category.id)
        .eq('status', 'active')
        .order('order_index', { ascending: true });
      
      if (columnsError) throw columnsError;
      
      const mappedColumns = columns ? columns.map(mapDbColumnToAppColumn) : [];
      
      return {
        ...category,
        columns: mappedColumns
      } as CategoryWithColumns;
    }));
    
    return categoriesWithColumns;
  } catch (error) {
    console.error('Kateqoriyaları və sütunları əldə edərkən xəta:', error);
    return [];
  }
};

/**
 * Məktəb üçün mövcud məlumatları əldə etmək
 * @param schoolId Məktəb ID
 * @param categoryId Kateqoriya ID
 */
export const fetchExistingData = async (schoolId: string, categoryId: string): Promise<DataEntry[]> => {
  try {
    console.log(`Fetching existing data for school ID: ${schoolId}, category ID: ${categoryId}`);
    
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId)
      .eq('category_id', categoryId);
    
    if (error) throw error;
    
    console.log(`Found ${data?.length || 0} data entries`);
    
    return data || [];
  } catch (error) {
    console.error('Mövcud məlumatları əldə edərkən xəta:', error);
    return [];
  }
};

/**
 * Məlumatları yaddaşa yazır
 * @param entry Yazılacaq məlumat
 */
export const saveDataEntry = async (entry: DataEntry): Promise<DataEntry | null> => {
  try {
    console.log('Saving data entry:', entry);
    
    // Mövcud məlumatı yoxla
    const { data: existingData, error: existingError } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', entry.school_id)
      .eq('category_id', entry.category_id)
      .eq('column_id', entry.column_id)
      .maybeSingle();
    
    if (existingError) throw existingError;
    
    let result;
    
    if (existingData) {
      // Mövcud məlumatı yenilə
      console.log('Updating existing data entry');
      const { data, error } = await supabase
        .from('data_entries')
        .update({
          value: entry.value,
          updated_at: new Date().toISOString(),
          status: 'pending'
        })
        .eq('id', existingData.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Yeni məlumat yarat
      console.log('Creating new data entry');
      const { data, error } = await supabase
        .from('data_entries')
        .insert([entry])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    return result;
  } catch (error) {
    console.error('Məlumatları saxlayarkən xəta:', error);
    return null;
  }
};

/**
 * Kateqoriya üçün bütün məlumatları göndərmək (təsdiqlənmək üçün)
 * @param schoolId Məktəb ID
 * @param categoryId Kateqoriya ID
 */
export const submitCategoryData = async (schoolId: string, categoryId: string): Promise<boolean> => {
  try {
    console.log(`Submitting data for school ID: ${schoolId}, category ID: ${categoryId}`);
    
    // Burada, əlavə məntiqi əlavə edə bilərik, məsələn bildiriş yaratmaq
    // Bildiriş yaratdıq - sektoradmin üçün
    
    // Bildiriş yaratmağa cəhd et (əgər, xəta olsa iki hissəyə bölünəcək)
    try {
      const { data: sectorData, error: sectorError } = await supabase
        .from('schools')
        .select('sector_id')
        .eq('id', schoolId)
        .single();
      
      if (sectorError) throw sectorError;
      
      if (sectorData.sector_id) {
        const { data: adminData, error: adminError } = await supabase
          .rpc('get_sector_admin_id', { sector_id_param: sectorData.sector_id });
        
        if (adminError) throw adminError;
        
        if (adminData) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('name')
            .eq('id', categoryId)
            .single();
          
          if (categoryError) throw categoryError;
          
          // İndi bildiriş yaradırıq
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert([{
              user_id: adminData,
              type: 'info',
              title: 'Yeni məlumat təqdim edildi',
              message: `${categoryData.name} kateqoriyası üzrə məlumatlar təsdiqlənmək üçün göndərildi`,
              is_read: false,
              priority: 'normal',
              related_entity_type: 'category',
              related_entity_id: categoryId
            }]);
          
          if (notificationError) throw notificationError;
        }
      }
    } catch (notificationError) {
      console.warn('Bildiriş yaradılarkən xəta (kritik deyil):', notificationError);
      // Bildiriş yaratma xətası kritik deyil, davam edirik
    }
    
    // Məlumatların statusunu yenilə
    const { error } = await supabase
      .from('data_entries')
      .update({
        status: 'pending'
      })
      .eq('school_id', schoolId)
      .eq('category_id', categoryId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Məlumatları göndərərkən xəta:', error);
    return false;
  }
};
