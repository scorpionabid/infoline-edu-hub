
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: number;
  deadline?: string;
  assignment: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  status?: string;
  priority?: number;
  deadline?: string;
  assignment?: string;
  order_index: number;
}

export const categoryApi = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createCategory(categoryData: CreateCategoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<CreateCategoryData>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async bulkCreateCategories(categories: CreateCategoryData[]) {
    const { data, error } = await supabase
      .from('categories')
      .insert(categories)
      .select();
    
    if (error) throw error;
    return data;
  }
};
