
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

export class DataEntryService {
  /**
   * Save form data to database with proper UUID validation
   */
  static async saveFormData(
    formData: Record<string, any>,
    options: SaveDataEntryOptions
  ): Promise<DataEntrySaveResult> {
    try {
      const { categoryId, schoolId, userId, status = 'draft' } = options;
      
      // Validate required UUIDs
      const safeCategoryId = getDBSafeUUID(categoryId, 'Category ID for save');
      const safeSchoolId = getDBSafeUUID(schoolId, 'School ID for save');
      
      if (!safeCategoryId || !safeSchoolId) {
        throw new Error('Invalid category or school ID');
      }
      
      // Validate user ID - allow null for system operations
      const safeUserId = validateUserIdForDB(userId, 'save operation');
      
      // Log the validated IDs
      console.log('[DataEntryService] Validated IDs:', {
        categoryId: safeCategoryId,
        schoolId: safeSchoolId,
        userId: safeUserId,
        originalUserId: userId
      });
      
      // Get existing entries for this category and school
      const { data: existingEntries, error: fetchError } = await supabase
        .from('data_entries')
        .select('id, column_id')
        .eq('category_id', safeCategoryId)
        .eq('school_id', safeSchoolId);
      
      if (fetchError) {
        throw new Error(`Failed to fetch existing entries: ${fetchError.message}`);
      }
      
      // Prepare entries for upsert
      const entries = Object.entries(formData)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([columnId, value]) => {
          const safeColumnId = getDBSafeUUID(columnId, 'Column ID for save');
          
          if (!safeColumnId) {
            console.warn(`[DataEntryService] Skipping invalid column ID: ${columnId}`);
            return null;
          }
          
          const existingEntry = existingEntries?.find(e => e.column_id === safeColumnId);
          
          return {
            id: existingEntry?.id,
            category_id: safeCategoryId,
            school_id: safeSchoolId,
            column_id: safeColumnId,
            value: String(value),
            status,
            created_by: safeUserId, // Will be null for system operations
            updated_at: new Date().toISOString()
          };
        })
        .filter(Boolean); // Remove null entries
      
      if (entries.length === 0) {
        return { success: true, savedCount: 0 };
      }
      
      // Perform upsert
      const { data, error } = await supabase
        .from('data_entries')
        .upsert(entries, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        console.error('[DataEntryService] Save error:', error);
        throw new Error(`Failed to save entries: ${error.message}`);
      }
      
      console.log(`[DataEntryService] Successfully saved ${data?.length || 0} entries`);
      
      return {
        success: true,
        savedCount: data?.length || 0
      };
      
    } catch (error) {
      console.error('[DataEntryService] Save operation failed:', error);
      return {
        success: false,
        savedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Submit entries for approval with proper UUID validation
   */
  static async submitForApproval(
    categoryId: string,
    schoolId: string,
    userId?: string | null
  ): Promise<DataEntrySubmitResult> {
    try {
      // Validate UUIDs
      const safeCategoryId = getDBSafeUUID(categoryId, 'Category ID for submit');
      const safeSchoolId = getDBSafeUUID(schoolId, 'School ID for submit');
      const safeUserId = validateUserIdForDB(userId, 'submit operation');
      
      if (!safeCategoryId || !safeSchoolId) {
        throw new Error('Invalid category or school ID for submission');
      }
      
      console.log('[DataEntryService] Submitting for approval:', {
        categoryId: safeCategoryId,
        schoolId: safeSchoolId,
        userId: safeUserId
      });
      
      // Update entries to pending status
      const { data, error } = await supabase
        .from('data_entries')
        .update({
          status: 'pending',
          created_by: safeUserId, // Ensure we have the correct user ID
          updated_at: new Date().toISOString()
        })
        .eq('category_id', safeCategoryId)
        .eq('school_id', safeSchoolId)
        .in('status', ['draft'])
        .select();
      
      if (error) {
        console.error('[DataEntryService] Submit error:', error);
        throw new Error(`Failed to submit entries: ${error.message}`);
      }
      
      console.log(`[DataEntryService] Successfully submitted ${data?.length || 0} entries`);
      
      return {
        success: true,
        submittedCount: data?.length || 0
      };
      
    } catch (error) {
      console.error('[DataEntryService] Submit operation failed:', error);
      return {
        success: false,
        submittedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
