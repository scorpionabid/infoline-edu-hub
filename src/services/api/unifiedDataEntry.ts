
// Unified data entry service
import { supabase } from '@/integrations/supabase/client';

export interface DataEntryParams {
  column_id: string;
  category_id: string;
  school_id: string;
  value: string;
  status?: string;
}

export const createDataEntry = async (params: DataEntryParams) => {
  const { data, error } = await supabase
    .from('data_entries')
    .insert({
      column_id: params.column_id,
      category_id: params.category_id,
      school_id: params.school_id,
      value: params.value,
      status: params.status || 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDataEntry = async (id: string, updates: Partial<DataEntryParams>) => {
  const { data, error } = await supabase
    .from('data_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getDataEntries = async (filters: {
  school_id?: string;
  category_id?: string;
  column_id?: string;
  status?: string;
}) => {
  let query = supabase.from('data_entries').select('*');

  if (filters.school_id) {
    query = query.eq('school_id', filters.school_id);
  }
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters.column_id) {
    query = query.eq('column_id', filters.column_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
