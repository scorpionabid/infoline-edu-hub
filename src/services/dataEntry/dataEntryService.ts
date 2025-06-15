import { supabase } from '@/integrations/supabase/client';
import { getDBSafeUUID } from '@/utils/uuidValidator';
import { logUUIDValidation, logDatabaseOperation, logDataEntryFlow } from '@/utils/debugUtils';

/**
 * Data Entry Service - məlumat daxil etmə əməliyyatları üçün mərkəzləşdirilmiş servis
 * 
 * Bu servis aşağıdakı əsas funksionallıqları dəstəkləyir:
 * - UUID validation və təhlükəsizlik
 * - Məlumat daxil etmə və yeniləmə
 * - Təsdiq üçün göndərmə
 * - Xəta idarəetməsi və logging
 */

export interface SaveDataEntryOptions {
  categoryId: string;
  schoolId: string;
  userId?: string;
  status?: string;
}

export interface SaveResult {
  success: boolean;
  error?: string;
  savedCount: number;
}

export interface SubmitResult {
  success: boolean;
  error?: string;
  submittedCount: number;
}

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
      
      // Validate userId - ensure it's either a valid UUID or null
      const safeUserId = getDBSafeUUID(userId, 'created_by');
      
      // Debug logging
      logUUIDValidation(userId, 'DataEntryService.saveFormData', safeUserId);
      logDataEntryFlow('Processing save request', {
        categoryId,
        schoolId,
        originalUserId: userId,
        validatedUserId: safeUserId,
        formDataKeys: Object.keys(formData)
      });
      
      const entries = Object.entries(formData).map(([columnId, value]) => {
        const entry = {
          school_id: schoolId,
          category_id: categoryId,
          column_id: columnId,
          value: value?.toString() || '',
          status,
          updated_at: new Date().toISOString()
        };
        
        // Only add created_by if we have a valid UUID
        if (safeUserId) {
          (entry as any).created_by = safeUserId;
        }
        
        return entry;
      });

      console.log(`[DataEntryService] Prepared ${entries.length} entries for upsert`);
      console.log(`[DataEntryService] Sample entry:`, entries[0]);

      const { error } = await supabase
        .from('data_entries')
        .upsert(entries, {
          onConflict: 'school_id,category_id,column_id'
        });

      if (error) {
        const errorDetails = {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        };
        
        console.error(`[DataEntryService] Upsert error:`, errorDetails);
        logDatabaseOperation('upsert_data_entries', { entries: entries.length }, { success: false, error: error.message });
        
        // Special UUID error detection
        if (error.code === '22P02') {
          console.error('❌ UUID FORMAT ERROR DETECTED - This should not happen with new validation!');
          console.error('Sample entry that caused error:', entries[0]);
        }
        
        throw error;
      }

      logDatabaseOperation('upsert_data_entries', { entries: entries.length }, { success: true });
      logDataEntryFlow('Save completed successfully', { savedCount: entries.length });
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
      const safeUserId = getDBSafeUUID(userId, 'updated_by');
      
      // Debug logging
      logUUIDValidation(userId, 'DataEntryService.submitForApproval', safeUserId);
      logDataEntryFlow('Processing submission', {
        categoryId,
        schoolId,
        originalUserId: userId,
        validatedUserId: safeUserId
      });
      
      // Prepare update object
      const updateData: any = { 
        status: 'pending',
        updated_at: new Date().toISOString()
      };
      
      // Only add updated_by if we have a valid UUID
      if (safeUserId) {
        updateData.updated_by = safeUserId;
      }
      
      const { data, error } = await supabase
        .from('data_entries')
        .update(updateData)
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .select('id');

      if (error) {
        const errorDetails = {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        };
        
        console.error(`[DataEntryService] Submit error:`, errorDetails);
        logDatabaseOperation('update_entries_status', { categoryId, schoolId }, { success: false, error: error.message });
        
        // Special UUID error detection
        if (error.code === '22P02') {
          console.error('❌ UUID FORMAT ERROR DETECTED IN SUBMISSION - This should not happen!');
          console.error('Update data that caused error:', updateData);
        }
        
        throw error;
      }

      logDatabaseOperation('update_entries_status', { submittedCount: data?.length || 0 }, { success: true });
      logDataEntryFlow('Submission completed successfully', { submittedCount: data?.length || 0 });
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

  static async saveDataEntry(data: DataEntryFormData): Promise<SaveResult> {
    try {
      const { data: result, error } = await supabase
        .from('data_entries')
        .insert({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        savedCount: 1
      };
    } catch (error) {
      console.error('Error saving data entry:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save data entry',
        savedCount: 0
      };
    }
  }

  static async bulkSaveDataEntries(entries: DataEntryFormData[]): Promise<SaveResult> {
    try {
      const processedEntries = entries.map(entry => ({
        ...entry,
        created_by: getDBSafeUUID(entry.created_by, false) || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('data_entries')
        .insert(processedEntries)
        .select();

      if (error) throw error;

      return {
        success: true,
        savedCount: data?.length || 0
      };
    } catch (error) {
      console.error('Error bulk saving data entries:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk save data entries',
        savedCount: 0
      };
    }
  }
}
