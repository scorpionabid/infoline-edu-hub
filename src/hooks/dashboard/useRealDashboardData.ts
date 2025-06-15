
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

  // --------- Superadmin real data
  const fetchSuperAdminData = async (): Promise<SuperAdminDashboardData> => {
    // Total region count
    const { count: totalRegions } = await supabase
      .from('regions')
      .select('*', { count: 'exact', head: true });

    // Total sector count
    const { count: totalSectors } = await supabase
      .from('sectors')
      .select('*', { count: 'exact', head: true });

    // Total school count
    const { count: totalSchools } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });

    // Categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, status, completion_rate');

    const categories = (categoriesData || []).filter(cat =>
      cat && cat.id !== undefined && cat.name !== undefined && cat.status !== undefined
    ).map(cat => ({
      id: String(cat.id),
      name: String(cat.name),
      status: cat.status as any,
      completionRate: typeof cat.completion_rate === 'number' ? cat.completion_rate : (cat.completionRate || 0)
    }));

    return {
      totalRegions: totalRegions || 0,
      totalSectors: totalSectors || 0,
      totalSchools: totalSchools || 0,
      categories,
      pendingApprovals: [],
      deadlines: [],
      regionStats: []
    };
  };

  // --------- Region admin real data
  const fetchRegionAdminData = async (regionId: string): Promise<RegionAdminDashboardData> => {
    // Sektorlar
    const { data: sectorsData } = await supabase
      .from('sectors')
      .select('id, name, completion_rate, status')
      .eq('region_id', regionId);

    const sectors = (sectorsData || []).map(sec => ({
      id: sec.id,
      name: sec.name,
      totalSchools: 0,
      activeSchools: 0,
      completionRate: sec.completion_rate ?? 0,
      status: sec.status
    }));

    // Categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, status, completion_rate')
      .in('assignment', ['all', 'sectors']);

    const categories = (categoriesData || []).filter(cat =>
      cat && cat.id !== undefined && cat.name !== undefined && cat.status !== undefined
    ).map(cat => ({
      id: String(cat.id),
      name: String(cat.name),
      status: cat.status as any,
      completionRate: typeof cat.completion_rate === 'number' ? cat.completion_rate : (cat.completionRate || 0)
    }));

    return {
      categories,
      deadlines: [],
      sectors
    };
  };

  // --------- Real sectoradmin dashboard
  const fetchSectorAdminData = async (sectorId: string): Promise<SectorAdminDashboardData> => {
    const { data: schoolsData } = await supabase
      .from('schools')
      .select('id, name, completion_rate, status, updated_at')
      .eq('sector_id', sectorId);

    // Count forms
    const schools = (schoolsData || []).map(sch => ({
      id: sch.id,
      name: sch.name,
      completionRate: sch.completion_rate ?? 0,
      totalForms: 0,
      completedForms: 0,
      pendingForms: 0,
      status: sch.status,
      lastUpdated: sch.updated_at || new Date().toISOString()
    }));

    // Categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, status, completion_rate')
      .in('assignment', ['all', 'sectors']);

    const categories = (categoriesData || []).filter(cat =>
      cat && cat.id !== undefined && cat.name !== undefined && cat.status !== undefined
    ).map(cat => ({
      id: String(cat.id),
      name: String(cat.name),
      status: cat.status as any,
      completionRate: typeof cat.completion_rate === 'number' ? cat.completion_rate : (cat.completionRate || 0)
    }));

    return {
      categories,
      deadlines: [],
      schools
    };
  };

  // --------- Schooladmin dashboard (qismən dummy, TODO)
  const fetchSchoolAdminData = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, status, completion_rate')
      .eq('assignment', 'all');

    const categories = (categoriesData || []).filter(cat =>
      cat && cat.id !== undefined && cat.name !== undefined && cat.status !== undefined
    ).map(cat => ({
      id: String(cat.id),
      name: String(cat.name),
      status: cat.status as any,
      completionRate: typeof cat.completion_rate === 'number' ? cat.completion_rate : (cat.completionRate || 0)
    }));

    return {
      categories,
      deadlines: [],
      stats: {
        completed: 0,
        pending: 0
      }
    };
  };

  // Main function:
  const getDashboardData = async (userRole: UserRole) => {
    if (!user) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      if (userRole === 'superadmin') {
        return await fetchSuperAdminData();
      } else if (userRole === 'regionadmin' && user.region_id) {
        return await fetchRegionAdminData(user.region_id);
      } else if (userRole === 'sectoradmin' && user.sector_id) {
        return await fetchSectorAdminData(user.sector_id);
      } else if (userRole === 'schooladmin' && user.school_id) {
        return await fetchSchoolAdminData(user.school_id);
      } else {
        throw new Error('Invalid user role or missing entity ID');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
      setLoading(false);
      return null;
    }
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

  return {
    loading,
    error,
    dashboardData,
    getDashboardData
  };
};

export default useRealDashboardData;

// Qeyd: Bu fayl çox uzundur və gələcəkdə modul tipli kiçik fayllara bölmək tövsiyə olunur.
