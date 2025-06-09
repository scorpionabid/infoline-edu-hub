
import { supabase } from '@/integrations/supabase/client';
import { UnifiedDataEntry } from '@/hooks/dataEntry/useUnifiedDataEntry';

export interface FetchUnifiedDataEntriesOptions {
  categoryId: string;
  entityId: string;
  entityType: 'school' | 'sector';
}

export async function fetchUnifiedDataEntries({
  categoryId,
  entityId,
  entityType
}: FetchUnifiedDataEntriesOptions): Promise<UnifiedDataEntry[]> {
  try {
    const tableName = entityType === 'school' ? 'data_entries' : 'sector_data_entries';
    const entityFieldName = entityType === 'school' ? 'school_id' : 'sector_id';

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('category_id', categoryId)
      .eq(entityFieldName, entityId)
      .is('deleted_at', null);

    if (error) throw error;

    return (data || []).map(entry => ({
      ...entry,
      // Ensure status is properly typed
      status: (entry.status as 'pending' | 'approved' | 'rejected' | 'draft') || 'draft',
      school_id: entityType === 'school' ? entry.school_id : undefined,
      sector_id: entityType === 'sector' ? entry.sector_id : undefined
    })) as UnifiedDataEntry[];
  } catch (error) {
    console.error('Error fetching unified data entries:', error);
    throw error;
  }
}

export async function saveUnifiedDataEntries(
  entries: Partial<UnifiedDataEntry>[],
  categoryId: string,
  entityId: string,
  entityType: 'school' | 'sector',
  userId?: string | null
): Promise<UnifiedDataEntry[]> {
  try {
    const tableName = entityType === 'school' ? 'data_entries' : 'sector_data_entries';
    const entityFieldName = entityType === 'school' ? 'school_id' : 'sector_id';

    const processedEntries = entries.map(entry => ({
      ...entry,
      category_id: categoryId,
      [entityFieldName]: entityId,
      created_by: userId || null,
      status: entry.status || 'draft'
    }));

    const { data, error } = await supabase
      .from(tableName)
      .upsert(processedEntries)
      .select();

    if (error) throw error;

    return data as UnifiedDataEntry[];
  } catch (error) {
    console.error('Error saving unified data entries:', error);
    throw error;
  }
}

export async function updateUnifiedDataEntriesStatus(
  entries: UnifiedDataEntry[],
  status: string,
  entityType: 'school' | 'sector'
): Promise<void> {
  try {
    const tableName = entityType === 'school' ? 'data_entries' : 'sector_data_entries';
    const entryIds = entries.map(entry => entry.id);

    const { error } = await supabase
      .from(tableName)
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .in('id', entryIds);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating unified data entries status:', error);
    throw error;
  }
}
