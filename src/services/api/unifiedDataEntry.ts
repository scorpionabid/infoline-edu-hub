
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
    
    // Transform data to ensure proper typing
    const transformedData: UnifiedDataEntry[] = (data || []).map((entry: any) => ({
      ...entry,
      status: entry.status as 'draft' | 'pending' | 'approved' | 'rejected'
    }));
    
    return transformedData;
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
        created_by: userId || undefined,
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

    // Transform data to ensure proper typing
    const transformedData: UnifiedDataEntry[] = (data || []).map((entry: any) => ({
      ...entry,
      status: entry.status as 'draft' | 'pending' | 'approved' | 'rejected'
    }));

    return transformedData;
  } catch (error) {
    console.error('Error saving unified data entries:', error);
    throw error;
  }
};
