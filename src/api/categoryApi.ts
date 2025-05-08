
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryStatus, CategoryAssignment } from '@/types/column';

// Bütün kateqoriyaları əldə et
export const fetchAllCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('archived', false)
    .order('priority', { ascending: false });

  if (error) {
    throw new Error(`Kateqoriyaları əldə edərkən xəta: ${error.message}`);
  }

  return data as Category[];
};

// Kateqoriya əlavə et
export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const now = new Date().toISOString();
  
  // Convert deadline to string if it's a Date object
  let deadlineStr: string | undefined = undefined;
  if (category.deadline) {
    deadlineStr = category.deadline instanceof Date 
      ? category.deadline.toISOString() 
      : category.deadline;
  }
  
  const newCategory = {
    name: category.name,
    description: category.description || '',
    assignment: category.assignment || 'all',
    status: category.status || 'active',
    deadline: deadlineStr,
    priority: category.priority || 0,
    created_at: now,
    updated_at: now,
    archived: false
  };

  const { data, error } = await supabase
    .from('categories')
    .insert(newCategory)
    .select()
    .single();

  if (error) {
    throw new Error(`Kateqoriya yaradılarkən xəta: ${error.message}`);
  }

  return data as Category;
};

// Kateqoriya yenilə
export const updateCategory = async (category: Partial<Category> & { id: string }): Promise<Category> => {
  // Convert deadline to string if it's a Date object
  let deadlineStr: string | undefined = undefined;
  if (category.deadline) {
    deadlineStr = category.deadline instanceof Date 
      ? category.deadline.toISOString() 
      : category.deadline;
  }
  
  const updatedData = {
    ...category,
    deadline: deadlineStr,
    updated_at: new Date().toISOString()
  };
  
  // Remove fields that shouldn't be sent to Supabase
  delete updatedData.completionRate;
  
  const { data, error } = await supabase
    .from('categories')
    .update(updatedData)
    .eq('id', category.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Kateqoriya yenilənərkən xəta: ${error.message}`);
  }

  return data as Category;
};

// Kateqoriya sil (arxivləşdir)
export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .update({ archived: true, status: 'inactive', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Kateqoriya silinərkən xəta: ${error.message}`);
  }
};

// Kateqoriyanın statusunu dəyişdir
export const updateCategoryStatus = async (id: string, status: string): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Kateqoriya statusu yenilənərkən xəta: ${error.message}`);
  }

  return data as Category;
};
