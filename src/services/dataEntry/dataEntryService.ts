
import { supabase } from '@/integrations/supabase/client';

export interface SaveDataEntryOptions {
  categoryId: string;
  schoolId: string;
  userId?: string;
}

export interface SaveResult {
  success: boolean;
  error?: string;
  savedCount?: number;
  autoApproved?: boolean;
}

export interface SubmitResult {
  success: boolean;
  error?: string;
}

export class DataEntryService {
  static async saveFormData(
    formData: Record<string, any>,
    options: SaveDataEntryOptions
  ): Promise<SaveResult> {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert({
          category_id: options.categoryId,
          school_id: options.schoolId,
          created_by: options.userId,
          data: formData,
          status: 'draft'
        });

      if (error) {
        console.error('Error saving form data:', error);
        return { success: false, error: error.message };
      }

      return { success: true, savedCount: 1 };
    } catch (error) {
      console.error('Error in saveFormData:', error);
      return { success: false, error: 'Bilinməyən xəta' };
    }
  }

  static async submitFormData(
    formData: Record<string, any>,
    options: SaveDataEntryOptions
  ): Promise<SubmitResult> {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert({
          category_id: options.categoryId,
          school_id: options.schoolId,
          created_by: options.userId,
          data: formData,
          status: 'submitted'
        });

      if (error) {
        console.error('Error submitting form data:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in submitFormData:', error);
      return { success: false, error: 'Bilinməyən xəta' };
    }
  }
}
