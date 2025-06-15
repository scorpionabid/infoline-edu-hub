
import { supabase } from '@/integrations/supabase/client';
import { getDBSafeUUID, validateUserIdForDB } from '@/utils/uuidValidator';

export interface SaveDataEntryOptions {
  categoryId: string;
  schoolId: string;
  userId?: string | null;
  status?: string;
}

export interface DataEntrySaveResult {
  success: boolean;
  savedCount: number;
  error?: string;
}

export interface DataEntrySubmitResult {
  success: boolean;
  submittedCount: number;
  error?: string;
}

export const fetchDataEntries = async (options: { categoryId: string; schoolId: string }) => {
  const { categoryId, schoolId } = options;
  
  const { data, error } = await supabase
    .from('data_entries')
    .select('*')
    .eq('category_id', categoryId)
    .eq('school_id', schoolId);
  
  if (error) throw error;
  return data || [];
};

export const saveDataEntries = async (
  entries: any[],
  categoryId: string,
  schoolId: string,
  userId?: string
) => {
  const safeUserId = validateUserIdForDB(userId, 'save entries operation');
  
  const entriesData = entries.map(entry => ({
    ...entry,
    category_id: categoryId,
    school_id: schoolId,
    created_by: safeUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('data_entries')
    .upsert(entriesData, { onConflict: 'school_id,category_id,column_id' })
    .select();
  
  if (error) throw error;
  return data;
};

export const updateDataEntriesStatus = async (entries: any[], status: string) => {
  const entryIds = entries.map(entry => entry.id);
  
  const { data, error } = await supabase
    .from('data_entries')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .in('id', entryIds)
    .select();
  
  if (error) throw error;
  return data;
};

export class DataEntryService {
  static async saveFormData(
    formData: Record<string, any>,
    options: SaveDataEntryOptions
  ): Promise<DataEntrySaveResult> {
    try {
      const { categoryId, schoolId, userId, status = 'draft' } = options;
      
      const safeCategoryId = getDBSafeUUID(categoryId, 'Category ID for save');
      const safeSchoolId = getDBSafeUUID(schoolId, 'School ID for save');
      
      if (!safeCategoryId || !safeSchoolId) {
        throw new Error('Invalid category or school ID');
      }
      
      const safeUserId = validateUserIdForDB(userId, 'save operation');
      
      const entries = Object.entries(formData)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([columnId, value]) => {
          const safeColumnId = getDBSafeUUID(columnId, 'Column ID for save');
          
          if (!safeColumnId) {
            console.warn(`Skipping invalid column ID: ${columnId}`);
            return null;
          }
          
          const entry: any = {
            category_id: safeCategoryId,
            school_id: safeSchoolId,
            column_id: safeColumnId,
            value: String(value),
            status,
            updated_at: new Date().toISOString()
          };
          
          if (safeUserId) {
            entry.created_by = safeUserId;
          }
          
          return entry;
        })
        .filter(Boolean);
      
      if (entries.length === 0) {
        return { success: true, savedCount: 0 };
      }
      
      const { data, error } = await supabase
        .from('data_entries')
        .upsert(entries, { 
          onConflict: 'school_id,category_id,column_id',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        console.error('Save error:', error);
        throw new Error(`Failed to save entries: ${error.message}`);
      }
      
      return {
        success: true,
        savedCount: data?.length || 0
      };
      
    } catch (error) {
      console.error('Save operation failed:', error);
      return {
        success: false,
        savedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  static async submitForApproval(
    categoryId: string,
    schoolId: string,
    userId?: string | null
  ): Promise<DataEntrySubmitResult> {
    try {
      const safeCategoryId = getDBSafeUUID(categoryId, 'Category ID for submit');
      const safeSchoolId = getDBSafeUUID(schoolId, 'School ID for submit');
      const safeUserId = validateUserIdForDB(userId, 'submit operation');
      
      if (!safeCategoryId || !safeSchoolId) {
        throw new Error('Invalid category or school ID for submission');
      }
      
      const updateData: any = {
        status: 'pending',
        updated_at: new Date().toISOString()
      };
      
      // Only add created_by if we have a valid UUID - don't use updated_by
      if (safeUserId) {
        updateData.created_by = safeUserId;
      }
      
      const { data, error } = await supabase
        .from('data_entries')
        .update(updateData)
        .eq('category_id', safeCategoryId)
        .eq('school_id', safeSchoolId)
        .in('status', ['draft'])
        .select();
      
      if (error) {
        console.error('Submit error:', error);
        throw new Error(`Failed to submit entries: ${error.message}`);
      }
      
      return {
        success: true,
        submittedCount: data?.length || 0
      };
      
    } catch (error) {
      console.error('Submit operation failed:', error);
      return {
        success: false,
        submittedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
