import { supabase } from '@/lib/supabase';
import { Category, CategoryWithColumns } from '@/types/category';
import { parseJsonSafe } from '@/utils/json-utils';

/**
 * Kateqoriyaları əldə etmək üçün sorğu parametrləri
 */
export interface FetchCategoriesOptions {
  status?: string;
  search?: string;
  schoolId?: string;
  assignment?: string;
}

/**
 * Kateqoriyaları əldə etmək üçün mərkəzi servis funksiyası
 * Bu funksiya kateqoriyaları əldə etmək üçün bütün hook-lar tərəfindən istifadə edilə bilər
 * 
 * @param options Sorğu parametrləri
 * @returns Kateqoriyalar massivi
 */
export async function fetchCategories(options?: FetchCategoriesOptions): Promise<Category[]> {
  try {
    console.log('Fetching categories with options:', options);
    let query = supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    // Status filterini tətbiq edirik
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    // Axtarış filterini tətbiq edirik
    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }
    
    // Assignment filterini tətbiq edirik
    if (options?.assignment) {
      query = query.eq('assignment', options.assignment);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    // Xüsusi çeşidləmə və ya başqa əməliyyatlar burada əlavə edilə bilər
    return data as Category[];
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    throw error;
  }
}

/**
 * Bir kateqoriyanı və onun sütunlarını əldə etmək üçün mərkəzi servis funksiyası
 * 
 * @param categoryId Kateqoriya ID-si
 * @returns Kateqoriya və onun sütunlarını əhatə edən obyekt
 */
export async function fetchCategoryWithColumns(categoryId: string): Promise<CategoryWithColumns> {
  try {
    if (!categoryId) {
      throw new Error('Kateqoriya ID-si təqdim edilməyib');
    }

    // 1. Kateqoriya məlumatlarını əldə edirik
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      console.error('Error fetching category:', categoryError);
      throw categoryError;
    }

    if (!category) {
      throw new Error('Kateqoriya tapılmadı');
    }

    // 2. Bu kateqoriya üçün sütunları əldə edirik
    const { data: columnsData, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: true });
    
    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
      throw columnsError;
    }
    
    // Sütunların JSON sahələrini parse edirik
    const columns = (columnsData || []).map((column: any) => {
      // Options sahəsini parse edirik
      const options = parseJsonSafe(
        typeof column.options === 'string' ? column.options : JSON.stringify(column.options),
        []
      );
      
      // Validation sahəsini parse edirik
      const validation = parseJsonSafe(
        typeof column.validation === 'string' ? column.validation : JSON.stringify(column.validation),
        {}
      );
      
      // Sütun obyektini qaytarırıq
      return {
        ...column,
        options,
        validation,
        // Əlavə sahələr üçün default dəyərlər təmin edirik
        is_required: column.is_required ?? false,
        description: column.description || '',
        section: column.section || '',
        color: column.color || ''
      };
    });

    // Kateqoriya və sütunlarını birləşdiririk
    return {
      ...category,
      columns,
      column_count: columns.length
    } as CategoryWithColumns;
  } catch (error) {
    console.error('Error in fetchCategoryWithColumns:', error);
    throw error;
  }
}

/**
 * Kateqoriya yaratmaq üçün mərkəzi servis funksiyası
 * 
 * @param category Yaradılacaq kateqoriya məlumatları
 * @returns Yaradılan kateqoriya
 */
export async function createCategory(category: Partial<Category>): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data as Category;
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
}

/**
 * Kateqoriya yeniləmək üçün mərkəzi servis funksiyası
 * 
 * @param id Yenilənəcək kateqoriyanın ID-si
 * @param category Yenilənəcək kateqoriya məlumatları
 * @returns Yenilənmiş kateqoriya
 */
export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data as Category;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
}

/**
 * Kateqoriya silmək üçün mərkəzi servis funksiyası
 * 
 * @param id Silinəcək kateqoriyanın ID-si
 * @returns Silmə əməliyyatının nəticəsi
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
}
