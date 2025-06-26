
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  DashboardFormStats,
  DashboardStats
} from '@/types/dashboard';

export const useRealDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);

  const fetchSuperAdminData = async (): Promise<SuperAdminDashboardData> => {
    try {
      // Fetch counts
      const [regionsResult, sectorsResult, schoolsResult, usersResult] = await Promise.all([
        supabase.from('regions').select('*', { count: 'exact', head: true }),
        supabase.from('sectors').select('*', { count: 'exact', head: true }),
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      // Fetch form statistics
      const { data: formStatsData } = await supabase
        .from('data_entries')
        .select('status')
        .in('status', ['pending', 'approved', 'rejected', 'draft']);

      const formsByStatus = {
        pending: formStatsData?.filter(f => f.status === 'pending').length || 0,
        approved: formStatsData?.filter(f => f.status === 'approved').length || 0,
        rejected: formStatsData?.filter(f => f.status === 'rejected').length || 0,
        total: formStatsData?.length || 0
      };

      const completionRate = formsByStatus.total > 0 
        ? Math.round((formsByStatus.approved / formsByStatus.total) * 100)
        : 0;

      // Fetch regions with basic info
      const { data: regionsData } = await supabase
        .from('regions')
        .select(`
          id, 
          name, 
          admin_email,
          sectors(id)
        `);

      const stats: DashboardStats = {
        totalEntries: formsByStatus.total,
        completedEntries: formsByStatus.approved,
        pendingEntries: formsByStatus.pending,
        approvedEntries: formsByStatus.approved,
        rejectedEntries: formsByStatus.rejected,
        completed: formsByStatus.approved,
        pending: formsByStatus.pending
      };

      const forms: DashboardFormStats = {
        totalForms: formsByStatus.total,
        pendingApprovals: formsByStatus.pending,
        rejectedForms: formsByStatus.rejected,
        total: formsByStatus.total,
        pending: formsByStatus.pending,
        approved: formsByStatus.approved,
        rejected: formsByStatus.rejected,
        draft: 0,
        dueSoon: 0,
        overdue: 0,
        percentage: completionRate,
        completion_rate: completionRate,
        completionRate: completionRate,
        completedForms: formsByStatus.approved,
        pendingForms: formsByStatus.pending,
        approvalRate: completionRate,
        completed: formsByStatus.approved
      };

      return {
        totalUsers: usersResult.count || 0,
        totalSchools: schoolsResult.count || 0,
        totalCategories: 0,
        pendingApprovals: formsByStatus.pending,
        completionRate,
        stats,
        forms,
        userCount: usersResult.count || 0,
        totalRegions: regionsResult.count || 0,
        formsByStatus,
        approvalRate: completionRate,
        regions: regionsData?.map(region => ({
          ...region,
          sectorCount: region.sectors?.length || 0
        })) || []
      };
    } catch (error) {
      console.error('Error fetching super admin data:', error);
      throw error;
    }
  };

  const fetchRegionAdminData = async (): Promise<RegionAdminDashboardData> => {
    try {
      if (!user?.region_id) {
        throw new Error('Region ID not found for region admin');
      }

      // Fetch sectors in this region
      const { data: sectorsData } = await supabase
        .from('sectors')
        .select(`
          id,
          name,
          completion_rate,
          schools(id, completion_rate)
        `)
        .eq('region_id', user.region_id);

      // Fetch form statistics for this region
      const { data: formStatsData } = await supabase
        .from('data_entries')
        .select(`
          status,
          schools!inner(region_id)
        `)
        .eq('schools.region_id', user.region_id);

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
        totalSectors: sectorsData?.length || 0,
        totalSchools: sectorsData?.reduce((sum, sector) => sum + (sector.schools?.length || 0), 0) || 0,
        pendingApprovals: pendingEntries,
        completionRate,
        stats,
        forms
      };
    } catch (error) {
      console.error('Error fetching region admin data:', error);
      throw error;
    }
  };

  const fetchSectorAdminData = async (): Promise<SectorAdminDashboardData> => {
    try {
      if (!user?.sector_id) {
        throw new Error('Sector ID not found for sector admin');
      }

      // Fetch schools in this sector
      const { data: schoolsData } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          completion_rate
        `)
        .eq('sector_id', user.sector_id);

      // Fetch form statistics for this sector
      const { data: formStatsData } = await supabase
        .from('data_entries')
        .select(`
          status,
          schools!inner(sector_id)
        `)
        .eq('schools.sector_id', user.sector_id);

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
        totalSchools: schoolsData?.length || 0,
        pendingApprovals: pendingEntries,
        completionRate,
        stats,
        forms
      };
    } catch (error) {
      console.error('Error fetching sector admin data:', error);
      throw error;
    }
  };

  const fetchSchoolAdminData = async (): Promise<SchoolAdminDashboardData> => {
    try {
      if (!user?.school_id) {
        console.warn('⚠️ [Dashboard] School ID not found for school admin', {
          userId: user?.id,
          userRole: user?.role
        });
        
        // Test məlumatları qaytaraq - xəta atmaq əvəzinə
        return {
          totalForms: 0,
          completedForms: 0,
          pendingForms: 0,
          stats: {
            totalEntries: 0,
            completedEntries: 0,
            pendingEntries: 0,
            approvedEntries: 0,
            rejectedEntries: 0,
            completed: 0,
            pending: 0
          },
          forms: {
            totalForms: 0,
            pendingApprovals: 0,
            rejectedForms: 0,
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            draft: 0,
            dueSoon: 0,
            overdue: 0,
            completionRate: 0,
            percentage: 0,
            completion_rate: 0,
            completedForms: 0,
            pendingForms: 0,
            approvalRate: 0,
            completed: 0
          }
        };
      }

      // Fetch form statistics for this school
      const { data: formStatsData } = await supabase
        .from('data_entries')
        .select('status')
        .eq('school_id', user.school_id);

      const totalEntries = formStatsData?.length || 0;
      const approvedEntries = formStatsData?.filter(f => f.status === 'approved').length || 0;
      const pendingEntries = formStatsData?.filter(f => f.status === 'pending').length || 0;
      const rejectedEntries = formStatsData?.filter(f => f.status === 'rejected').length || 0;
      const draftEntries = formStatsData?.filter(f => f.status === 'draft').length || 0;

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
        draft: draftEntries,
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
        totalForms: totalEntries,
        completedForms: approvedEntries,
        pendingForms: pendingEntries,
        stats,
        forms
      };
    } catch (error) {
      console.error('Error fetching school admin data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !userRole) return;

      setLoading(true);
      setError(null);

      try {
        let data: any;

        switch (userRole) {
          case 'superadmin':
            data = await fetchSuperAdminData();
            break;
          case 'regionadmin':
            data = await fetchRegionAdminData();
            break;
          case 'sectoradmin':
            data = await fetchSectorAdminData();
            break;
          case 'schooladmin':
            data = await fetchSchoolAdminData();
            break;
          default:
            throw new Error(`Unsupported user role: ${userRole}`);
        }

        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, userRole]);

  return {
    dashboardData,
    loading,
    error,
    refetch: () => {
      if (user && userRole) {
        setLoading(true);
        // The useEffect will trigger the refetch
      }
    }
  };
};
