
import { supabase } from '@/integrations/supabase/client';
import { getSafeUUID } from '@/utils/uuidValidator';

interface SaveFormDataOptions {
  categoryId: string;
  schoolId: string;
  userId?: string;
  status?: string;
}

interface SaveFormDataResult {
  success: boolean;
  error?: string;
  savedCount: number;
}

interface SubmitForApprovalResult {
  success: boolean;
  error?: string;
  submittedCount: number;
}

export class DataEntryService {
  // Using centralized UUID validation utility

  static async saveFormData(
    formData: Record<string, any>,
    options: SaveFormDataOptions
  ): Promise<SaveFormDataResult> {
    try {
      const { categoryId, schoolId, userId, status = 'draft' } = options;
      
      // Log incoming userId for debugging
      console.log(`[DataEntryService.saveFormData] Received userId: ${userId}, type: ${typeof userId}`);
      
      // Validate userId - ensure it's either a valid UUID or null
      const safeUserId = getSafeUUID(userId);
      
      // Log after validation
      console.log(`[DataEntryService.saveFormData] After validation safeUserId: ${safeUserId}`);
      
      // Create entries with detailed logging
      console.log(`[DataEntryService.saveFormData] Creating ${Object.keys(formData).length} entries with created_by: ${safeUserId}`);
      
      const entries = Object.entries(formData).map(([columnId, value]) => {
        const entry = {
          school_id: schoolId,
          category_id: categoryId,
          column_id: columnId,
          value: value?.toString() || '',
          status,
          created_by: safeUserId,
          updated_at: new Date().toISOString()
        };
        
        // Log each entry's created_by for debugging
        console.log(`[DataEntryService.saveFormData] Entry for column ${columnId} has created_by: ${entry.created_by}`);
        
        return entry;
      });

      // Final check before sending to Supabase
      console.log(`[DataEntryService.saveFormData] Final entries check before Supabase upsert:`);
      entries.forEach((entry, index) => {
        console.log(`Entry ${index}: created_by = ${entry.created_by}, type: ${typeof entry.created_by}`);
      });
      
      const { error } = await supabase
        .from('data_entries')
        .upsert(entries, {
          onConflict: 'school_id,category_id,column_id'
        });

      if (error) throw error;

      return {
        success: true,
        savedCount: entries.length
      };
    } catch (error) {
      console.error('Save form data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        savedCount: 0
      };
    }
  }

  static async submitForApproval(
    categoryId: string,
    schoolId: string,
    userId?: string
  ): Promise<SubmitForApprovalResult> {
    try {
      // Validate userId
      const safeUserId = getSafeUUID(userId);
      
      // Log submission attempt
      console.log(`[DataEntryService] Submitting for approval: categoryId=${categoryId}, schoolId=${schoolId}, userId=${safeUserId || 'null'}`);
      
      const { data, error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString(),
          updated_by: safeUserId // Add updater info with validated UUID
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .select('id');

      if (error) throw error;

      return {
        success: true,
        submittedCount: data?.length || 0
      };
    } catch (error) {
      console.error('Submit for approval error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        submittedCount: 0
      };
    }
  }
}
