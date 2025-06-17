
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

  private static async getUserRole(userId: string): Promise<string> {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    return data?.role || 'user';
  }
}
