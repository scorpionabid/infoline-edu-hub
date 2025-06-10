
import { supabase } from '@/integrations/supabase/client';
import { UnifiedDataEntry } from './unifiedDataEntry';

export interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  entries: UnifiedDataEntry[];
}

export interface BatchApprovalRequest {
  itemIds: string[];
  action: 'approve' | 'reject';
  reason?: string;
  userId: string;
}

export class ApprovalService {
  /**
   * Get pending approvals for current user
   */
  static async getPendingApprovals(
    userRole: string,
    entityId?: string
  ): Promise<ApprovalItem[]> {
    try {
      let query = supabase
        .from('data_entries')
        .select(`
          *,
          categories(name),
          schools(name),
          columns(name, type)
        `)
        .eq('status', 'pending');

      // Filter based on user role
      if (userRole === 'regionadmin' && entityId) {
        query = query.in('school_id', 
          supabase.from('schools').select('id').eq('region_id', entityId)
        );
      } else if (userRole === 'sectoradmin' && entityId) {
        query = query.in('school_id',
          supabase.from('schools').select('id').eq('sector_id', entityId)
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by category and school
      const groupedData: Record<string, ApprovalItem> = {};
      
      data?.forEach((entry: any) => {
        const key = `${entry.category_id}-${entry.school_id}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            id: key,
            categoryId: entry.category_id,
            categoryName: entry.categories?.name || 'Unknown',
            schoolId: entry.school_id,
            schoolName: entry.schools?.name || 'Unknown',
            status: entry.status,
            submittedBy: entry.created_by,
            submittedAt: entry.created_at,
            entries: []
          };
        }
        
        groupedData[key].entries.push(entry);
      });

      return Object.values(groupedData);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  /**
   * Approve or reject data entries
   */
  static async processApproval({
    itemIds,
    action,
    reason,
    userId
  }: BatchApprovalRequest): Promise<void> {
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        updated_at: new Date().toISOString()
      };

      if (action === 'approve') {
        updateData.approved_by = userId;
        updateData.approved_at = new Date().toISOString();
      } else {
        updateData.rejected_by = userId;
        updateData.rejected_at = new Date().toISOString();
        if (reason) {
          updateData.rejection_reason = reason;
        }
      }

      // Update entries
      const { error } = await supabase
        .from('data_entries')
        .update(updateData)
        .in('id', itemIds);

      if (error) throw error;

    } catch (error) {
      console.error('Error processing approval:', error);
      throw error;
    }
  }

  /**
   * Get approval statistics
   */
  static async getApprovalStats(
    userRole: string,
    entityId?: string
  ): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      let query = supabase
        .from('data_entries')
        .select('status', { count: 'exact' });

      // Apply role-based filtering
      if (userRole === 'regionadmin' && entityId) {
        query = query.in('school_id',
          supabase.from('schools').select('id').eq('region_id', entityId)
        );
      } else if (userRole === 'sectoradmin' && entityId) {
        query = query.in('school_id',
          supabase.from('schools').select('id').eq('sector_id', entityId)
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const stats = data?.reduce((acc: any, entry: any) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        total: count || 0,
        pending: stats.pending || 0,
        approved: stats.approved || 0,
        rejected: stats.rejected || 0
      };
    } catch (error) {
      console.error('Error fetching approval stats:', error);
      throw error;
    }
  }
}
