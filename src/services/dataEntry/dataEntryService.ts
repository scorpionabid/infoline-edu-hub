
import { supabase } from '@/integrations/supabase/client';

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
  static async saveFormData(
    formData: Record<string, any>,
    options: SaveFormDataOptions
  ): Promise<SaveFormDataResult> {
    try {
      const { categoryId, schoolId, userId, status = 'draft' } = options;
      
      const entries = Object.entries(formData).map(([columnId, value]) => ({
        school_id: schoolId,
        category_id: categoryId,
        column_id: columnId,
        value: value?.toString() || '',
        status,
        created_by: userId,
        updated_at: new Date().toISOString()
      }));

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
      const { data, error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
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
