
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnFormData, ColumnType, ColumnStatus } from '@/types/column';
import { Json } from '@/integrations/supabase/types';

const transformColumnFromDB = (dbColumn: any): Column => {
  return {
    id: dbColumn.id,
    name: dbColumn.name,
    category_id: dbColumn.category_id,
    type: dbColumn.type as ColumnType,
    is_required: dbColumn.is_required,
    help_text: dbColumn.help_text || '',
    description: dbColumn.help_text || '',
    placeholder: dbColumn.placeholder || '',
    default_value: dbColumn.default_value || '',
    options: Array.isArray(dbColumn.options) ? dbColumn.options : [],
    validation: dbColumn.validation || {},
    order_index: dbColumn.order_index || 0,
    status: (dbColumn.status as ColumnStatus) || 'active',
    section: '',
    created_at: dbColumn.created_at,
    updated_at: dbColumn.updated_at
  };
};

export const getColumnsByCategory = async (categoryId: string): Promise<Column[]> => {
  try {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('order_index');

    if (error) {
      console.error('Error fetching columns:', error);
      throw error;
    }

    if (!data) return [];

    return data.map(transformColumnFromDB);
  } catch (error) {
    console.error('Error in getColumnsByCategory:', error);
    throw error;
  }
};

export const getColumnById = async (columnId: string): Promise<Column | null> => {
  try {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('id', columnId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return transformColumnFromDB(data);
  } catch (error) {
    console.error('Error in getColumnById:', error);
    throw error;
  }
};

export const createColumn = async (columnData: ColumnFormData): Promise<Column> => {
  try {
    const dbData = {
      name: columnData.name,
      category_id: columnData.category_id,
      type: columnData.type,
      is_required: columnData.is_required || false,
      help_text: columnData.help_text || '',
      placeholder: columnData.placeholder || '',
      default_value: columnData.default_value || '',
      options: (columnData.options as unknown as Json) || [],
      validation: (columnData.validation as unknown as Json) || {},
      order_index: columnData.order_index || 0,
      status: columnData.status || 'active',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('columns')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    return transformColumnFromDB(data);
  } catch (error) {
    console.error('Error creating column:', error);
    throw error;
  }
};

export const updateColumn = async (columnId: string, updates: Partial<ColumnFormData>): Promise<Column> => {
  try {
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that are being updated
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.is_required !== undefined) dbUpdates.is_required = updates.is_required;
    if (updates.help_text !== undefined) dbUpdates.help_text = updates.help_text;
    if (updates.placeholder !== undefined) dbUpdates.placeholder = updates.placeholder;
    if (updates.default_value !== undefined) dbUpdates.default_value = updates.default_value;
    if (updates.options !== undefined) dbUpdates.options = updates.options as unknown as Json;
    if (updates.validation !== undefined) dbUpdates.validation = updates.validation as unknown as Json;
    if (updates.order_index !== undefined) dbUpdates.order_index = updates.order_index;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('columns')
      .update(dbUpdates)
      .eq('id', columnId)
      .select()
      .single();

    if (error) throw error;

    return transformColumnFromDB(data);
  } catch (error) {
    console.error('Error updating column:', error);
    throw error;
  }
};

export const deleteColumn = async (columnId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('columns')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', columnId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting column:', error);
    throw error;
  }
};

export const restoreColumn = async (columnId: string): Promise<Column> => {
  try {
    const { data, error } = await supabase
      .from('columns')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', columnId)
      .select()
      .single();

    if (error) throw error;

    return transformColumnFromDB(data);
  } catch (error) {
    console.error('Error restoring column:', error);
    throw error;
  }
};

export const getArchivedColumns = async (categoryId: string): Promise<Column[]> => {
  try {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', 'deleted')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    if (!data) return [];

    return data.map(transformColumnFromDB);
  } catch (error) {
    console.error('Error fetching archived columns:', error);
    throw error;
  }
};

export const permanentlyDeleteColumn = async (columnId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('columns')
      .delete()
      .eq('id', columnId);

    if (error) throw error;
  } catch (error) {
    console.error('Error permanently deleting column:', error);
    throw error;
  }
};
