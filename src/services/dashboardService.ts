
import { supabase } from '@/integrations/supabase/client';
import { DashboardFormStats, SuperAdminDashboardData, RegionAdminDashboardData, DashboardStats } from '@/types/dashboard';

export const dashboardService = {
  async getSuperAdminStats(): Promise<SuperAdminDashboardData> {
    try {
      // Get basic counts
      const [regionsResult, sectorsResult, schoolsResult, usersResult] = await Promise.all([
        supabase.from('regions').select('*', { count: 'exact', head: true }),
        supabase.from('sectors').select('*', { count: 'exact', head: true }),
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      // Get form statistics
      const { data: formStatsData } = await supabase
        .from('data_entries')
        .select('status');

      const totalEntries = formStatsData?.length || 0;
      const approvedEntries = formStatsData?.filter(f => f.status === 'approved').length || 0;
      const pendingEntries = formStatsData?.filter(f => f.status === 'pending').length || 0;
      const rejectedEntries = formStatsData?.filter(f => f.status === 'rejected').length || 0;

      const completionRate = totalEntries > 0 
        ? Math.round((approvedEntries / totalEntries) * 100)
        : 0;

      const stats: DashboardStats = {
        totalEntries,
        completedEntries: approvedEntries,
        pendingEntries,
        approvedEntries,
        rejectedEntries,
        completed: approvedEntries,
        pending: pendingEntries
      };

      const forms: DashboardFormStats = {
        totalForms: totalEntries,
        pendingApprovals: pendingEntries,
        rejectedForms: rejectedEntries,
        total: totalEntries,
        pending: pendingEntries,
        approved: approvedEntries,
        rejected: rejectedEntries,
        draft: 0,
        dueSoon: 0,
        overdue: 0,
        percentage: completionRate,
        completion_rate: completionRate,
        completionRate: completionRate,
        completedForms: approvedEntries,
        pendingForms: pendingEntries,
        approvalRate: completionRate,
        completed: approvedEntries
      };

      // Fetch regions with basic info
      const { data: regionsData } = await supabase
        .from('regions')
        .select(`
          id, 
          name, 
          admin_email,
          sectors(id)
        `);

      return {
        totalUsers: usersResult.count || 0,
        totalSchools: schoolsResult.count || 0,
        totalCategories: 0,
        pendingApprovals: pendingEntries,
        completionRate,
        stats,
        forms,
        userCount: usersResult.count || 0,
        totalRegions: regionsResult.count || 0,
        formsByStatus: {
          total: totalEntries,
          pending: pendingEntries,
          approved: approvedEntries,
          rejected: rejectedEntries
        },
        approvalRate: completionRate,
        regions: regionsData?.map(region => ({
          ...region,
          sectorCount: region.sectors?.length || 0
        })) || []
      };
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
      throw error;
    }
  },

  async getRegionAdminStats(regionId: string): Promise<RegionAdminDashboardData> {
    try {
      // Get basic counts for the region
      const [sectorsResult, schoolsResult] = await Promise.all([
        supabase.from('sectors').select('*', { count: 'exact', head: true }).eq('region_id', regionId),
        supabase.from('schools').select('*', { count: 'exact', head: true }).eq('region_id', regionId)
      ]);

      // Get form statistics for this region
      const { data: formStatsData } = await supabase
        .from('data_entries')
        .select(`
          status,
          schools!inner(region_id)
        `)
        .eq('schools.region_id', regionId);

      const totalEntries = formStatsData?.length || 0;
      const approvedEntries = formStatsData?.filter(f => f.status === 'approved').length || 0;
      const pendingEntries = formStatsData?.filter(f => f.status === 'pending').length || 0;
      const rejectedEntries = formStatsData?.filter(f => f.status === 'rejected').length || 0;

      const completionRate = totalEntries > 0 
        ? Math.round((approvedEntries / totalEntries) * 100)
        : 0;

      const stats: DashboardStats = {
        totalEntries,
        completedEntries: approvedEntries,
        pendingEntries,
        approvedEntries,
        rejectedEntries,
        completed: approvedEntries,
        pending: pendingEntries
      };

      const forms: DashboardFormStats = {
        totalForms: totalEntries,
        pendingApprovals: pendingEntries,
        rejectedForms: rejectedEntries,
        total: totalEntries,
        pending: pendingEntries,
        approved: approvedEntries,
        rejected: rejectedEntries,
        draft: 0,
        dueSoon: 0,
        overdue: 0,
        percentage: completionRate,
        completion_rate: completionRate,
        completionRate: completionRate,
        completedForms: approvedEntries,
        pendingForms: pendingEntries,
        approvalRate: completionRate,
        completed: approvedEntries
      };

      return {
        totalSectors: sectorsResult.count || 0,
        totalSchools: schoolsResult.count || 0,
        pendingApprovals: pendingEntries,
        completionRate,
        stats,
        // forms
      };
    } catch (error) {
      console.error('Error fetching region admin stats:', error);
      throw error;
    }
  }
};
