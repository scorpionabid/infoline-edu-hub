
import { supabase } from '@/integrations/supabase/client';
import { DataEntryFormData, DataEntryStatus, SaveResult } from '@/types/dataEntry';
import { getSafeUUID } from '@/utils/uuidValidator';

export interface ProxyDataEntryData {
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  proxy_created_by: string;
  proxy_reason: string;
  proxy_original_entity: string;
}

export class ProxyDataEntryService {
  static async saveProxyData(data: ProxyDataEntryData): Promise<SaveResult & { proxyInfo?: any }> {
    try {
      if (!data.school_id || !data.category_id || !data.column_id || !data.value || !data.proxy_created_by || !data.proxy_reason || !data.proxy_original_entity) {
        console.warn('Incomplete proxy data:', data);
        return {
          success: false,
          error: 'Incomplete proxy data provided',
          savedCount: 0
        };
      }

      const entryData = {
        school_id: data.school_id,
        category_id: data.category_id,
        column_id: data.column_id,
        value: data.value,
        status: 'pending' as DataEntryStatus,
        proxy_created_by: data.proxy_created_by,
        proxy_reason: data.proxy_reason,
        proxy_original_entity: data.proxy_original_entity,
        created_by: data.proxy_created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('data_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        savedCount: 1,
        proxyInfo: {
          proxy_created_by: data.proxy_created_by,
          proxy_reason: data.proxy_reason
        }
      };
    } catch (error) {
      console.error('Error saving proxy data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save proxy data',
        savedCount: 0
      };
    }
  }

  static async saveProxyFormData(formData: Record<string, any>, options: {
    schoolId: string;
    categoryId: string;
    proxyUserId: string;
    proxyReason: string;
    proxyOriginalEntity: string;
  }): Promise<SaveResult & { proxyInfo?: any }> {
    try {
      const entries = Object.entries(formData).map(([columnId, value]) => ({
        school_id: options.schoolId,
        category_id: options.categoryId,
        column_id: columnId,
        value: value?.toString() || '',
        proxy_created_by: options.proxyUserId,
        proxy_reason: options.proxyReason,
        proxy_original_entity: options.proxyOriginalEntity
      }));

      const results = await Promise.all(
        entries.map(entry => this.saveProxyData(entry))
      );

      const successfulSaves = results.filter(r => r.success).length;
      const hasErrors = results.some(r => !r.success);

      return {
        success: !hasErrors,
        savedCount: successfulSaves,
        error: hasErrors ? 'Some entries failed to save' : undefined,
        proxyInfo: {
          proxy_created_by: options.proxyUserId,
          proxy_reason: options.proxyReason
        }
      };
    } catch (error) {
      console.error('Error saving proxy form data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save proxy form data',
        savedCount: 0
      };
    }
  }

  static async submitProxyData(schoolId: string, categoryId: string, proxyUserId: string): Promise<SaveResult & { submittedCount?: number }> {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update({
          status: 'pending' as DataEntryStatus,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('proxy_created_by', proxyUserId)
        .eq('status', 'draft')
        .select();

      if (error) throw error;

      return {
        success: true,
        savedCount: data?.length || 0,
        submittedCount: data?.length || 0
      };
    } catch (error) {
      console.error('Error submitting proxy data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit proxy data',
        savedCount: 0
      };
    }
  }

  static async autoApproveProxyData(schoolId: string, categoryId: string, proxyUserId: string): Promise<SaveResult & { autoApproved?: boolean }> {
    try {
      if (!schoolId || !categoryId || !proxyUserId) {
        console.warn('Incomplete data for auto-approval:', { schoolId, categoryId, proxyUserId });
        return {
          success: false,
          error: 'Incomplete data for auto-approval',
          savedCount: 0
        };
      }

      const { data, error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved' as DataEntryStatus,
          approved_by: proxyUserId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('proxy_created_by', proxyUserId)
        .eq('status', 'pending')
        .select();

      if (error) throw error;

      // Call the RPC function with correct signature
      await supabase.rpc('auto_approve_proxy_data', {
        p_school_id: schoolId,
        p_category_id: categoryId,
        p_proxy_user_id: proxyUserId
      });

      return {
        success: true,
        savedCount: data?.length || 0,
        autoApproved: true
      };
    } catch (error) {
      console.error('Error auto-approving proxy data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to auto-approve proxy data',
        savedCount: 0
      };
    }
  }

  static async getDataEntriesByProxyUser(proxyUserId: string): Promise<DataEntryFormData[]> {
    try {
      if (!proxyUserId) {
        console.warn('Proxy user ID is missing');
        return [];
      }

      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('proxy_created_by', proxyUserId);

      if (error) {
        console.error('Error fetching data entries by proxy user:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDataEntriesByProxyUser:', error);
      return [];
    }
  }
}
