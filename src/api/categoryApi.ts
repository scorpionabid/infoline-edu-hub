
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
    // Ensure order_index is provided
    const dataWithOrder = {
      ...categoryData,
      order_index: categoryData.order_index ?? 0
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert([dataWithOrder])
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
    // Ensure all categories have order_index
    const categoriesWithOrder = categories.map((cat, index) => ({
      ...cat,
      order_index: cat.order_index ?? index
    }));
    
    const { data, error } = await supabase
      .from('categories')
      .insert(categoriesWithOrder)
      .select();
    
    if (error) throw error;
    return data;
  }
};
