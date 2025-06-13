
import { supabase } from '@/lib/supabase';
import { DataEntry } from '@/types/dataEntry';
import { getSafeUUID } from '@/utils/uuidValidator';

export interface SectorDataEntry {
  id: string;
  sector_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
}

export interface FetchSectorDataEntriesOptions {
  categoryId: string;
  sectorId: string;
}

/**
 * Fetch sector data entries
 */
export async function fetchSectorDataEntries({ 
  categoryId, 
  sectorId 
}: FetchSectorDataEntriesOptions): Promise<SectorDataEntry[]> {
  try {
    if (!categoryId || !sectorId) {
      throw new Error('Kateqoriya və ya sektor ID-si çatışmır');
    }

    console.log(`Fetching sector data entries for category ${categoryId} and sector ${sectorId}`);
    
    const { data, error } = await supabase
      .from('sector_data_entries')
      .select('*')
      .eq('category_id', categoryId)
      .eq('sector_id', sectorId);

    if (error) {
      console.error('Error fetching sector data entries:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} sector data entries`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchSectorDataEntries:', error);
    throw error;
  }
}

/**
 * Save sector data entries
 */
export async function saveSectorDataEntries(
  entries: Partial<SectorDataEntry>[],
  categoryId: string,
  sectorId: string,
  userId?: string | null
): Promise<SectorDataEntry[]> {
  try {
    if (!categoryId || !sectorId) {
      throw new Error('Kateqoriya və ya sektor ID-si çatışmır');
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error('Saxlanılacaq məlumat yoxdur');
    }

    console.log('Saving sector data entries:', { categoryId, sectorId, entriesCount: entries.length, userId });
    
    // Validate userId using centralized UUID validator
    const safeUserId = getSafeUUID(userId);
    console.log('[sectorDataEntry] Processed safe userId:', safeUserId);

    // Prepare entries for upsert
    const entriesToSave = entries.map(entry => ({
      sector_id: sectorId,
      category_id: categoryId,
      column_id: entry.column_id,
      value: entry.value?.toString() || '',
      status: entry.status || 'draft',
      created_by: safeUserId, // Using validated UUID
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('sector_data_entries')
      .upsert(entriesToSave, {
        onConflict: 'sector_id,category_id,column_id'
      })
      .select();

    if (error) {
      console.error('Error saving sector data entries:', error);
      throw error;
    }

    console.log(`Successfully saved ${data?.length || 0} sector data entries`);
    return data || [];
  } catch (error) {
    console.error('Error in saveSectorDataEntries:', error);
    throw error;
  }
}

/**
 * Update sector data entries status
 */
export async function updateSectorDataEntriesStatus(
  entries: SectorDataEntry[],
  status: string
): Promise<void> {
  try {
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error('Yenilənəcək məlumat yoxdur');
    }

    const entryIds = entries.map(entry => entry.id).filter(Boolean);
    
    if (entryIds.length === 0) {
      throw new Error('Etibarlı ID-ləri olan məlumat daxil etmələri tapılmadı');
    }

    const { error } = await supabase
      .from('sector_data_entries')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .in('id', entryIds);

    if (error) {
      console.error('Error updating sector data entries status:', error);
      throw error;
    }

    console.log(`Successfully updated status for ${entryIds.length} sector data entries to ${status}`);
  } catch (error) {
    console.error('Error in updateSectorDataEntriesStatus:', error);
    throw error;
  }
}
