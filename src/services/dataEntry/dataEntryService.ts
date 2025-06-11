import { supabase } from '@/integrations/supabase/client';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';

export interface SaveDataEntryOptions {
  categoryId: string;
  schoolId: string;
  userId?: string;
  status?: DataEntryStatus;
  validateRequired?: boolean;
}

export interface SaveResult {
  success: boolean;
  error?: string;
  savedCount?: number;
}

export interface SubmitResult {
  success: boolean;
  error?: string;
  submittedCount?: number;
}

/**
 * Mərkəzləşdirilmiş Data Entry Service
 * 
 * Bütün məlumat saxlama və göndərmə əməliyyatlarını
 * bu service vasitəsilə həyata keçirir.
 */
export class DataEntryService {
  
  /**
   * Form məlumatlarını verilənlər bazasına saxlayır
   */
  static async saveFormData(
    formData: Record<string, any>,
    options: SaveDataEntryOptions
  ): Promise<SaveResult> {
    try {
      const { categoryId, schoolId, userId, status = 'draft', validateRequired = false } = options;
      
      // Form məlumatlarını DataEntry formatına çevirmə
      const entries = Object.entries(formData)
        .filter(([_, value]) => {
          // Boş dəyərləri filtirlə
          return value !== undefined && value !== null && value !== '';
        })
        .map(([columnId, value]) => ({
          school_id: schoolId,
          category_id: categoryId,
          column_id: columnId,
          value: String(value),
          status,
          created_by: userId,
          updated_at: new Date().toISOString()
        }));

      if (entries.length === 0) {
        return { 
          success: true, 
          savedCount: 0 
        };
      }

      // Verilənlər bazasına saxlama (upsert)
      const { error, count } = await supabase
        .from('data_entries')
        .upsert(entries, {
          onConflict: 'school_id,category_id,column_id',
          count: 'exact'
        });

      if (error) {
        console.error('Data save error:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        savedCount: count || entries.length
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Məlumat saxlama xətası';
      console.error('DataEntryService.saveFormData error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Məlumatları təsdiq üçün göndərir (pending status)
   */
  static async submitForApproval(
    categoryId: string,
    schoolId: string,
    userId?: string
  ): Promise<SubmitResult> {
    try {
      // Mövcud draft məlumatları pending statusuna keçir
      const { error, count } = await supabase
        .from('data_entries')
        .update({ 
          status: 'pending',
          created_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('status', 'draft')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Submit error:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        submittedCount: count || 0
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Göndərmə xətası';
      console.error('DataEntryService.submitForApproval error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Məlumatları yükləyir
   */
  static async loadEntries(
    categoryId: string,
    schoolId: string
  ): Promise<{ success: boolean; data?: DataEntry[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Məlumat yükləmə xətası';
      console.error('DataEntryService.loadEntries error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Konkret sütun məlumatını saxlayır
   */
  static async saveColumnData(
    columnId: string,
    value: any,
    options: SaveDataEntryOptions
  ): Promise<SaveResult> {
    try {
      const { categoryId, schoolId, userId, status = 'draft' } = options;
      
      const entry = {
        school_id: schoolId,
        category_id: categoryId,
        column_id: columnId,
        value: String(value || ''),
        status,
        created_by: userId,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('data_entries')
        .upsert([entry], {
          onConflict: 'school_id,category_id,column_id'
        });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, savedCount: 1 };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sütun məlumatı saxlama xətası';
      console.error('DataEntryService.saveColumnData error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Məlumatları silir (soft delete)
   */
  static async deleteEntries(
    categoryId: string,
    schoolId: string,
    columnIds?: string[]
  ): Promise<SaveResult> {
    try {
      let query = supabase
        .from('data_entries')
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'deleted'
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (columnIds && columnIds.length > 0) {
        query = query.in('column_id', columnIds);
      }

      const { error, count } = await query.select('*', { count: 'exact' });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        savedCount: count || 0
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Məlumat silmə xətası';
      console.error('DataEntryService.deleteEntries error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Məlumatların statusunu yoxlayır
   */
  static async getDataStatus(
    categoryId: string,
    schoolId: string
  ): Promise<{ 
    success: boolean; 
    status?: DataEntryStatus; 
    entryCount?: number;
    error?: string; 
  }> {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('status')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .not('deleted_at', 'is', null);

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          status: 'draft',
          entryCount: 0
        };
      }

      // Status prioriteti: approved > pending > rejected > draft
      const statuses = data.map(entry => entry.status);
      let finalStatus: DataEntryStatus = 'draft';

      if (statuses.includes('approved')) {
        finalStatus = 'approved';
      } else if (statuses.includes('pending')) {
        finalStatus = 'pending';
      } else if (statuses.includes('rejected')) {
        finalStatus = 'rejected';
      }

      return {
        success: true,
        status: finalStatus,
        entryCount: data.length
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Status yoxlama xətası';
      console.error('DataEntryService.getDataStatus error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

export default DataEntryService;
