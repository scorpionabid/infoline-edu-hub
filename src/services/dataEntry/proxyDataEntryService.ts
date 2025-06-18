
import { supabase } from '@/integrations/supabase/client';
import { DataEntryStatus, ProxyDataEntryOptions, ProxyDataEntryResult } from '@/types/dataEntry';
import { securityLogger } from '@/utils/securityLogger';

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

      // Check permission for proxy data entry
      const { data: hasPermission } = await supabase.rpc('check_proxy_data_entry_permission', {
        user_id: user.user.id,
        user_role: await this.getUserRole(user.user.id),
        target_school_id: options.schoolId
      });

      if (!hasPermission) {
        throw new Error('Insufficient permissions for proxy data entry');
      }

      const entryData = {
        school_id: options.schoolId,
        category_id: options.categoryId,
        column_id: columnId,
        value: value,
        status: options.autoApprove ? DataEntryStatus.APPROVED : DataEntryStatus.PENDING,
        proxy_created_by: user.user.id,
        proxy_reason: options.reason || 'Proxy data entry by sector admin',
        created_by: user.user.id,
        approved_by: options.autoApprove ? user.user.id : null,
        approved_at: options.autoApprove ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('data_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) throw error;

      // Log security event
      securityLogger.logDataAccess(
        'data_entries', 
        'write', 
        { 
          userId: user.user.id, 
          action: 'proxy_data_entry',
          schoolId: options.schoolId 
        }
      );

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
        message: error.message || 'Failed to create proxy data entry'
      };
    }
  }

  // Əlavə metodlar
  static async saveProxyFormData(
    schoolId: string,
    categoryId: string,
    formData: Record<string, any>
  ): Promise<ProxyDataEntryResult> {
    try {
      const results = [];
      for (const [columnId, value] of Object.entries(formData)) {
        const result = await this.createProxyDataEntry(columnId, value, {
          schoolId,
          categoryId,
          autoApprove: false
        });
        results.push(result);
      }

      const allSuccessful = results.every(r => r.success);
      return {
        success: allSuccessful,
        message: allSuccessful ? 'All data saved successfully' : 'Some data failed to save'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to save proxy form data'
      };
    }
  }

  static async submitProxyData(
    schoolId: string,
    categoryId: string,
    formData: Record<string, any>
  ): Promise<ProxyDataEntryResult> {
    try {
      const results = [];
      for (const [columnId, value] of Object.entries(formData)) {
        const result = await this.createProxyDataEntry(columnId, value, {
          schoolId,
          categoryId,
          autoApprove: true
        });
        results.push(result);
      }

      const allSuccessful = results.every(r => r.success);
      return {
        success: allSuccessful,
        message: allSuccessful ? 'All data submitted successfully' : 'Some data failed to submit'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to submit proxy data'
      };
    }
  }

  private static async getUserRole(userId: string): Promise<string> {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    return data?.role || 'user';
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
