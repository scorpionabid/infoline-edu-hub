
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'schools' | 'regions' | 'sectors';
  status: 'pending' | 'approved' | 'archived' | 'active' | 'inactive' | 'draft';
  deadline?: string;
  priority?: number;
  archived: boolean;
  column_count: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  
  return (data || []).map(item => ({
    ...item,
    assignment: item.assignment as 'all' | 'schools' | 'regions' | 'sectors'
  })) as Category[];
};

export const createCategory = async (categoryData: {
  name: string;
  description: string;
  assignment: 'all' | 'schools' | 'regions' | 'sectors';
  deadline: string;
  priority: number;
  status: 'pending' | 'approved' | 'archived' | 'active' | 'inactive' | 'draft';
  archived: boolean;
  column_count: number;
}): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{
      ...categoryData,
      order_index: 0
    }])
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    assignment: data.assignment as 'all' | 'schools' | 'regions' | 'sectors'
  } as Category;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    assignment: data.assignment as 'all' | 'schools' | 'regions' | 'sectors'
  } as Category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return {
    ...data,
    assignment: data.assignment as 'all' | 'schools' | 'regions' | 'sectors'
  } as Category;
};

export const reorderCategories = async (categories: Category[]): Promise<void> => {
  const updates = categories.map((category, index) => ({
    id: category.id,
    order_index: index
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('categories')
      .update({ order_index: update.order_index })
      .eq('id', update.id);

    if (error) throw error;
  }
};
