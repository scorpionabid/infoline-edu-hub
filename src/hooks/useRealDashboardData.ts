
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
        total: 250,
        new: 20
      },
      regionCount: 25,
      sectorCount: 75,
      schoolCount: 250,
      entryCount: {
        pending: 124,
        approved: 345,
        rejected: 28,
        total: 497,
        dueSoon: 15,
        overdue: 5,
        draft: 20
      },
      completion: 68,
      categoryData: [
        { id: '1', name: 'Category A', completionRate: 85 },
        { id: '2', name: 'Category B', completionRate: 60 },
        { id: '3', name: 'Category C', completionRate: 75 },
      ],
      schoolData: [
        { id: '1', name: 'School A', completionRate: 90, totalEntries: 20, pendingEntries: 2 },
        { id: '2', name: 'School B', completionRate: 70, totalEntries: 18, pendingEntries: 5 },
        { id: '3', name: 'School C', completionRate: 50, totalEntries: 15, pendingEntries: 7 },
      ],
      regionData: [
        { id: '1', name: 'Region A', sectorCount: 5, schoolCount: 50, completionRate: 75 },
        { id: '2', name: 'Region B', sectorCount: 7, schoolCount: 70, completionRate: 60 },
        { id: '3', name: 'Region C', sectorCount: 6, schoolCount: 65, completionRate: 70 },
      ]
    };
  };

  const fetchRegionAdminData = async (regionId: string): Promise<RegionAdminDashboardData> => {
    // Mock data for region admin
    return {
      schools: {
        total: 120,
        active: 110,
        inactive: 10
      },
      sectors: {
        total: 12,
        active: 10,
        inactive: 2
      },
      users: {
        total: 150,
        admins: 25,
        teachers: 125
      },
      entryCount: {
        pending: 64,
        approved: 180,
        rejected: 15,
        total: 259
      },
      completion: 72,
      categoryData: [
        { id: '1', name: 'Category A', completionRate: 85 },
        { id: '2', name: 'Category B', completionRate: 65 },
        { id: '3', name: 'Category C', completionRate: 45 },
      ],
      schoolData: [
        { id: '1', name: 'School A', completionRate: 90, totalEntries: 20, pendingEntries: 2 },
        { id: '2', name: 'School B', completionRate: 70, totalEntries: 18, pendingEntries: 5 },
        { id: '3', name: 'School C', completionRate: 50, totalEntries: 15, pendingEntries: 7 },
      ],
      recentActivities: [],
      sectorStats: [
        { id: '1', name: 'Sector A', schoolCount: 20, completionRate: 85 },
        { id: '2', name: 'Sector B', schoolCount: 18, completionRate: 65 },
        { id: '3', name: 'Sector C', schoolCount: 22, completionRate: 70 }
      ],
      pendingApprovals: [
        { 
          id: '1', 
          schoolName: 'School A', 
          categoryName: 'Category A', 
          submittedAt: new Date().toISOString()
        },
        { 
          id: '2', 
          schoolName: 'School B', 
          categoryName: 'Category B', 
          submittedAt: new Date().toISOString() 
        }
      ]
    };
  };

  const fetchSectorAdminData = async (sectorId: string): Promise<SectorAdminDashboardData> => {
    const schoolStats: SchoolStat[] = [
      { id: '1', name: 'School A', completionRate: 90, pendingCount: 2 },
      { id: '2', name: 'School B', completionRate: 60, pendingCount: 5 },
      { id: '3', name: 'School C', completionRate: 45, pendingCount: 8 },
    ];

    const categories: CategoryItem[] = [
      { id: '1', name: 'Category A', completionRate: 85, status: 'active' },
      { id: '2', name: 'Category B', completionRate: 60, status: 'active' },
      { id: '3', name: 'Category C', completionRate: 50, status: 'active' },
    ];

    const pendingForms: FormItem[] = [
      { id: '1', title: 'Form A', categoryName: 'Category A', status: 'pending' },
      { id: '2', title: 'Form B', categoryName: 'Category B', status: 'pending' }
    ];

    const upcoming: DeadlineItem[] = [
      { id: '1', title: 'Deadline A', deadline: '2025-06-01', daysLeft: 10 },
      { id: '2', title: 'Deadline B', deadline: '2025-06-15', daysLeft: 24 }
    ];

    const pendingApprovals: PendingApproval[] = [
      { 
        id: '1', 
        schoolName: 'School A', 
        categoryName: 'Category A', 
        submittedAt: new Date().toISOString()
      },
      { 
        id: '2', 
        schoolName: 'School B', 
        categoryName: 'Category B', 
        submittedAt: new Date().toISOString() 
      }
    ];

    // Mock data for sector admin
    return {
      schools: {
        total: 22,
        active: 20,
        inactive: 2
      },
      users: {
        total: 44,
        admins: 7,
        teachers: 37
      },
      entryCount: {
        pending: 28,
        approved: 75,
        rejected: 7,
        total: 110
      },
      completion: {
        percentage: 65,
        total: 110,
        completed: 75
      },
      categoryData: [
        { id: '1', name: 'Category A', completionRate: 85, status: 'active' },
        { id: '2', name: 'Category B', completionRate: 60, status: 'active' },
        { id: '3', name: 'Category C', completionRate: 50, status: 'active' },
      ],
      schoolData: [
        { id: '1', name: 'School A', completionRate: 90, totalEntries: 20, pendingEntries: 2 },
        { id: '2', name: 'School B', completionRate: 60, totalEntries: 18, pendingEntries: 5 },
        { id: '3', name: 'School C', completionRate: 45, totalEntries: 15, pendingEntries: 8 },
      ],
      recentActivities: [],
      status: {
        pending: 28,
        approved: 75,
        rejected: 7,
        draft: 0,
        total: 110,
        active: 20,
        inactive: 2
      },
      formStats: {
        pending: 28,
        approved: 75,
        rejected: 7,
        total: 110,
        dueSoon: 5,
        overdue: 2,
        draft: 0
      },
      schoolStats,
      categories,
      pendingForms,
      upcoming,
      pendingApprovals
    };
  };

  const fetchSchoolAdminData = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
    const categories: CategoryItem[] = [
      { id: '1', name: 'Category A', completionRate: 100, status: 'completed' },
      { id: '2', name: 'Category B', completionRate: 65, status: 'in-progress' },
      { id: '3', name: 'Category C', completionRate: 0, status: 'not-started' },
    ];

    const pendingForms: FormItem[] = [
      { id: '1', title: 'Form A', categoryName: 'Category A', status: 'pending' },
      { id: '2', title: 'Form B', categoryName: 'Category B', status: 'pending' }
    ];

    const upcoming: DeadlineItem[] = [
      { id: '1', title: 'Deadline A', deadline: '2025-06-01', daysLeft: 10 },
      { id: '2', title: 'Deadline B', deadline: '2025-06-15', daysLeft: 24 }
    ];

    // Mock data for school admin
    return {
      completion: {
        percentage: 75,
        total: 22,
        completed: 15
      },
      status: {
        pending: 5,
        approved: 15,
        rejected: 2,
        draft: 0,
        total: 22,
        active: 1,
        inactive: 0
      },
      formStats: {
        pending: 5,
        approved: 15,
        rejected: 2,
        total: 22,
        dueSoon: 3,
        overdue: 1,
        draft: 0
      },
      categories,
      categoryData: [
        { id: '1', name: 'Category A', completionRate: 100, status: 'completed' },
        { id: '2', name: 'Category B', completionRate: 65, status: 'in-progress' },
        { id: '3', name: 'Category C', completionRate: 0, status: 'not-started' },
      ],
      recentActivities: [],
      notifications: [],
      upcoming,
      pendingForms,
      completionRate: 75
    };
  };

  return {
    loading,
    error,
    data: dashboardData,
    getDashboardData
  };
};
