
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';

export interface CreateCategoryParams {
  name: string;
  description?: string;
  status?: string;
  priority?: number;
  deadline?: string;
  assignment?: string;
}

export interface UpdateCategoryParams {
  name?: string;
  description?: string;
  status?: string;
  priority?: number;
  deadline?: string | null;
  assignment?: string;
}

export const fetchCategories = async (filters?: {
  status?: string | string[];
  search?: string;
}) => {
  try {
    let query = supabase.from('categories').select('*');

    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as Category[], error: null };
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return { data: [], error };
  }
};

export const createCategory = async (category: CreateCategoryParams) => {
  try {
    const { data, error } = await supabase.from('categories').insert([{
      name: category.name,
      description: category.description,
      status: category.status || 'active',
      priority: category.priority,
      deadline: category.deadline,
      assignment: category.assignment || 'all',
    }]).select();

    if (error) throw error;
    return { data: data[0] as Category, error: null };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { data: null, error };
  }
};

export const updateCategory = async (id: string, category: UpdateCategoryParams) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        description: category.description,
        status: category.status,
        priority: category.priority,
        deadline: category.deadline,
        assignment: category.assignment
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0] as Category, error: null };
  } catch (error: any) {
    console.error('Error updating category:', error);
    return { data: null, error };
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return { error };
  }
};

export const getCategoryById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: data as Category, error: null };
  } catch (error: any) {
    console.error('Error getting category:', error);
    return { data: null, error };
  }
};
