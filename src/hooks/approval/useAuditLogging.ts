
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export const useAuditLogging = () => {
  const user = useAuthStore(selectUser);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Log an action to audit trail
  const logAction = useCallback(async (
    action: string,
    entityType: string,
    entityId: string,
    oldValue?: any,
    newValue?: any
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          old_value: oldValue,
          new_value: newValue
        });

      if (error) {
        console.error('Audit logging error:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }, [user?.id]);

  // Get audit logs with filtering
  const getAuditLogs = useCallback(async (filters?: {
    action?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          action,
          entity_type,
          entity_id,
          old_value,
          new_value,
          created_at,
          profiles!user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include user info
      const auditLogs: AuditLogEntry[] = data?.map(log => ({
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        old_value: log.old_value,
        new_value: log.new_value,
        created_at: log.created_at,
        user_name: log.profiles?.full_name || 'Unknown User',
        user_email: log.profiles?.email || 'Unknown Email'
      })) || [];

      return auditLogs;

    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Xəta',
        description: 'Audit logları yüklənərkən xəta baş verdi',
        variant: 'destructive'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Get audit statistics
  const getAuditStats = useCallback(async (dateFrom?: Date, dateTo?: Date) => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('action, entity_type, created_at');

      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: data?.length || 0,
        actionCounts: {} as Record<string, number>,
        entityTypeCounts: {} as Record<string, number>,
        dailyCounts: {} as Record<string, number>
      };

      data?.forEach(log => {
        // Count by action
        stats.actionCounts[log.action] = (stats.actionCounts[log.action] || 0) + 1;
        
        // Count by entity type
        stats.entityTypeCounts[log.entity_type] = (stats.entityTypeCounts[log.entity_type] || 0) + 1;
        
        // Count by day
        const day = new Date(log.created_at).toISOString().split('T')[0];
        stats.dailyCounts[day] = (stats.dailyCounts[day] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('Error fetching audit stats:', error);
      return {
        total: 0,
        actionCounts: {},
        entityTypeCounts: {},
        dailyCounts: {}
      };
    }
  }, []);

  // Log approval action
  const logApprovalAction = useCallback(async (
    action: 'approve' | 'reject' | 'bulk_approve' | 'auto_approve',
    itemId: string,
    itemType: 'school' | 'sector',
    oldStatus: string,
    newStatus: string,
    comment?: string
  ) => {
    await logAction(
      `${action}_${itemType}_data`,
      `${itemType}_data_entry`,
      itemId,
      { status: oldStatus },
      { status: newStatus, comment }
    );
  }, [logAction]);

  return {
    logAction,
    logApprovalAction,
    getAuditLogs,
    getAuditStats,
    isLoading
  };
};
