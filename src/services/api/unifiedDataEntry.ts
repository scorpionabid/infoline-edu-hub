
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedDataEntry {
  id: string;
  category_id: string;
  column_id: string;
  value: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  school_id?: string;
  sector_id?: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  deleted_at?: string | null;
}

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

    // Transform and ensure proper typing
    return (data || []).map((entry: any) => ({
      id: entry.id,
      category_id: entry.category_id,
      column_id: entry.column_id,
      value: entry.value,
      status: (['pending', 'approved', 'rejected', 'draft'].includes(entry.status)) 
        ? entry.status 
        : 'draft',
      school_id: entityType === 'school' ? entry.school_id : undefined,
      sector_id: entityType === 'sector' ? entry.sector_id : undefined,
      created_by: entry.created_by,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      approved_by: entry.approved_by,
      approved_at: entry.approved_at,
      rejected_by: entry.rejected_by,
      rejected_at: entry.rejected_at,
      rejection_reason: entry.rejection_reason,
      deleted_at: entry.deleted_at
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

    // Process entries to match database schema exactly
    const processedEntries = entries.map(entry => {
      const baseEntry: Record<string, any> = {
        category_id: categoryId,
        [entityFieldName]: entityId,
        created_by: userId || null,
        status: entry.status || 'draft'
      };

      // Only add fields that exist and have values
      if (entry.id) baseEntry.id = entry.id;
      if (entry.column_id) baseEntry.column_id = entry.column_id;
      if (entry.value !== undefined) baseEntry.value = entry.value;
      if (entry.created_at) baseEntry.created_at = entry.created_at;
      if (entry.updated_at) baseEntry.updated_at = entry.updated_at;
      if (entry.approved_by) baseEntry.approved_by = entry.approved_by;
      if (entry.approved_at) baseEntry.approved_at = entry.approved_at;
      if (entry.rejected_by) baseEntry.rejected_by = entry.rejected_by;
      if (entry.rejected_at) baseEntry.rejected_at = entry.rejected_at;
      if (entry.rejection_reason) baseEntry.rejection_reason = entry.rejection_reason;
      if (entry.deleted_at) baseEntry.deleted_at = entry.deleted_at;

      return baseEntry;
    });

    const { data, error } = await supabase
      .from(tableName)
      .upsert(processedEntries)
      .select();

    if (error) throw error;

    // Transform response data to match our interface
    return (data || []).map((entry: any) => ({
      id: entry.id,
      category_id: entry.category_id,
      column_id: entry.column_id,
      value: entry.value,
      status: entry.status,
      school_id: entityType === 'school' ? entry.school_id : undefined,
      sector_id: entityType === 'sector' ? entry.sector_id : undefined,
      created_by: entry.created_by,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      approved_by: entry.approved_by,
      approved_at: entry.approved_at,
      rejected_by: entry.rejected_by,
      rejected_at: entry.rejected_at,
      rejection_reason: entry.rejection_reason,
      deleted_at: entry.deleted_at
    })) as UnifiedDataEntry[];
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
