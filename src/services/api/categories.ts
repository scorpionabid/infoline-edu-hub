
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(category => ({
      ...category,
      assignment: category.assignment || 'all',
      archived: category.archived || false,
      column_count: category.column_count || 0,
      priority: category.priority || 0,
      status: category.status || 'active'
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryData.name,
        description: categoryData.description,
        assignment: categoryData.assignment || 'all',
        deadline: categoryData.deadline,
        priority: categoryData.priority || 0,
        status: categoryData.status || 'active',
        archived: categoryData.archived || false,
        column_count: categoryData.column_count || 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...categoryData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const bulkUpdateCategories = async (categories: Category[]): Promise<Category[]> => {
  try {
    // Prepare categories for database insert with required fields
    const categoriesToUpdate = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      assignment: category.assignment || 'all',
      deadline: category.deadline,
      priority: category.priority || 0,
      status: category.status || 'active',
      archived: category.archived || false,
      column_count: category.column_count || 0,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('categories')
      .upsert(categoriesToUpdate)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error bulk updating categories:', error);
    throw error;
  }
};
