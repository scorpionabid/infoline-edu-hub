import { Category } from '@/types/category';

interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  assignment: 'sectors' | 'all';
  status: 'active' | 'inactive';
  deadline: string | null;
  created_at: string;
  updated_at: string;
  archived: boolean;
  priority: number;
}

export const transformCategory = (response: CategoryResponse): Category => ({
  ...response,
  deadline: response.deadline ? new Date(response.deadline) : undefined,
  created_at: new Date(response.created_at),
  updated_at: new Date(response.updated_at)
});

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
    
    return data?.length > 0 
      ? data.map(adaptSupabaseCategory)
      : [];
  } catch (error) {
    console.error('Kateqoriyaları əldə edərkən xəta:', error);
    throw error;
  }
};

export const addCategory = async (categoryData: Partial<Category> & { name: string }): Promise<Category> => {
  try {
    const now = new Date().toISOString();
    
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

export const deleteCategory = async (id: string): Promise<void> => {
  try {
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
