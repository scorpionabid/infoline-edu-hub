import { supabase } from '@/integrations/supabase/client';
import { DataEntryStatus } from '@/types/dataEntry';

export interface SchoolDataEntry {
  id?: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: DataEntryStatus;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

export interface SaveSchoolDataEntryInput {
  schoolId: string;
  categoryId: string;
  columnId: string;
  value: string;
  userId?: string;
}

/**
 * Məktəb məlumatını saxla
 * UnifiedSectorDataEntry komponenti üçün
 */
export const saveSchoolDataEntry = async (input: SaveSchoolDataEntryInput): Promise<SchoolDataEntry> => {
  const { schoolId, categoryId, columnId, value, userId } = input;
  
  console.log('[saveSchoolDataEntry] Saving school data entry:', {
    schoolId,
    categoryId,
    columnId,
    value: value?.substring(0, 50) + (value?.length > 50 ? '...' : ''),
    // userId
  });
  
  try {
    const entry: Partial<SchoolDataEntry> = {
      school_id: schoolId,
      category_id: categoryId,
      column_id: columnId,
      value,
      status: 'pending' as DataEntryStatus, // Məktəb adminindən gələn məlumat pending olur
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Mövcud entry-ni yoxla və ya yeni yarat
    const { data, error } = await supabase
      .from('data_entries')
      .upsert(entry, { 
        onConflict: 'school_id,category_id,column_id',
        ignoreDuplicates: false 
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('[saveSchoolDataEntry] Database error:', error);
      throw new Error(`Məlumat saxlanarkən xəta: ${error.message}`);
    }
    
    console.log('[saveSchoolDataEntry] Successfully saved entry:', data.id);
    return data;
    
  } catch (error: any) {
    console.error('[saveSchoolDataEntry] Unexpected error:', error);
    throw error;
  }
};

/**
 * Məktəb məlumatlarını toplu şəkildə saxla
 */
export const saveBulkSchoolDataEntries = async (
  entries: SaveSchoolDataEntryInput[]
): Promise<SchoolDataEntry[]> => {
  console.log('[saveBulkSchoolDataEntries] Saving bulk entries:', entries.length);
  
  try {
    const entryData: Partial<SchoolDataEntry>[] = entries.map(entry => ({
      school_id: entry.schoolId,
      category_id: entry.categoryId,
      column_id: entry.columnId,
      value: entry.value,
      status: 'pending' as DataEntryStatus,
      created_by: entry.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data, error } = await supabase
      .from('data_entries')
      .upsert(entryData, { 
        onConflict: 'school_id,category_id,column_id',
        ignoreDuplicates: false 
      })
      .select();
    
    if (error) {
      console.error('[saveBulkSchoolDataEntries] Database error:', error);
      throw new Error(`Toplu məlumat saxlanarkən xəta: ${error.message}`);
    }
    
    console.log(`[saveBulkSchoolDataEntries] Successfully saved ${data.length} entries`);
    return data;
    
  } catch (error: any) {
    console.error('[saveBulkSchoolDataEntries] Unexpected error:', error);
    throw error;
  }
};

/**
 * Məktəb məlumatını əldə et
 */
export const getSchoolDataEntry = async (
  schoolId: string,
  categoryId: string,
  columnId: string
): Promise<SchoolDataEntry | null> => {
  console.log('[getSchoolDataEntry] Fetching entry:', { schoolId, categoryId, columnId });
  
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId)
      .eq('category_id', categoryId)
      .eq('column_id', columnId)
      .maybeSingle();
    
    if (error) {
      console.error('[getSchoolDataEntry] Database error:', error);
      throw new Error(`Məlumat əldə edilərkən xəta: ${error.message}`);
    }
    
    console.log('[getSchoolDataEntry] Entry found:', !!data);
    return data;
    
  } catch (error: any) {
    console.error('[getSchoolDataEntry] Unexpected error:', error);
    throw error;
  }
};

/**
 * Məktəbin kateqoriya üzrə bütün məlumatlarını əldə et
 */
export const getSchoolDataByCategory = async (
  schoolId: string,
  categoryId: string
): Promise<SchoolDataEntry[]> => {
  console.log('[getSchoolDataByCategory] Fetching entries:', { schoolId, categoryId });
  
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .select(`
        *,
        columns!inner(id, name, type, order_index),
        categories!inner(id, name)
      `)
      .eq('school_id', schoolId)
      .eq('category_id', categoryId)
      .order('columns(order_index)', { ascending: true });
    
    if (error) {
      console.error('[getSchoolDataByCategory] Database error:', error);
      throw new Error(`Məlumatlar əldə edilərkən xəta: ${error.message}`);
    }
    
    console.log(`[getSchoolDataByCategory] Found ${data.length} entries`);
    return data;
    
  } catch (error: any) {
    console.error('[getSchoolDataByCategory] Unexpected error:', error);
    throw error;
  }
};

/**
 * Məktəb məlumatının statusunu yenilə
 */
export const updateSchoolDataEntryStatus = async (
  entryId: string,
  status: DataEntryStatus,
  comment?: string
): Promise<SchoolDataEntry> => {
  console.log('[updateSchoolDataEntryStatus] Updating status:', { entryId, status, comment });
  
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const updateData: Partial<SchoolDataEntry> = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'approved') {
      updateData.approved_by = user.user?.id;
      updateData.approved_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updateData.rejected_by = user.user?.id;
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = comment;
    }
    
    const { data, error } = await supabase
      .from('data_entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('[updateSchoolDataEntryStatus] Database error:', error);
      throw new Error(`Status yenilənərkən xəta: ${error.message}`);
    }
    
    console.log('[updateSchoolDataEntryStatus] Status updated successfully');
    return data;
    
  } catch (error: any) {
    console.error('[updateSchoolDataEntryStatus] Unexpected error:', error);
    throw error;
  }
};

/**
 * Məktəb məlumatını sil
 */
export const deleteSchoolDataEntry = async (entryId: string): Promise<void> => {
  console.log('[deleteSchoolDataEntry] Deleting entry:', entryId);
  
  try {
    const { error } = await supabase
      .from('data_entries')
      .delete()
      .eq('id', entryId);
    
    if (error) {
      console.error('[deleteSchoolDataEntry] Database error:', error);
      throw new Error(`Məlumat silinərkən xəta: ${error.message}`);
    }
    
    console.log('[deleteSchoolDataEntry] Entry deleted successfully');
    
  } catch (error: any) {
    console.error('[deleteSchoolDataEntry] Unexpected error:', error);
    throw error;
  }
};

// Default export obyekti (compatibility üçün)
export default {
  saveSchoolDataEntry,
  saveBulkSchoolDataEntries,
  getSchoolDataEntry,
  getSchoolDataByCategory,
  updateSchoolDataEntryStatus,
  // deleteSchoolDataEntry
};