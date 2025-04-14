
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
import { DataEntryForm, EntryValue } from '@/types/dataEntry';
import { toast } from 'sonner';
import { mapDbColumnToAppColumn } from '@/utils/typeMappings';

/**
 * Bütün kateqoriya və sütunları əldə edir
 */
export const fetchCategoriesWithColumns = async (): Promise<CategoryWithColumns[]> => {
  try {
    // Kateqoriyaları əldə et
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .order('priority', { ascending: true })
      .eq('status', 'active');
    
    if (categoryError) throw categoryError;
    
    if (!categories || categories.length === 0) {
      return [];
    }
    
    // Hər bir kateqoriya üçün sütunları əldə et
    const categoriesWithColumns = await Promise.all(
      categories.map(async (category) => {
        const { data: columnsData, error: columnsError } = await supabase
          .from('columns')
          .select('*')
          .eq('category_id', category.id)
          .eq('status', 'active')
          .order('order_index', { ascending: true });
        
        if (columnsError) throw columnsError;
        
        // Sütunları uyğun tipə çeviririk
        const columns = (columnsData || []).map(mapDbColumnToAppColumn);
        
        return {
          id: category.id,
          name: category.name,
          description: category.description || '',
          assignment: category.assignment as 'all' | 'sectors',
          deadline: category.deadline,
          status: category.status,
          priority: category.priority || 0,
          created_at: category.created_at,
          updated_at: category.updated_at,
          archived: category.archived || false,
          column_count: columns.length,
          columns
        };
      })
    );
    
    return categoriesWithColumns;
  } catch (error) {
    console.error('Kateqoriya və sütunları əldə edərkən xəta:', error);
    throw error;
  }
};

/**
 * Məktəb məlumatlarını kateqoriya və sütunlar üzrə əldə edir
 */
export const fetchSchoolDataEntries = async (schoolId: string): Promise<Record<string, Record<string, any>>> => {
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId);
    
    if (error) throw error;
    
    // Məlumatları category_id və column_id üzrə qruplaşdırırıq
    const entriesByCategoryAndColumn: Record<string, Record<string, any>> = {};
    
    data?.forEach((entry) => {
      if (!entriesByCategoryAndColumn[entry.category_id]) {
        entriesByCategoryAndColumn[entry.category_id] = {};
      }
      
      entriesByCategoryAndColumn[entry.category_id][entry.column_id] = entry;
    });
    
    return entriesByCategoryAndColumn;
  } catch (error) {
    console.error('Məktəb məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
};

/**
 * Məlumat daxil etməni saxlayır və ya yeniləyir
 */
export const saveDataEntryValue = async (
  schoolId: string,
  categoryId: string,
  columnId: string,
  value: any,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Mövcud məlumatı yoxla
    const { data: existingData, error: fetchError } = await supabase
      .from('data_entries')
      .select('id, status')
      .eq('school_id', schoolId)
      .eq('category_id', categoryId)
      .eq('column_id', columnId)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    if (existingData) {
      // Əgər məlumat təsdiqlənibsə, yeniləmək olmaz
      if (existingData.status === 'approved') {
        return {
          success: false,
          message: 'Təsdiqlənmiş məlumatları dəyişmək olmaz'
        };
      }
      
      // Mövcud məlumatı yenilə
      const { error: updateError } = await supabase
        .from('data_entries')
        .update({
          value,
          updated_at: new Date().toISOString(),
          status: 'pending'
        })
        .eq('id', existingData.id);
      
      if (updateError) throw updateError;
      
      return {
        success: true,
        message: 'Məlumat uğurla yeniləndi'
      };
    } else {
      // Yeni məlumat əlavə et
      const { error: insertError } = await supabase
        .from('data_entries')
        .insert({
          school_id: schoolId,
          category_id: categoryId,
          column_id: columnId,
          value,
          status: 'pending',
          created_by: userId
        });
      
      if (insertError) throw insertError;
      
      return {
        success: true,
        message: 'Məlumat uğurla əlavə edildi'
      };
    }
  } catch (error: any) {
    console.error('Məlumatı saxlayarkən xəta:', error);
    return {
      success: false,
      message: error.message || 'Məlumatı saxlayarkən xəta baş verdi'
    };
  }
};

/**
 * Bütün kateqoriya məlumatlarını toplu şəkildə saxlayır
 */
export const saveAllCategoryData = async (
  schoolId: string,
  categoryId: string,
  values: Record<string, any>,
  userId: string
): Promise<{ success: boolean; message: string; savedCount: number }> => {
  try {
    const savePromises = Object.entries(values).map(([columnId, value]) => {
      return saveDataEntryValue(schoolId, categoryId, columnId, value, userId);
    });
    
    const results = await Promise.all(savePromises);
    const failedSaves = results.filter(r => !r.success);
    
    if (failedSaves.length > 0) {
      return {
        success: false,
        message: `${failedSaves.length} məlumat saxlanıla bilmədi`,
        savedCount: results.length - failedSaves.length
      };
    }
    
    return {
      success: true,
      message: `${results.length} məlumat uğurla saxlanıldı`,
      savedCount: results.length
    };
  } catch (error: any) {
    console.error('Məlumatları toplu şəkildə saxlayarkən xəta:', error);
    return {
      success: false,
      message: error.message || 'Məlumatları saxlayarkən xəta baş verdi',
      savedCount: 0
    };
  }
};

/**
 * Kateqoriya məlumatlarını təsdiq üçün göndərir
 */
export const submitCategoryForApproval = async (categoryId: string, schoolId: string, userId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Bütün məlumatları 'pending' statusuna yenilə
    const { error } = await supabase
      .from('data_entries')
      .update({ 
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('category_id', categoryId)
      .eq('school_id', schoolId);
    
    if (error) throw error;
    
    // Bildiriş yarat
    await createDataSubmissionNotification(categoryId, schoolId, userId);
    
    return { 
      success: true, 
      message: 'Məlumatlar təsdiq üçün uğurla göndərildi'
    };
  } catch (error: any) {
    console.error('Təsdiq üçün göndərilmə xətası:', error);
    return { 
      success: false, 
      message: error.message || 'Məlumatları təsdiq üçün göndərərkən xəta baş verdi'
    };
  }
};

/**
 * Bildiriş yaratmaq üçün köməkçi funksiya
 */
const createDataSubmissionNotification = async (categoryId: string, schoolId: string, submittedByUserId: string) => {
  try {
    // Məktəb məlumatlarını əldə et
    const { data: schoolData } = await supabase
      .from('schools')
      .select('name, sector_id')
      .eq('id', schoolId)
      .single();
    
    if (!schoolData) return;
    
    // Kateqoriya məlumatlarını əldə et
    const { data: categoryData } = await supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .single();
    
    if (!categoryData) return;
    
    // Sektor admin ID-sini əldə et
    const { data: sectorAdmin } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('sector_id', schoolData.sector_id)
      .eq('role', 'sectoradmin')
      .single();
    
    if (!sectorAdmin) return;
    
    // Bildiriş yarat
    await supabase
      .from('notifications')
      .insert({
        user_id: sectorAdmin.user_id,
        type: 'data_submission',
        title: 'Yeni məlumat təsdiqi',
        message: `${schoolData.name} məktəbi "${categoryData.name}" kateqoriyasında məlumatları təsdiq üçün göndərdi`,
        related_entity_type: 'category',
        related_entity_id: categoryId,
        priority: 'high'
      });
  } catch (error) {
    console.error('Bildiriş yaradılma xətası:', error);
  }
};

/**
 * Excel şablonu yaratmaq üçün məlumatları hazırlayır
 */
export const prepareExcelTemplateData = (category: CategoryWithColumns) => {
  return {
    categoryName: category.name,
    headers: ['ID', 'Column Name', 'Type', 'Required', 'Value'],
    rows: category.columns.map(column => [
      column.id,
      column.name,
      column.type,
      column.is_required ? 'Yes' : 'No',
      ''
    ])
  };
};
