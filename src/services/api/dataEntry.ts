
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';

export interface SaveDataEntryOptions {
  categoryId: string;
  schoolId: string;
  userId?: string;
}

export interface SaveResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface SubmitResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const fetchDataEntries = async (options: SaveDataEntryOptions): Promise<DataEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('category_id', options.categoryId)
      .eq('school_id', options.schoolId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching data entries:', error);
    throw error;
  }
};

export const saveDataEntries = async (
  entries: Partial<DataEntry>[],
  categoryId: string,
  schoolId: string,
  userId?: string
): Promise<SaveResult> => {
  try {
    const entriesWithMetadata = entries.map(entry => ({
      ...entry,
      category_id: categoryId,
      school_id: schoolId,
      created_by: userId,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('data_entries')
      .upsert(entriesWithMetadata)
      .select();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error saving data entries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const updateDataEntriesStatus = async (
  entries: DataEntry[],
  status: string
): Promise<SaveResult> => {
  try {
    const updates = entries.map(entry => ({
      id: entry.id,
      status,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('data_entries')
      .upsert(updates)
      .select();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export class DataEntryService {
  static async fetchEntries(options: SaveDataEntryOptions) {
    return fetchDataEntries(options);
  }

  static async saveEntries(entries: Partial<DataEntry>[], categoryId: string, schoolId: string, userId?: string) {
    return saveDataEntries(entries, categoryId, schoolId, userId);
  }

  static async updateStatus(entries: DataEntry[], status: string) {
    return updateDataEntriesStatus(entries, status);
  }
}
