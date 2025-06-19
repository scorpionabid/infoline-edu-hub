
import { supabase } from '@/integrations/supabase/client';
import { DataEntryStatus, ProxyDataEntryOptions, ProxyDataEntryResult, SaveProxyFormDataOptions, SubmitProxyDataOptions } from '@/types/dataEntry';
// Security logging disabled for now
// import { securityLogger } from '@/utils/securityLogger';

export class ProxyDataEntryService {
  static async createProxyDataEntry(
    columnId: string,
    value: string,
    options: ProxyDataEntryOptions
  ): Promise<ProxyDataEntryResult> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Permission check simplified - assume sector admin has permission
      const userRole = await this.getUserRole(user.user.id);
      if (!['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole)) {
        throw new Error('Insufficient permissions for proxy data entry');
      }

      // First check if entry already exists
      const { data: existingEntry } = await supabase
        .from('data_entries')
        .select('id')
        .eq('school_id', options.schoolId)
        .eq('category_id', options.categoryId)
        .eq('column_id', columnId)
        .single();

      const entryData = {
        school_id: options.schoolId,
        category_id: options.categoryId,
        column_id: columnId,
        value: value,
        status: options.autoApprove ? 'approved' : 'pending',
        created_by: user.user.id,
        approved_by: options.autoApprove ? user.user.id : null,
        approved_at: options.autoApprove ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      let data, error;
      
      if (existingEntry) {
        // Update existing entry
        const updateResult = await supabase
          .from('data_entries')
          .update(entryData)
          .eq('id', existingEntry.id)
          .select()
          .single();
        data = updateResult.data;
        error = updateResult.error;
      } else {
        // Create new entry
        const insertResult = await supabase
          .from('data_entries')
          .insert(entryData)
          .select()
          .single();
        data = insertResult.data;
        error = insertResult.error;
      }

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Security logging disabled for now
      console.log('[PROXY_DATA_ENTRY]', {
        userId: user.user.id,
        action: 'proxy_data_entry', 
        schoolId: options.schoolId,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        entryId: data.id,
        message: 'Proxy data entry created successfully',
        autoApproved: options.autoApprove
      };

    } catch (error: any) {
      console.error('Error creating proxy data entry:', error);
      return {
        success: false,
        error: error.message || 'Failed to create proxy data entry',
        message: error.message || 'Failed to create proxy data entry'
      };
    }
  }

  // Əlavə metodlar - Enhanced saveProxyFormData
  static async saveProxyFormData(
    formData: Record<string, any>,
    options: SaveProxyFormDataOptions
  ): Promise<ProxyDataEntryResult> {
    try {
      console.log('[saveProxyFormData] Starting with:', { formData, options });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }
      
      console.log('[saveProxyFormData] User authenticated:', user.user.id);

      const results = [];
      for (const [columnId, value] of Object.entries(formData)) {
        if (value !== undefined && value !== null && value !== '') {
          console.log('[saveProxyFormData] Processing entry:', { columnId, value });
          
          const result = await this.createProxyDataEntry(columnId, String(value), {
            schoolId: options.schoolId,
            categoryId: options.categoryId,
            autoApprove: false,
            reason: options.proxyReason
          });
          
          console.log('[saveProxyFormData] Entry result:', result);
          results.push(result);
        }
      }

      const allSuccessful = results.every(r => r.success);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      console.log('[saveProxyFormData] Final results:', { 
        total: results.length, 
        successful: successCount, 
        failed: failCount 
      });
      
      return {
        success: allSuccessful,
        error: allSuccessful ? undefined : `${failCount} out of ${results.length} entries failed`,
        message: allSuccessful ? 'All data saved successfully' : `${successCount} successful, ${failCount} failed`
      };
    } catch (error: any) {
      console.error('[saveProxyFormData] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save proxy form data',
        message: error.message || 'Failed to save proxy form data'
      };
    }
  }

  static async submitProxyData(options: SubmitProxyDataOptions): Promise<ProxyDataEntryResult> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Get existing data entries for this school/category combination
      const { data: existingEntries, error: fetchError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', options.schoolId)
        .eq('category_id', options.categoryId)
        .eq('status', 'pending');

      if (fetchError) {
        throw fetchError;
      }

      if (!existingEntries || existingEntries.length === 0) {
        return {
          success: false,
          message: 'No pending data to submit'
        };
      }

      // Update all pending entries to approved if autoApprove is true
      if (options.autoApprove) {
        const { error: updateError } = await supabase
          .from('data_entries')
          .update({
            status: 'approved',
            approved_by: user.user.id,
            approved_at: new Date().toISOString()
          })
          .eq('school_id', options.schoolId)
          .eq('category_id', options.categoryId)
          .eq('status', 'pending');

        if (updateError) {
          throw updateError;
        }
      }

      return {
        success: true,
        error: undefined,
        message: options.autoApprove 
          ? 'All data submitted and approved successfully' 
          : 'All data submitted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to submit proxy data',
        message: error.message || 'Failed to submit proxy data'
      };
    }
  }

  private static async getUserRole(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }
      
      return data?.role || 'user';
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return 'user';
    }
  }

  static async bulkSaveProxyFormData(
    schoolIds: string[],
    categoryId: string,
    columnId: string,
    value: string
  ): Promise<ProxyDataEntryResult> {
    try {
      const results = [];
      let successCount = 0;
      let failCount = 0;
      
      for (const schoolId of schoolIds) {
        const result = await this.createProxyDataEntry(columnId, value, {
          schoolId,
          categoryId,
          autoApprove: false,
          reason: 'Bulk data entry by sector admin'
        });
        
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
        
        results.push(result);
      }
      
      const allSuccessful = failCount === 0;
      
      return {
        success: successCount > 0, // Ən azı bir məktəb üçün uğurlu olmalıdır
        message: allSuccessful
          ? `Bütün ${schoolIds.length} məktəb üçün məlumatlar uğurla yadda saxlanıldı`
          : `${successCount} məktəb üçün yadda saxlama uğurlu, ${failCount} məktəb üçün uğursuz oldu`
      };
    } catch (error: any) {
      console.error('Error in bulk save proxy data:', error);
      return {
        success: false,
        message: error.message || 'Toplu məlumat daxil etmə zamanı xəta baş verdi'
      };
    }
  }
  
  static async bulkSubmitProxyData(
    schoolIds: string[],
    categoryId: string,
    columnId: string,
    value: string
  ): Promise<ProxyDataEntryResult> {
    try {
      const results = [];
      let successCount = 0;
      let failCount = 0;
      
      for (const schoolId of schoolIds) {
        const result = await this.createProxyDataEntry(columnId, value, {
          schoolId,
          categoryId,
          autoApprove: true,
          reason: 'Bulk data entry and submit by sector admin'
        });
        
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
        
        results.push(result);
      }
      
      const allSuccessful = failCount === 0;
      
      return {
        success: successCount > 0, // Ən azı bir məktəb üçün uğurlu olmalıdır
        message: allSuccessful
          ? `Bütün ${schoolIds.length} məktəb üçün məlumatlar uğurla təqdim edildi və təsdiqləndi`
          : `${successCount} məktəb üçün təqdim etmə uğurlu, ${failCount} məktəb üçün uğursuz oldu`
      };
    } catch (error: any) {
      console.error('Error in bulk submit proxy data:', error);
      return {
        success: false,
        message: error.message || 'Toplu məlumat təqdim etmə zamanı xəta baş verdi'
      };
    }
  }
}
