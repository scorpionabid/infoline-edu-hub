
import { supabase } from '@/integrations/supabase/client';
import { UnifiedDataEntry, DataEntryParams } from './unifiedDataEntry';
import { validateUserIdForDB } from '@/utils/uuidValidator';

export interface DataEntryFilters {
  school_id?: string;
  category_id?: string;
  column_id?: string;
  status?: string;
  created_by?: string;
  approved_by?: string;
}

export const createDataEntry = async (params: DataEntryParams): Promise<UnifiedDataEntry> => {
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

export const updateDataEntry = async (id: string, updates: Partial<DataEntryParams>): Promise<UnifiedDataEntry> => {
  // Validate user IDs if present
  if (updates.created_by && !validateUserIdForDB(updates.created_by)) {
    throw new Error('Invalid created_by user ID');
  }
  if (updates.approved_by && !validateUserIdForDB(updates.approved_by)) {
    throw new Error('Invalid approved_by user ID');
  }

  const { data, error } = await supabase
    .from('data_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getDataEntries = async (filters: DataEntryFilters): Promise<UnifiedDataEntry[]> => {
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
  if (filters.created_by && validateUserIdForDB(filters.created_by)) {
    query = query.eq('created_by', filters.created_by);
  }
  if (filters.approved_by && validateUserIdForDB(filters.approved_by)) {
    query = query.eq('approved_by', filters.approved_by);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const deleteDataEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('data_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const approveDataEntry = async (id: string, approvedBy: string, comment?: string): Promise<UnifiedDataEntry> => {
  if (!validateUserIdForDB(approvedBy)) {
    throw new Error('Invalid approver user ID');
  }

  const { data, error } = await supabase
    .from('data_entries')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      approval_comment: comment || null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const rejectDataEntry = async (id: string, rejectedBy: string, reason?: string): Promise<UnifiedDataEntry> => {
  if (!validateUserIdForDB(rejectedBy)) {
    throw new Error('Invalid rejector user ID');
  }

  const { data, error } = await supabase
    .from('data_entries')
    .update({
      status: 'rejected',
      rejected_by: rejectedBy,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason || null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
