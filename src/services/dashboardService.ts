import { supabase } from '@/integrations/supabase/client';
import { DashboardFormStats, SuperAdminDashboardData, RegionAdminDashboardData } from '@/types/dashboard';

export const dashboardService = {
  async getSuperAdminStats(): Promise<SuperAdminDashboardData> {
    try {
      const stats: DashboardFormStats = {
        totalForms: 0,
        completedForms: 0,
        pendingApprovals: 0,
        rejectedForms: 0,
        totalRegions: 0,
        totalSectors: 0,
        totalSchools: 0
      };

      const { data: totalFormsData, error: totalFormsError } = await supabase
        .from('categories')
        .select('count(*)');

      if (totalFormsError) {
        console.error('Error fetching total forms count:', totalFormsError);
      } else {
        stats.totalForms = totalFormsData ? parseInt(totalFormsData[0].count, 10) : 0;
      }

      const { data: completedFormsData, error: completedFormsError } = await supabase
        .from('data_entries')
        .select('count(*)')
        .eq('status', 'approved');

      if (completedFormsError) {
        console.error('Error fetching completed forms count:', completedFormsError);
      } else {
        stats.completedForms = completedFormsData ? parseInt(completedFormsData[0].count, 10) : 0;
      }

      const { data: pendingApprovalsData, error: pendingApprovalsError } = await supabase
        .from('data_entries')
        .select('count(*)')
        .eq('status', 'pending');

      if (pendingApprovalsError) {
        console.error('Error fetching pending approvals count:', pendingApprovalsError);
      } else {
        stats.pendingApprovals = pendingApprovalsData ? parseInt(pendingApprovalsData[0].count, 10) : 0;
      }

      const { data: rejectedFormsData, error: rejectedFormsError } = await supabase
        .from('data_entries')
        .select('count(*)')
        .eq('status', 'rejected');

      if (rejectedFormsError) {
        console.error('Error fetching rejected forms count:', rejectedFormsError);
      } else {
        stats.rejectedForms = rejectedFormsData ? parseInt(rejectedFormsData[0].count, 10) : 0;
      }

      const regionAdminStats: DashboardFormStats = {
        totalForms: 0,
        completedForms: 0,
        pendingApprovals: 0,
        rejectedForms: 0,
        totalSectors: 0
      };

      const schoolAdminStats: DashboardFormStats = {
        totalForms: 0,
        completedForms: 0, 
        pendingApprovals: 0,
        rejectedForms: 0,
        totalSchools: 0
      };

      return {
        stats,
        totalRegions: 0,
        totalSectors: 0,
        totalSchools: 0,
        totalUsers: 0,
        regionStats: [],
        approvalRate: 0,
        completionRate: 0,
        regions: [],
        pendingApprovals: [],
        notifications: [],
        formsByStatus: {}
      };
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
      throw error;
    }
  },

  async getRegionAdminStats(regionId: string): Promise<RegionAdminDashboardData> {
    try {
      const formStats: DashboardFormStats = {
        totalForms: 0,
        completedForms: 0,
        pendingApprovals: 0,
        rejectedForms: 0
      };

      return {
        stats: formStats,
        formStats,
        pendingItems: [],
        categories: [],
        sectors: [],
        notifications: [],
        completionRate: 0
      };
    } catch (error) {
      console.error('Error fetching region admin stats:', error);
      throw error;
    }
  }
};
