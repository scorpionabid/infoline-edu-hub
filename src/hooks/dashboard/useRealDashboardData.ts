
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  DashboardFormStats,
  DashboardStats  // DashboardStats importunu aktiv etdik
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
        pending: formsByStatus.pending,
        pendingFormCount: formsByStatus.pending,
        schoolCount: schoolsResult.count || 0,
        activeUserCount: usersResult.count || 0,
        completionPercentage: completionRate
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
          schools!inner(region_id, sector_id)
        `)
        .eq('schools.region_id', user.region_id);

      const totalEntries = formStatsData?.length || 0;
      const approvedEntries = formStatsData?.filter(f => f.status === 'approved').length || 0;
      const pendingEntries = formStatsData?.filter(f => f.status === 'pending').length || 0;
      const rejectedEntries = formStatsData?.filter(f => f.status === 'rejected').length || 0;

      const completionRate = totalEntries > 0 
        ? Math.round((approvedEntries / totalEntries) * 100)
        : 0;

      // Calculate sector statistics
      const sectorsWithStats = await Promise.all(
        (sectorsData || []).map(async (sector) => {
          // Get schools in this sector
          const schoolsInSector = sector.schools || [];
          
          // Get form entries for this sector
          const sectorEntries = formStatsData?.filter(entry => 
            entry.schools?.sector_id === sector.id
          ) || [];
          
          const sectorApproved = sectorEntries.filter(e => e.status === 'approved').length;
          const sectorPending = sectorEntries.filter(e => e.status === 'pending').length;
          const sectorTotal = sectorEntries.length;
          
          const sectorCompletionRate = sectorTotal > 0 
            ? Math.round((sectorApproved / sectorTotal) * 100)
            : 0;

          return {
            id: sector.id,
            name: sector.name,
            schoolCount: schoolsInSector.length,
            totalSchools: schoolsInSector.length,
            completionRate: sectorCompletionRate,
            completion: sectorCompletionRate,
            completion_rate: sectorCompletionRate,
            pendingApprovals: sectorPending,
            totalForms: sectorTotal,
            completedForms: sectorApproved,
            lastActivity: new Date().toISOString()
          };
        })
      );

      const stats: DashboardStats = {
        totalEntries,
        completedEntries: approvedEntries,
        pendingEntries,
        approvedEntries,
        rejectedEntries,
        completed: approvedEntries,
        pending: pendingEntries,
        pendingFormCount: pendingEntries,
        schoolCount: sectorsData?.reduce((sum, sector) => sum + (sector.schools?.length || 0), 0) || 0,
        activeUserCount: 0,
        completionPercentage: completionRate
      };

      return {
        totalSectors: sectorsData?.length || 0,
        totalSchools: sectorsData?.reduce((sum, sector) => sum + (sector.schools?.length || 0), 0) || 0,
        pendingApprovals: pendingEntries,
        completionRate,
        stats,
        sectors: sectorsWithStats
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

      console.log('Fetching sector admin data for sector:', user.sector_id);

      // 1. Əvvəlcə sektor məlumatlarını əldə edirik
      const { data: sectorData, error: sectorError } = await supabase
        .from('sectors')
        .select(`
          id,
          name,
          region_id
        `)
        .eq('id', user.sector_id || '')
        .maybeSingle(); // .single() əvəzinə .maybeSingle() istifadə edirik

      if (sectorError) {
        console.error('Sector data error:', sectorError);
        throw sectorError;
      }

      // Sektor tapılmadığı halda boş məlumatlar qaytarırıq
      if (!sectorData) {
        console.warn('No sector found with ID:', user.sector_id);
        // SectorAdminDashboardData tipinə uyğun boş məlumat qaytarırıq
        return {
          totalSchools: 0,
          pendingApprovals: 0,
          completionRate: 0,
          stats: { totalEntries: 0, completedEntries: 0, pendingEntries: 0, approvedEntries: 0, rejectedEntries: 0, completed: 0, pending: 0 },
          summary: { total: 0, completed: 0, pending: 0, rejected: 0, approved: 0, completionRate: 0, approvalRate: 0, draft: 0, dueSoon: 0, overdue: 0 },
          totalRequiredColumns: 0,
          totalPossibleEntries: 0
        };
      }
      
      // 2. Sektora aid məktəbləri əldə edirik
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          completion_rate,
          status
        `)
        .eq('sector_id', user.sector_id || '');

      if (schoolsError) {
        console.error('Schools data error:', schoolsError);
        throw schoolsError;
      }

      // 2. Bütün aktiv kateqoriyaları və sütunları əldə edirik
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          status,
          columns(id, is_required, status)
        `)
        .eq('status', 'active')

      if (categoriesError) {
        console.error('Categories data error:', categoriesError);
        throw categoriesError;
      }

      // 3. Calculate total required columns across all active categories
      const totalRequiredColumns = categoriesData?.reduce((total, category) => {
        const requiredColumns = category.columns?.filter(col => 
          col.is_required && col.status === 'active'
        ).length || 0;
        return total + requiredColumns;
      }, 0) || 0;

      console.log('Total required columns in sector:', totalRequiredColumns);

      // 4. Fetch form statistics for ALL schools in this sector
      const schoolIds = schoolsData?.map(s => s.id) || [];
      
      if (schoolIds.length === 0) {
        console.warn('No schools found for sector:', user.sector_id);
      }

      const { data: formStatsData, error: formStatsError } = await supabase
        .from('data_entries')
        .select('school_id, status, column_id, created_at, updated_at')
        .in('school_id', schoolIds);

      if (formStatsError) {
        console.error('Form stats error:', formStatsError);
        throw formStatsError;
      }

      console.log('Form entries found:', formStatsData?.length || 0);

      // 5. Calculate comprehensive statistics
      const totalEntries = formStatsData?.length || 0;
      const approvedEntries = formStatsData?.filter(f => f.status === 'approved').length || 0;
      const pendingEntries = formStatsData?.filter(f => f.status === 'pending').length || 0;
      const rejectedEntries = formStatsData?.filter(f => f.status === 'rejected').length || 0;

      // 6. Calculate sector-wide completion rate
      // This is based on: (approved entries) / (total required entries for all schools)
      const totalPossibleEntries = schoolIds.length * totalRequiredColumns;
      const sectorCompletionRate = totalPossibleEntries > 0 
        ? Math.round((approvedEntries / totalPossibleEntries) * 100)
        : 0;

      console.log('Sector completion calculation:', {
        schoolsCount: schoolIds.length,
        totalRequiredColumns,
        totalPossibleEntries,
        approvedEntries,
        sectorCompletionRate
      });

      // 7. Calculate school-specific completion rates
      const schoolsWithStats = schoolsData?.map(school => {
        const schoolEntries = formStatsData?.filter(entry => entry.school_id === school.id) || [];
        const schoolApproved = schoolEntries.filter(entry => entry.status === 'approved').length;
        const schoolPending = schoolEntries.filter(entry => entry.status === 'pending').length;
        const schoolRejected = schoolEntries.filter(entry => entry.status === 'rejected').length;
        
        const schoolCompletionRate = totalRequiredColumns > 0 
          ? Math.round((schoolApproved / totalRequiredColumns) * 100)
          : 0;

        return {
          ...school,
          completion_rate: schoolCompletionRate,
          approvedEntries: schoolApproved,
          pendingEntries: schoolPending,
          rejectedEntries: schoolRejected,
          totalEntries: schoolEntries.length
        };
      }) || [];
      
      // 8. Prepare dashboard statistics
      const stats: DashboardStats = {
        totalEntries,
        completedEntries: approvedEntries,
        pendingEntries,
        approvedEntries,
        rejectedEntries,
        completed: approvedEntries,
        pending: pendingEntries
      };
      
      // 9. Summary statistics for logging
      console.log('Final sector admin stats:', {
        totalSchools: schoolsData?.length || 0,
        sectorCompletionRate,
        pendingApprovals: pendingEntries,
        totalEntries,
        approvedEntries
      });

      return {
        totalSchools: schoolsData?.length || 0,
        pendingApprovals: pendingEntries,
        completionRate: sectorCompletionRate,
        stats,
        summary: {
          total: totalEntries,
          completed: approvedEntries,
          pending: pendingEntries,
          rejected: rejectedEntries,
          approved: approvedEntries,
          completionRate: sectorCompletionRate,
          approvalRate: sectorCompletionRate,
          draft: 0,
          dueSoon: 0,
          overdue: 0
        },
        totalRequiredColumns,
        totalPossibleEntries
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
        // SchoolAdminDashboardData interfeysinə uyğun boş məlumat qaytarırıq
        // forms sahəsi bu interfeysdə yoxdur, ona görə silindi
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
          }
          // forms sahəsi SchoolAdminDashboardData interfeysinə daxil deyil
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
        // forms
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
          case 'superadmin': {
            data = await fetchSuperAdminData();
            break; }
          case 'regionadmin': {
            data = await fetchRegionAdminData();
            break; }
          case 'sectoradmin': {
            data = await fetchSectorAdminData();
            break; }
          case 'schooladmin':
          case 'user': { // user rolunu da schooladmin kimi emal edirik
            data = await fetchSchoolAdminData();
            break; }
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
