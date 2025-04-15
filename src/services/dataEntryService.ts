
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, Column } from '@/types/column';
import { DataEntryData } from '@/types/dataEntry';

export const getDataEntries = async (schoolId: string): Promise<DataEntryData[]> => {
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      console.error('Data entries fetch error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get data entries:', error);
    return [];
  }
};

export const getCategoryDataEntries = async (
  categoryId: string,
  schoolId: string
): Promise<DataEntryData[]> => {
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('category_id', categoryId)
      .eq('school_id', schoolId);

    if (error) {
      console.error('Category data entries fetch error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Failed to get data entries for category ${categoryId}:`, error);
    return [];
  }
};

export const saveDataEntry = async (
  schoolId: string,
  categoryId: string,
  columnId: string,
  value: any,
  userId: string
): Promise<boolean> => {
  try {
    const { data: existingEntry, error: fetchError } = await supabase
      .from('data_entries')
      .select('id, status')
      .eq('school_id', schoolId)
      .eq('category_id', categoryId)
      .eq('column_id', columnId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existingEntry) {
      if (existingEntry.status === 'approved') {
        console.warn('Cannot modify approved data');
        return false;
      }

      const { error: updateError } = await supabase
        .from('data_entries')
        .update({
          value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('data_entries')
        .insert([
          {
            school_id: schoolId,
            category_id: categoryId,
            column_id: columnId,
            value,
            status: 'pending',
            created_by: userId
          }
        ]);

      if (insertError) {
        throw insertError;
      }
    }

    return true;
  } catch (error) {
    console.error('Save data entry error:', error);
    return false;
  }
};

export const submitCategoryForApproval = async (
  categoryId: string,
  schoolId: string
): Promise<boolean> => {
  try {
    // 1. Bütün məlumatları pending statusuna yenilə
    const { error: updateError } = await supabase
      .from('data_entries')
      .update({ status: 'pending' })
      .eq('category_id', categoryId)
      .eq('school_id', schoolId);

    if (updateError) {
      throw updateError;
    }

    // 2. Kateqoriya üçün bildiriş göndərə bilərsiniz (gələcək funksionallıq)

    return true;
  } catch (error) {
    console.error('Submit category error:', error);
    return false;
  }
};

export const getAllCategories = async (): Promise<CategoryWithColumns[]> => {
  try {
    // Kateqoriyaları əldə et
    const { data: categoriesData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true });

    if (catError) {
      throw catError;
    }

    // Sütunları əldə et
    const { data: columnsData, error: colError } = await supabase
      .from('columns')
      .select('*')
      .eq('status', 'active')
      .order('order_index', { ascending: true });

    if (colError) {
      throw colError;
    }

    // Kateqoriyaları sütunlarla birləşdir
    const categories: CategoryWithColumns[] = categoriesData.map(category => {
      const columns = columnsData.filter(column => column.category_id === category.id) as Column[];
      
      return {
        id: category.id,
        name: category.name,
        description: category.description || '',
        assignment: category.assignment as 'all' | 'sectors',
        deadline: category.deadline || '',
        status: category.status as 'active' | 'inactive' | 'draft',
        priority: category.priority,
        created_at: category.created_at,
        updated_at: category.updated_at,
        archived: category.archived,
        column_count: columns.length,
        columns: columns
      };
    });

    return categories;
  } catch (error) {
    console.error('Get all categories error:', error);
    return [];
  }
};
