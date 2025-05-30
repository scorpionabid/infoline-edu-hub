import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData, 
  CategoryItem,
  DeadlineItem,
  FormItem,
  SchoolStat,
  PendingApproval,
  SectorStat
} from '@/types/dashboard';
import { UserRole } from '@/types/supabase';

export const useRealDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const getDashboardData = async (userRole: UserRole) => {
    if (!user) {
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      // Different data for different roles
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

        // Different data for different roles
        if (userRole === 'superadmin') {
          const data = await fetchSuperAdminData();
          setDashboardData(data);
        } else if (userRole === 'regionadmin' && user.region_id) {
          const data = await fetchRegionAdminData(user.region_id);
          setDashboardData(data);
        } else if (userRole === 'sectoradmin' && user.sector_id) {
          const data = await fetchSectorAdminData(user.sector_id);
          setDashboardData(data);
        } else if (userRole === 'schooladmin' && user.school_id) {
          const data = await fetchSchoolAdminData(user.school_id);
          setDashboardData(data);
        } else {
          throw new Error('Invalid user role or missing entity ID');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const fetchSuperAdminData = async (): Promise<SuperAdminDashboardData> => {
    // Mock data for super admin
    return {
      users: {
        active: 200,
        total: 250
      },
      regionCount: 25,
      sectorCount: 75,
      schoolCount: 250,
      categories: [
        { id: '1', name: 'General Statistics', status: 'active' },
        { id: '2', name: 'Teacher Information', status: 'active' },
        { id: '3', name: 'Infrastructure', status: 'active' },
        { id: '4', name: 'Student Assessment', status: 'active' },
      ],
      pendingApprovals: [
        { id: '1', schoolName: 'School A', regionName: 'Region A', categoryName: 'General Statistics', date: '2023-05-01' },
        { id: '2', schoolName: 'School B', regionName: 'Region B', categoryName: 'Teacher Information', date: '2023-05-02' },
      ],
      deadlines: [
        { id: '1', name: 'General Statistics', dueDate: '2023-06-01', status: 'active' },
        { id: '2', name: 'Teacher Information', dueDate: '2023-06-15', status: 'active' },
      ],
      regionStats: [
        { id: '1', name: 'Region A', schoolCount: 50, completionRate: 0.78 },
        { id: '2', name: 'Region B', schoolCount: 45, completionRate: 0.65 },
      ]
    };
  };

  const fetchRegionAdminData = async (regionId: string): Promise<RegionAdminDashboardData> => {
    // Mock data ilə regional admin data
    return {
      sectorCount: 8,
      schoolCount: 75,
      categories: [
        { id: '1', name: 'General Statistics', status: 'active' },
        { id: '2', name: 'Teacher Information', status: 'active' },
      ],
      pendingApprovals: [
        { id: '1', schoolName: 'School X', categoryName: 'General Statistics', date: '2023-05-01' },
      ],
      deadlines: [
        { id: '1', name: 'General Statistics', dueDate: '2023-06-01', status: 'active' },
      ],
      sectorStats: [
        { id: '1', name: 'Sector A', schoolCount: 15, completionRate: 0.75 },
      ]
    };
  };

  const fetchSectorAdminData = async (sectorId: string): Promise<SectorAdminDashboardData> => {
    // Mock data ilə sector admin data
    return {
      schoolCount: 20,
      categories: [
        { id: '1', name: 'General Statistics', status: 'active' },
      ],
      pendingApprovals: [
        { id: '1', schoolName: 'School 1', categoryName: 'General Statistics', date: '2023-05-01' },
      ],
      deadlines: [
        { id: '1', name: 'General Statistics', dueDate: '2023-06-01', status: 'active' },
      ],
      schoolStats: [
        { id: '1', name: 'School 1', completionRate: 0.92 },
      ]
    };
  };

  const fetchSchoolAdminData = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
    try {
      // Use data_entries instead of approvals table for compatibility
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, status');
      
      if (categoriesError) throw categoriesError;
      
      const { data: entriesData, error: entriesError } = await supabase
        .from('data_entries')
        .select('category_id, status')
        .eq('school_id', schoolId);
      
      if (entriesError) throw entriesError;
      
      const { data: deadlinesData, error: deadlinesError } = await supabase
        .from('categories')
        .select('id, name, deadline, status')
        .order('deadline', { ascending: true });
      
      if (deadlinesError) throw deadlinesError;
      
      // Verilənləri formatlaşdır
      const categories: CategoryItem[] = categoriesData.map((category: any) => ({
        id: category.id,
        name: category.name,
        status: category.status || 'active'
      }));
      
      const deadlines: DeadlineItem[] = deadlinesData.map((deadline: any) => ({
        id: deadline.id,
        name: deadline.name,
        dueDate: deadline.deadline || new Date().toISOString(),
        status: deadline.status
      }));
      
      const forms: FormItem[] = categories.map((category) => ({
        id: category.id,
        name: category.name,
        status: category.status
      }));
      
      return {
        categories,
        deadlines,
        forms
      };
    } catch (error) {
      console.error('Error fetching school admin dashboard data:', error);
      
      // Xəta halında demo data
      return {
        categories: [
          { id: '1', name: 'General Statistics', status: 'approved' },
        ],
        deadlines: [
          { id: '1', name: 'General Statistics', dueDate: '2023-06-01', status: 'active' },
        ],
        forms: [
          { id: '1', name: 'General Statistics', status: 'completed' },
        ]
      };
    }
  };

  return {
    loading,
    error,
    dashboardData,
    getDashboardData
  };
};

export default useRealDashboardData;
