import { supabase } from '@/integrations/supabase/client';

/**
 * Status History Service for InfoLine
 * 
 * Bu servis status dəyişikliklərinin tarixçəsini idarə edir və
 * Security Advisor tələblərinə uyğun secure əməliyyatlar həyata keçirir.
 */

export interface StatusHistoryEntry {
  id: string;
  data_entry_id: string;
  old_status: string;
  new_status: string;
  comment: string | null;
  changed_at: string;
  changed_by: string;
  metadata: any;
  changed_by_name: string;
  changed_by_email: string;
}

export interface StatusHistoryOptions {
  entryId?: string;
  limit?: number;
}

export interface StatusHistoryServiceResponse {
  success: boolean;
  data?: StatusHistoryEntry[];
  message?: string;
  error?: string;
}

/**
 * StatusHistoryService - Status tarixçəsini idarə edən əsas sinif
 */
export class StatusHistoryService {
  
  /**
   * Status tarixçəsini secure function vasitəsilə əldə edir
   */
  static async getStatusHistory(options: StatusHistoryOptions = {}): Promise<StatusHistoryServiceResponse> {
    try {
      const { data, error } = await supabase
        .rpc('get_status_history_secure', {
          entry_id: options.entryId || null,
          limit_count: options.limit || 50
        });

      if (error) {
        console.error('Error fetching status history:', error);
        // Fallback to view method
        return this.getStatusHistoryFromView(options);
      }

      return {
        success: true,
        data: data || [],
        message: 'Status history retrieved successfully'
      };
    } catch (error: any) {
      console.error('StatusHistoryService error:', error);
      // Try fallback method
      return this.getStatusHistoryFromView(options);
    }
  }

  /**
   * Fallback: View vasitəsilə status tarixçəsini əldə edir
   */
  static async getStatusHistoryFromView(options: StatusHistoryOptions = {}): Promise<StatusHistoryServiceResponse> {
    try {
      let query = supabase
        .from('status_history_view')
        .select('*')
        .order('changed_at', { ascending: false });

      // Entry filter əlavə et
      if (options.entryId) {
        query = query.eq('data_entry_id', options.entryId);
      }

      // Limit əlavə et
      query = query.limit(options.limit || 50);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching from view:', error);
        return {
          success: false,
          error: `Failed to fetch from view: ${error.message}`,
          message: 'Status history could not be retrieved'
        };
      }

      return {
        success: true,
        data: data || [],
        message: 'Status history retrieved from view successfully'
      };
    } catch (error: any) {
      console.error('View access error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error accessing status history',
        message: 'Failed to retrieve status history'
      };
    }
  }

  /**
   * Müəyyən data entry üçün status tarixçəsini əldə edir
   */
  static async getEntryStatusHistory(entryId: string): Promise<StatusHistoryServiceResponse> {
    // ID formatını yoxla (UUID və ya VARCHAR)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // Convert UUID to string if needed
    const processedEntryId = uuidRegex.test(entryId) ? entryId : entryId.toString();
    
    return this.getStatusHistory({ 
      entryId: processedEntryId, 
      limit: 100 
    });
  }

  /**
   * Son status dəyişikliklərini əldə edir (dashboard üçün)
   */
  static async getRecentStatusChanges(limit: number = 20): Promise<StatusHistoryServiceResponse> {
    return this.getStatusHistory({ limit });
  }

  /**
   * Status dəyişikliyi qeydə alır
   */
  static async logStatusChange(
    dataEntryId: string,
    oldStatus: string,
    newStatus: string,
    comment?: string
  ): Promise<StatusHistoryServiceResponse> {
    try {
      const { data, error } = await supabase
        .rpc('log_status_change', {
          p_data_entry_id: dataEntryId,
          p_old_status: oldStatus,
          p_new_status: newStatus,
          p_comment: comment || null
        });

      if (error) {
        console.error('Error logging status change:', error);
        // Fallback to direct insert
        return this.logStatusChangeDirect(dataEntryId, oldStatus, newStatus, comment);
      }

      return {
        success: true,
        data: [{ id: data } as StatusHistoryEntry],
        message: 'Status change logged successfully'
      };
    } catch (error: any) {
      console.error('Error in logStatusChange:', error);
      return this.logStatusChangeDirect(dataEntryId, oldStatus, newStatus, comment);
    }
  }

  /**
   * Direct insert fallback for status logging
   */
  private static async logStatusChangeDirect(
    dataEntryId: string,
    oldStatus: string,
    newStatus: string,
    comment?: string
  ): Promise<StatusHistoryServiceResponse> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        return {
          success: false,
          error: 'No authenticated user',
          message: 'Failed to log status change - authentication required'
        };
      }

      const { data, error } = await supabase
        .from('status_transition_log')
        .insert({
          data_entry_id: dataEntryId,
          old_status: oldStatus,
          new_status: newStatus,
          comment: comment || null,
          changed_by: currentUser.user.id,
          changed_at: new Date().toISOString(),
          metadata: {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error in direct status logging:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to log status change directly'
        };
      }

      return {
        success: true,
        data: [data],
        message: 'Status change logged directly'
      };
    } catch (error: any) {
      console.error('Error in direct logging fallback:', error);
      return {
        success: false,
        error: error.message || 'Unknown error in direct logging',
        message: 'Failed to log status change'
      };
    }
  }

  /**
   * Status tarixçəsini Excel formatında export edir
   */
  static async exportStatusHistory(
    options: StatusHistoryOptions = {}
  ): Promise<StatusHistoryServiceResponse> {
    try {
      const historyResult = await this.getStatusHistory({
        ...options,
        limit: 1000 // Export üçün daha çox məlumat
      });

      if (!historyResult.success || !historyResult.data) {
        return historyResult;
      }

      // Transform data for Excel export
      const exportData = historyResult.data.map(entry => ({
        'Entry ID': entry.data_entry_id,
        'Old Status': entry.old_status,
        'New Status': entry.new_status,
        'Comment': entry.comment || '',
        'Changed At': new Date(entry.changed_at).toLocaleString('az-AZ'),
        'Changed By': entry.changed_by_name,
        'Email': entry.changed_by_email
      }));

      return {
        success: true,
        data: exportData as any,
        message: 'Status history prepared for export'
      };
    } catch (error: any) {
      console.error('Error exporting status history:', error);
      return {
        success: false,
        error: error.message || 'Unknown error during export',
        message: 'Failed to export status history'
      };
    }
  }

  /**
   * Status statistikalarını əldə edir
   */
  static async getStatusStatistics(): Promise<StatusHistoryServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('status_history_view')
        .select('new_status, old_status, changed_at');

      if (error) {
        console.error('Error fetching status statistics:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to fetch status statistics'
        };
      }

      // Calculate statistics
      const stats = {
        totalTransitions: data?.length || 0,
        statusCounts: {} as Record<string, number>,
        transitionCounts: {} as Record<string, number>,
        todayTransitions: 0,
        weeklyTransitions: 0
      };

      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      data?.forEach(entry => {
        // Count status occurrences
        stats.statusCounts[entry.new_status] = (stats.statusCounts[entry.new_status] || 0) + 1;
        
        // Count transition types
        const transitionKey = `${entry.old_status}_to_${entry.new_status}`;
        stats.transitionCounts[transitionKey] = (stats.transitionCounts[transitionKey] || 0) + 1;
        
        // Count recent transitions
        const changeDate = new Date(entry.changed_at);
        if (changeDate.toDateString() === today.toDateString()) {
          stats.todayTransitions++;
        }
        if (changeDate >= weekAgo) {
          stats.weeklyTransitions++;
        }
      });

      return {
        success: true,
        data: [stats] as any,
        message: 'Status statistics calculated successfully'
      };
    } catch (error: any) {
      console.error('Error calculating status statistics:', error);
      return {
        success: false,
        error: error.message || 'Unknown error calculating statistics',
        message: 'Failed to calculate status statistics'
      };
    }
  }

  /**
   * Status dəyişikliklərini filter edir
   */
  static async getFilteredStatusHistory(
    filters: {
      startDate?: string;
      endDate?: string;
      status?: string;
      userId?: string;
      entryId?: string;
    },
    limit: number = 50
  ): Promise<StatusHistoryServiceResponse> {
    try {
      let query = supabase
        .from('status_history_view')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (filters.startDate) {
        query = query.gte('changed_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('changed_at', filters.endDate);
      }
      if (filters.status) {
        query = query.eq('new_status', filters.status);
      }
      if (filters.userId) {
        query = query.eq('changed_by', filters.userId);
      }
      if (filters.entryId) {
        query = query.eq('data_entry_id', filters.entryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching filtered status history:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to fetch filtered status history'
        };
      }

      return {
        success: true,
        data: data || [],
        message: 'Filtered status history retrieved successfully'
      };
    } catch (error: any) {
      console.error('Error in filtered status history:', error);
      return {
        success: false,
        error: error.message || 'Unknown error in filtering',
        message: 'Failed to retrieve filtered status history'
      };
    }
  }

  /**
   * Database connection test
   */
  static async testConnection(): Promise<StatusHistoryServiceResponse> {
    try {
      // Test function availability
      const { data: functionTest, error: functionError } = await supabase
        .rpc('get_status_history_secure', {
          entry_id: null,
          limit_count: 1
        });

      // Test view availability
      const { data: viewTest, error: viewError } = await supabase
        .from('status_history_view')
        .select('count')
        .limit(1);

      const tests = {
        function_available: !functionError,
        view_available: !viewError,
        function_data: functionTest?.length || 0,
        view_data: viewTest?.length || 0,
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        data: [tests] as any,
        message: 'Connection test completed'
      };
    } catch (error: any) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        error: error.message || 'Unknown connection error',
        message: 'Connection test failed'
      };
    }
  }
}

export default StatusHistoryService;
