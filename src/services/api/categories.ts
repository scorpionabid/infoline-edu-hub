
import { supabase } from '@/lib/supabase';
import { Category, CategoryAssignment } from '@/types/category';

export const categoriesApi = {
  async fetchCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      assignment: item.assignment as CategoryAssignment,
      status: item.status as 'active' | 'inactive' | 'archived'
    }));
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        order_index: category.order_index,
        assignment: category.assignment,
        description: category.description || null,
        deadline: category.deadline || null,
        status: category.status || 'active',
        archived: category.archived || false,
        priority: category.priority || 1,
        column_count: category.column_count || 0
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      assignment: data.assignment as CategoryAssignment,
      status: data.status as 'active' | 'inactive' | 'archived'
    };
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      assignment: data.assignment as CategoryAssignment,
      status: data.status as 'active' | 'inactive' | 'archived'
    };
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async archiveCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({ archived: true, status: 'archived' })
      .eq('id', id);

    if (error) throw error;
  }
};
