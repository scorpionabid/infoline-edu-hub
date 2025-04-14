
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
import { EntryValue, CategoryEntryData, DataEntryForm, ValidationRules } from '@/types/dataEntry';
import { mapDbColumnToAppColumn } from '@/utils/typeMappings';
import { toast } from 'sonner';

/**
 * Kateqoriyaları sütunları ilə birlikdə əldə edir
 */
export const fetchCategoriesWithColumns = async (): Promise<CategoryWithColumns[]> => {
  try {
    // 1. Əvvəlcə bütün kateqoriyaları əldə edirik
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true });

    if (categoriesError) throw categoriesError;
    if (!categories || categories.length === 0) return [];

    // 2. Bütün sütunları bir sorğu ilə əldə edirik və keşləyirik
    const { data: allColumns, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .eq('status', 'active')
      .order('order_index', { ascending: true });

    if (columnsError) throw columnsError;
    if (!allColumns) return [];

    // 3. Hər kateqoriya üçün, uyğun sütunları filtirləyib əlavə edirik
    const categoriesWithColumns: CategoryWithColumns[] = categories.map(category => {
      const categoryColumns = allColumns
        .filter(column => column.category_id === category.id)
        .map(column => mapDbColumnToAppColumn(column));

      return {
        id: category.id,
        name: category.name,
        description: category.description || '',
        status: category.status || 'active',
        deadline: category.deadline ? new Date(category.deadline).toISOString() : undefined,
        priority: category.priority || 0,
        assignment: category.assignment || 'all',
        columns: categoryColumns
      };
    });

    return categoriesWithColumns;
  } catch (error) {
    console.error('Kateqoriyaları və sütunları əldə edərkən xəta:', error);
    return [];
  }
};

/**
 * Məktəb üçün mövcud məlumatları əldə edir
 * @param schoolId Məktəb ID
 */
export const fetchSchoolDataEntries = async (schoolId: string): Promise<Record<string, Record<string, any>>> => {
  try {
    if (!schoolId) throw new Error('Məktəb ID tələb olunur');

    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId);

    if (error) throw error;
    if (!data || data.length === 0) return {};

    // Məlumatları kateqoriya və sütun ID-lərinə görə qruplaşdırırıq
    const entriesByCategoryAndColumn: Record<string, Record<string, any>> = {};
    
    data.forEach(entry => {
      const { category_id, column_id, value, status, rejection_reason } = entry;
      
      if (!entriesByCategoryAndColumn[category_id]) {
        entriesByCategoryAndColumn[category_id] = {};
      }
      
      entriesByCategoryAndColumn[category_id][column_id] = {
        value,
        status,
        errorMessage: status === 'rejected' ? rejection_reason : undefined
      };
    });

    return entriesByCategoryAndColumn;
  } catch (error) {
    console.error('Məktəb məlumatlarını əldə edərkən xəta:', error);
    return {};
  }
};

/**
 * Məlumat dəyərini saxlayır
 * @param schoolId Məktəb ID
 * @param categoryId Kateqoriya ID
 * @param columnId Sütun ID
 * @param value Dəyər
 */
export const saveDataEntryValue = async (
  schoolId: string,
  categoryId: string,
  columnId: string,
  value: any,
  userId: string
): Promise<{ success: boolean; message: string; status?: string }> => {
  try {
    if (!schoolId || !categoryId || !columnId) {
      return { success: false, message: 'Məlumat saxlamaq üçün tələb olunan parametrlər çatışmır' };
    }

    // Mövcud girişi yoxlayırıq
    const { data: existingEntry, error: fetchError } = await supabase
      .from('data_entries')
      .select('id, status')
      .eq('school_id', schoolId)
      .eq('category_id', categoryId)
      .eq('column_id', columnId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let result;

    if (existingEntry) {
      // Əgər məlumat təsdiqlənibsə, redaktə etmək olmaz
      if (existingEntry.status === 'approved') {
        return {
          success: false,
          message: 'Təsdiqlənmiş məlumatı redaktə etmək mümkün deyil',
          status: 'approved'
        };
      }

      // Mövcud məlumatı yeniləyirik
      const { data, error: updateError } = await supabase
        .from('data_entries')
        .update({
          value,
          status: 'pending', // Status yenilənir
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id)
        .select()
        .single();

      if (updateError) throw updateError;
      result = data;
    } else {
      // Yeni məlumat əlavə edirik
      const { data, error: insertError } = await supabase
        .from('data_entries')
        .insert({
          school_id: schoolId,
          category_id: categoryId,
          column_id: columnId,
          value,
          status: 'pending',
          created_by: userId
        })
        .select()
        .single();

      if (insertError) throw insertError;
      result = data;
    }

    return {
      success: true,
      message: 'Məlumat uğurla saxlanıldı',
      status: result.status
    };
  } catch (error: any) {
    console.error('Məlumat saxlanılarkən xəta:', error);
    return {
      success: false,
      message: `Xəta: ${error.message || 'Naməlum xəta'}`,
      status: 'error'
    };
  }
};

/**
 * Kateqoriya məlumatlarını təsdiq üçün göndərir
 * @param categoryId Kateqoriya ID
 * @param schoolId Məktəb ID
 */
export const submitCategoryForApproval = async (
  categoryId: string,
  schoolId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!categoryId || !schoolId) {
      return { success: false, message: 'Kateqoriya ID və Məktəb ID tələb olunur' };
    }

    // Kateqoriya üçün məlumatları əldə edirik
    const { data: entries, error: entriesError } = await supabase
      .from('data_entries')
      .select('*')
      .eq('category_id', categoryId)
      .eq('school_id', schoolId);

    if (entriesError) throw entriesError;
    
    if (!entries || entries.length === 0) {
      return { success: false, message: 'Bu kateqoriya üçün məlumat tapılmadı' };
    }
    
    // Bütün məlumatları 'pending' statusuna yeniləyirik
    const { error: updateError } = await supabase
      .from('data_entries')
      .update({ status: 'pending' })
      .eq('category_id', categoryId)
      .eq('school_id', schoolId);
      
    if (updateError) throw updateError;
    
    // Sektor admin üçün bildiriş yaradırıq
    // Bu hissə gələcəkdə bildiriş sistemi ilə inteqrasiya edilə bilər
    
    return { success: true, message: 'Məlumatlar təsdiq üçün uğurla göndərildi' };
  } catch (error: any) {
    console.error('Təsdiq üçün göndərilmə xətası:', error);
    return { success: false, message: error.message || 'Naməlum xəta' };
  }
};

/**
 * Kateqoriya tamamlanma faizini hesablayır
 * @param categoryId Kateqoriya ID
 * @param schoolId Məktəb ID
 */
export const calculateCategoryCompletionRate = async (
  categoryId: string,
  schoolId: string
): Promise<number> => {
  try {
    // Kateqoriya sütunlarını əldə edirik
    const { data: columns, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', 'active');

    if (columnsError) throw columnsError;
    if (!columns || columns.length === 0) return 0;

    // Məcburi sütunları sayırıq
    const requiredColumns = columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 100; // Məcburi sütun yoxdursa, 100% tamamlanmış sayılır

    // Məktəb məlumatlarını əldə edirik
    const { data: entries, error: entriesError } = await supabase
      .from('data_entries')
      .select('*')
      .eq('category_id', categoryId)
      .eq('school_id', schoolId);

    if (entriesError) throw entriesError;
    if (!entries || entries.length === 0) return 0;

    // Doldurulmuş məcburi sütunları sayırıq
    let filledRequiredCount = 0;
    requiredColumns.forEach(column => {
      const entry = entries.find(e => e.column_id === column.id);
      if (entry && entry.value && String(entry.value).trim() !== '') {
        filledRequiredCount++;
      }
    });

    // Tamamlanma faizini hesablayırıq
    return Math.round((filledRequiredCount / requiredColumns.length) * 100);
  } catch (error) {
    console.error('Tamamlanma faizi hesablanarkən xəta:', error);
    return 0;
  }
};

/**
 * Excel import/export üçün məlumat strukturunu hazırlayır
 * @param categoryId Kateqoriya ID
 */
export const prepareExcelTemplate = async (categoryId: string): Promise<{ headers: string[]; template: any[] }> => {
  try {
    // Kateqoriya sütunlarını əldə edirik
    const { data: columns, error } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('order_index', { ascending: true });

    if (error) throw error;
    if (!columns || columns.length === 0) return { headers: [], template: [] };

    // Excel başlıqlarını hazırlayırıq
    const headers = columns.map(col => col.name);
    const columnIds = columns.map(col => col.id);

    // Boş şablon sətri yaradırıq
    const templateRow: any = {};
    columnIds.forEach((id, index) => {
      templateRow[headers[index]] = '';
    });

    return {
      headers,
      template: [templateRow]
    };
  } catch (error) {
    console.error('Excel şablonu hazırlanarkən xəta:', error);
    return { headers: [], template: [] };
  }
};
