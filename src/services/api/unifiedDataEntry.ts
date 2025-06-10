
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedDataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id?: string;
  sector_id?: string;
  value: any;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FetchUnifiedDataEntriesParams {
  categoryId: string;
  entityId: string;
  entityType: 'school' | 'sector';
}

export const fetchUnifiedDataEntries = async ({
  categoryId,
  entityId,
  entityType
}: FetchUnifiedDataEntriesParams): Promise<UnifiedDataEntry[]> => {
  try {
    let query = supabase
      .from('data_entries')
      .select('*')
      .eq('category_id', categoryId);

    if (entityType === 'school') {
      query = query.eq('school_id', entityId);
    } else if (entityType === 'sector') {
      query = query.eq('sector_id', entityId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching unified data entries:', error);
    throw error;
  }
};

export const saveUnifiedDataEntries = async (
  entries: Partial<UnifiedDataEntry>[],
  categoryId: string,
  entityId: string,
  entityType: 'school' | 'sector',
  userId?: string | null
): Promise<UnifiedDataEntry[]> => {
  try {
    const dataToSave = entries.map(entry => ({
      ...entry,
      category_id: categoryId,
      [entityType === 'school' ? 'school_id' : 'sector_id']: entityId,
      created_by: userId || undefined,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('data_entries')
      .upsert(dataToSave)
      .select();

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error saving unified data entries:', error);
    throw error;
  }
};
