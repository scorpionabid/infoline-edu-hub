import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';

export const adaptSupabaseCategory = (data: any): Category => {
  return {
    id: data.id,
    name: data.name,
    status: data.status,
    assignment: data.assignment,
    description: data.description,
    priority: data.priority,
    deadline: data.deadline,
    archived: data.archived,
    created_at: data.created_at,
    updated_at: data.updated_at,
    column_count: data.column_count
  };
};

export const adaptCategoryToSupabase = (category: Partial<Category> & { name: string }): any => {
  return {
    name: category.name,
    status: category.status,
    assignment: category.assignment,
    description: category.description,
    priority: category.priority,
    deadline: category.deadline,
    archived: category.archived,
    column_count: category.column_count
  };
};

// Bütün kateqoriyaları əldə etmək üçün API funksiyası
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('archived', false)
      .order('priority', { ascending: true });
      
    if (error) {
      console.error('Kateqoriyaları əldə edərkən xəta:', error);
      throw error;
    }
    
    // Supabase datalarını uyğunlaşdıraq
    return data?.length > 0 
      ? data.map(adaptSupabaseCategory)
      : [];
  } catch (error) {
    console.error('Kateqoriyaları əldə edərkən xəta:', error);
    throw error;
  }
};

// Kateqoriya əlavə etmək və ya yeniləmək üçün funksiya
export const addCategory = async (categoryData: Partial<Category> & { name: string }): Promise<Category> => {
  try {
    const now = new Date().toISOString();
    
    // Type compatibility üçün id öncədən təyin edək
    const categoryWithId: Category = {
      id: categoryData.id || '',
      name: categoryData.name,
      description: categoryData.description || '',
      assignment: categoryData.assignment || 'all',
      status: categoryData.status || 'active',
      deadline: categoryData.deadline,
      priority: categoryData.priority || 0,
      column_count: categoryData.column_count || 0,
      created_at: categoryData.created_at || now,
      updated_at: now,
      archived: false
    };
    
    const supabaseData = adaptCategoryToSupabase(categoryWithId);
    
    // Yeni kateqoriya yaratma və ya mövcud olanı yeniləmə
    if (categoryData.id) {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...supabaseData,
          updated_at: now
        })
        .eq('id', categoryData.id)
        .select()
        .single();

      if (error) {
        console.error('Kateqoriya yeniləmə zamanı xəta:', error);
        throw error;
      }

      return adaptSupabaseCategory(data);
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...supabaseData,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) {
        console.error('Kateqoriya əlavə etmə zamanı xəta:', error);
        throw error;
      }

      return adaptSupabaseCategory(data);
    }
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
      .update({ 
        archived: true, 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
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
export const updateCategoryStatus = async (id: string, status: 'active' | 'inactive' | 'draft'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
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
