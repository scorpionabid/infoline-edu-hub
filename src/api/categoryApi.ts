import { supabase } from '@/lib/supabase';
import { Category } from '@/types/category';

// Function to fetch all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    // Adapt each category
    const adaptedData = data ? data.map(adaptCategory) : [];
    return adaptedData as Category[];
  } catch (error: any) {
    console.error("Unexpected error fetching categories:", error.message);
    throw error;
  }
};

// Function to fetch a single category by ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching category by ID:", error);
      return null;
    }

     // Adapt the category
     const adaptedData = data ? adaptCategory(data) : null;
     return adaptedData as Category | null;
  } catch (error: any) {
    console.error("Unexpected error fetching category by ID:", error.message);
    return null;
  }
};

// Function to create a new category
export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return null;
    }

    // Adapt the category
    const adaptedData = data ? adaptCategory(data) : null;
    return adaptedData as Category | null;
  } catch (error: any) {
    console.error("Unexpected error creating category:", error.message);
    return null;
  }
};

// Function to update an existing category
export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return null;
    }

    // Adapt the category
    const adaptedData = data ? adaptCategory(data) : null;
    return adaptedData as Category | null;
  } catch (error: any) {
    console.error("Unexpected error updating category:", error.message);
    return null;
  }
};

// Function to delete a category
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("Unexpected error deleting category:", error.message);
    return false;
  }
};

// Handle null deadline safely
const adaptCategory = (category: any): Category => {
  return {
    ...category,
    deadline: category.deadline ? new Date(category.deadline).toISOString() : undefined,
    // Add any other necessary adaptations
  };
};
