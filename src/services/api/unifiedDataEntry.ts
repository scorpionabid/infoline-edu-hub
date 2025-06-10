
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
    
    return (data || []).map((entry: any) => ({
      id: entry.id,
      category_id: entry.category_id,
      column_id: entry.column_id,
      school_id: entry.school_id,
      sector_id: entry.sector_id,
      value: entry.value,
      status: (entry.status === 'draft' || entry.status === 'pending' || 
               entry.status === 'approved' || entry.status === 'rejected') 
               ? entry.status as 'draft' | 'pending' | 'approved' | 'rejected'
               : 'draft',
      created_by: entry.created_by,
      created_at: entry.created_at,
      updated_at: entry.updated_at
    }));
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
    const dataToSave = entries.map(entry => {
      const baseData: any = {
        category_id: categoryId,
        column_id: entry.column_id || '',
        value: entry.value,
        status: entry.status || 'draft',
        created_by: userId || null,
        updated_at: new Date().toISOString()
      };

      if (entityType === 'school') {
        baseData.school_id = entityId;
      } else {
        baseData.sector_id = entityId;
      }

      if (entry.id) {
        baseData.id = entry.id;
      }

      return baseData;
    });

    const { data, error } = await supabase
      .from('data_entries')
      .upsert(dataToSave)
      .select();

    if (error) throw error;

    return (data || []).map((entry: any) => ({
      id: entry.id,
      category_id: entry.category_id,
      column_id: entry.column_id,
      school_id: entry.school_id,
      sector_id: entry.sector_id,
      value: entry.value,
      status: (entry.status === 'draft' || entry.status === 'pending' || 
               entry.status === 'approved' || entry.status === 'rejected') 
               ? entry.status as 'draft' | 'pending' | 'approved' | 'rejected'
               : 'draft',
      created_by: entry.created_by,
      created_at: entry.created_at,
      updated_at: entry.updated_at
    }));
  } catch (error) {
    console.error('Error saving unified data entries:', error);
    throw error;
  }
};
