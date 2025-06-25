
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';

export interface DataEntryParams {
  categoryId: string;
  schoolId: string;
}

export const fetchDataEntries = async ({ categoryId, schoolId }: DataEntryParams): Promise<DataEntry[]> => {
  const { data, error } = await supabase
    .from('data_entries')
    .select('*')
    .eq('category_id', categoryId)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching data entries:', error);
    throw error;
  }

  return data || [];
};

export const saveDataEntries = async (
  entries: Partial<DataEntry>[],
  categoryId: string,
  schoolId: string,
  userId?: string
): Promise<void> => {
  const entriesToSave = entries.map(entry => ({
    ...entry,
    category_id: categoryId,
    school_id: schoolId,
    created_by: userId,
    status: entry.status || 'pending'
  }));

  const { error } = await supabase
    .from('data_entries')
    .upsert(entriesToSave);

  if (error) {
    console.error('Error saving data entries:', error);
    throw error;
  }
};

export const updateDataEntriesStatus = async (
  entries: DataEntry[],
  status: string
): Promise<void> => {
  const entryIds = entries.map(entry => entry.id);

  const { error } = await supabase
    .from('data_entries')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', entryIds);

  if (error) {
    console.error('Error updating data entries status:', error);
    throw error;
  }
};

export class DataEntryService {
  static async fetchEntries(params: DataEntryParams): Promise<DataEntry[]> {
    return fetchDataEntries(params);
  }

  static async saveEntries(
    entries: Partial<DataEntry>[],
    categoryId: string,
    schoolId: string,
    userId?: string
  ): Promise<void> {
    return saveDataEntries(entries, categoryId, schoolId, userId);
  }

  static async updateStatus(entries: DataEntry[], status: string): Promise<void> {
    return updateDataEntriesStatus(entries, status);
  }
}
