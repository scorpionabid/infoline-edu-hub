
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData
} from '@/types/dashboard';
import { UserRole } from '@/types/supabase';

export const useRealDashboardData = () => {
  const user = useAuthStore(selectUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // --------- Real Superadmin dashboard
  const fetchSuperAdminData = async (): Promise<SuperAdminDashboardData> => {
    // Get real counts from database
    const [regionsResult, sectorsResult, schoolsResult, usersResult, categoriesResult] = await Promise.all([
      supabase.from('regions').select('*', { count: 'exact', head: true }),
      supabase.from('sectors').select('*', { count: 'exact', head: true }),
      supabase.from('schools').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('id, name, status, assignment').eq('status', 'active')
    ]);

    // Get form statistics from data_entries
    const { data: formStats } = await supabase
      .from('data_entries')
      .select('status')
      .not('status', 'is', null);

    const statusCounts = formStats?.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get recent regions with admin info
    const { data: regionsData } = await supabase
      .from('regions')
      .select(`
        id, name, status, admin_email, created_at,
        sectors(count)
      `)
      .limit(10)
      .order('created_at', { ascending: false });

    const regions = regionsData?.map(region => ({
      id: region.id,
      name: region.name,
      status: region.status,
      adminEmail: region.admin_email,
      sectorCount: region.sectors?.length || 0,
      completionRate: 0 // Calculate if needed
    })) || [];

    return {
      totalRegions: regionsResult.count || 0,
      totalSectors: sectorsResult.count || 0,
      totalSchools: schoolsResult.count || 0,
      totalUsers: usersResult.count || 0,
      categories: categoriesResult.data?.map(cat => ({
        id: cat.id,
        name: cat.name,
        status: cat.status,
        completionRate: 0,
        assignment: cat.assignment
      })) || [],
      pendingApprovals: [],
      deadlines: [],
      regionStats: [],
      regions,
      formsByStatus: {
        pending: statusCounts.pending || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        total: formStats?.length || 0
      },
      stats: {
        regions: regionsResult.count || 0,
        sectors: sectorsResult.count || 0,
        schools: schoolsResult.count || 0,
        users: usersResult.count || 0
      },
      regionCount: regionsResult.count || 0,
      sectorCount: sectorsResult.count || 0,
      schoolCount: schoolsResult.count || 0,
      userCount: usersResult.count || 0,
      approvalRate: statusCounts.approved ? (statusCounts.approved / (formStats?.length || 1)) * 100 : 0,
      completionRate: statusCounts.approved ? (statusCounts.approved / (formStats?.length || 1)) * 100 : 0,
      notifications: []
    };
  };

  // --------- Real Region admin dashboard
  const fetchRegionAdminData = async (regionId: string): Promise<RegionAdminDashboardData> => {
    // Get sectors in this region
    const { data: sectorsData } = await supabase
      .from('sectors')
      .select(`
        id, name, completion_rate, status, admin_email,
        schools(count)
      `)
      .eq('region_id', regionId);

    const sectors = sectorsData?.map(sector => ({
      id: sector.id,
      name: sector.name,
      totalSchools: sector.schools?.length || 0,
      activeSchools: sector.schools?.length || 0, // Could filter by status
      completionRate: typeof sector.completion_rate === 'number' ? sector.completion_rate : 0,
      status: sector.status,
      adminEmail: sector.admin_email
    })) || [];

    // Get form statistics for this region
    const { data: formStats } = await supabase
      .from('data_entries')
      .select(`
        status,
        schools!inner(region_id)
      `)
      .eq('schools.region_id', regionId);

    const statusCounts = formStats?.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get categories accessible to regions
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, status, assignment')
      .in('assignment', ['all', 'sectors'])
      .eq('status', 'active');

    return {
      categories: categoriesData?.map(cat => ({
        id: cat.id,
        name: cat.name,
        status: cat.status,
        completionRate: 0,
        assignment: cat.assignment
      })) || [],
      deadlines: [],
      sectors,
      stats: {
        sectors: sectors.length,
        schools: sectors.reduce((sum, s) => sum + s.totalSchools, 0),
        users: 0 // Could calculate if needed
      },
      pendingItems: [],
      notifications: [],
      completionRate: statusCounts.approved ? (statusCounts.approved / (formStats?.length || 1)) * 100 : 0,
      formStats: {
        total: formStats?.length || 0,
        pending: statusCounts.pending || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        draft: statusCounts.draft || 0,
        dueSoon: 0,
        overdue: 0,
        percentage: statusCounts.approved ? (statusCounts.approved / (formStats?.length || 1)) * 100 : 0,
        completion_rate: statusCounts.approved ? (statusCounts.approved / (formStats?.length || 1)) * 100 : 0,
        completionRate: statusCounts.approved ? (statusCounts.approved / (formStats?.length || 1)) * 100 : 0,
        completedForms: statusCounts.approved || 0,
        approvalRate: statusCounts.approved ? (statusCounts.approved / (formStats?.length || 1)) * 100 : 0
      }
    };
  };

  // --------- Real Sector admin dashboard
  const fetchSectorAdminData = async (sectorId: string): Promise<SectorAdminDashboardData> => {
    // Get schools in this sector
    const { data: schoolsData } = await supabase
      .from('schools')
      .select('id, name, completion_rate, status, updated_at, admin_email')
      .eq('sector_id', sectorId);

    const schools = schoolsData?.map(school => ({
      id: school.id,
      name: school.name,
      completionRate: typeof school.completion_rate === 'number' ? school.completion_rate : 0,
      totalForms: 0, // Could calculate from data_entries
      completedForms: 0,
      pendingForms: 0,
      status: school.status,
      lastUpdated: school.updated_at || new Date().toISOString(),
      adminEmail: school.admin_email
    })) || [];

    // Get categories for sectors
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, status, assignment')
      .in('assignment', ['all', 'sectors'])
      .eq('status', 'active');

    return {
      categories: categoriesData?.map(cat => ({
        id: cat.id,
        name: cat.name,
        status: cat.status,
        completionRate: 0,
        assignment: cat.assignment
      })) || [],
      deadlines: [],
      schools,
      stats: {
        schools: schools.length
      },
      pendingItems: [],
      notifications: [],
      completionRate: schools.reduce((sum, s) => sum + s.completionRate, 0) / (schools.length || 1)
    };
  };

  // --------- Real School admin dashboard
  const fetchSchoolAdminData = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
    // Get school's data entries
    const { data: dataEntries } = await supabase
      .from('data_entries')
      .select('status, category_id')
      .eq('school_id', schoolId);

    const statusCounts = dataEntries?.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get categories for schools
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, status, assignment')
      .eq('assignment', 'all')
      .eq('status', 'active');

    const categories = categoriesData?.map(cat => ({
      id: cat.id,
      name: cat.name,
      status: cat.status,
      completionRate: 0
    })) || [];

    return {
      categories,
      deadlines: [],
      stats: {
        completed: statusCounts.approved || 0,
        pending: statusCounts.pending || 0
      },
      formStats: {
        total: dataEntries?.length || 0,
        pending: statusCounts.pending || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        drafts: statusCounts.draft || 0,
        incomplete: 0
      },
      notifications: [],
      completionRate: statusCounts.approved ? (statusCounts.approved / (dataEntries?.length || 1)) * 100 : 0,
      status: {
        pending: statusCounts.pending || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        draft: statusCounts.draft || 0,
        total: dataEntries?.length || 0,
        active: 0,
        inactive: 0
      },
      completion: {
        percentage: statusCounts.approved ? (statusCounts.approved / (dataEntries?.length || 1)) * 100 : 0,
        completed: statusCounts.approved || 0,
        total: dataEntries?.length || 0
      },
      pendingForms: [],
      upcoming: []
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const userRole = user.role;
        let data = null;

        if (userRole === 'superadmin') {
          data = await fetchSuperAdminData();
        } else if (userRole === 'regionadmin' && user.region_id) {
          data = await fetchRegionAdminData(user.region_id);
        } else if (userRole === 'sectoradmin' && user.sector_id) {
          data = await fetchSectorAdminData(user.sector_id);
        } else if (userRole === 'schooladmin' && user.school_id) {
          data = await fetchSchoolAdminData(user.school_id);
        } else {
          throw new Error('Invalid user role or missing entity ID');
        }
        
        setDashboardData(data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getDashboardData = async (userRole: UserRole) => {
    if (!user) return null;
    
    if (userRole === 'superadmin') {
      return await fetchSuperAdminData();
    } else if (userRole === 'regionadmin' && user.region_id) {
      return await fetchRegionAdminData(user.region_id);
    } else if (userRole === 'sectoradmin' && user.sector_id) {
      return await fetchSectorAdminData(user.sector_id);
    } else if (userRole === 'schooladmin' && user.school_id) {
      return await fetchSchoolAdminData(user.school_id);
    }
    
    return null;
  };

  return {
    loading,
    error,
    dashboardData,
    getDashboardData
  };
};

export default useRealDashboardData;
