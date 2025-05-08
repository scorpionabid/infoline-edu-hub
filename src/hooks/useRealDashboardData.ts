
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { ChartData, CategoryStat, SuperAdminDashboardData, RegionAdminDashboard, SectorAdminDashboard, SchoolAdminDashboard } from '@/types/dashboard';

export const useRealDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

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
          await fetchSuperAdminData();
        } else if (userRole === 'regionadmin' && user.region_id) {
          await fetchRegionAdminData(user.region_id);
        } else if (userRole === 'sectoradmin' && user.sector_id) {
          await fetchSectorAdminData(user.sector_id);
        } else if (userRole === 'schooladmin' && user.school_id) {
          await fetchSchoolAdminData(user.school_id);
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

  const fetchSuperAdminData = async () => {
    // Mock data for super admin
    const data: SuperAdminDashboardData = {
      totalSchools: 250,
      totalSectors: 25,
      pendingApprovals: 45,
      completionRate: 68,
      formStats: {
        pending: 124,
        approved: 345,
        rejected: 28,
        total: 497,
        dueSoon: 15,
        overdue: 5
      },
      regions: [
        { id: '1', name: 'Region A', sectorCount: 5, schoolCount: 50, completionRate: 75 },
        { id: '2', name: 'Region B', sectorCount: 7, schoolCount: 70, completionRate: 60 },
        { id: '3', name: 'Region C', sectorCount: 6, schoolCount: 65, completionRate: 70 },
      ],
      // Adding the missing regionCompletion property
      regionCompletion: {
        '1': 75,
        '2': 60,
        '3': 70
      },
      recentSubmissions: [
        // Recent submission data
      ],
      notifications: [
        // Notification data
      ]
    };

    setDashboardData(data);
  };

  const fetchRegionAdminData = async (regionId: string) => {
    // Mock data for region admin
    const data: RegionAdminDashboard = {
      totalSchools: 120,
      totalSectors: 12,
      pendingApprovals: 25,
      completionRate: 72,
      regionCompletionRate: 72,
      formStats: {
        pending: 64,
        approved: 180,
        rejected: 15,
        total: 259,
        dueSoon: 8,
        overdue: 3
      },
      sectors: [
        { id: '1', name: 'Sector A', schoolCount: 20, completionRate: 85 },
        { id: '2', name: 'Sector B', schoolCount: 18, completionRate: 65 },
        { id: '3', name: 'Sector C', schoolCount: 22, completionRate: 70 },
      ],
      recentSubmissions: [
        // Recent submission data
      ],
      notifications: [
        // Notification data
      ]
    };

    setDashboardData(data);
  };

  const fetchSectorAdminData = async (sectorId: string) => {
    // Mock data for sector admin
    const data: SectorAdminDashboard = {
      totalSchools: 22,
      pendingApprovals: 12,
      completionRate: 65,
      sectorCompletionRate: 65,
      formStats: {
        pending: 28,
        approved: 75,
        rejected: 7,
        total: 110,
        dueSoon: 5,
        overdue: 2
      },
      schools: [
        { id: '1', name: 'School A', completionRate: 90, pendingCount: 2 },
        { id: '2', name: 'School B', completionRate: 60, pendingCount: 5 },
        { id: '3', name: 'School C', completionRate: 45, pendingCount: 8 },
      ],
      categories: [
        { id: '1', name: 'Category A', completionRate: 85, status: 'active' },
        { id: '2', name: 'Category B', completionRate: 60, status: 'active' },
        { id: '3', name: 'Category C', completionRate: 50, status: 'active' },
      ],
      recentSubmissions: [
        // Recent submission data
      ],
      notifications: [
        // Notification data
      ]
    };

    setDashboardData(data);
  };

  const fetchSchoolAdminData = async (schoolId: string) => {
    // Mock data for school admin
    const data: SchoolAdminDashboard = {
      completionRate: 75,
      formStats: {
        pending: 5,
        approved: 15,
        rejected: 2,
        total: 22,
        dueSoon: 3,
        overdue: 1
      },
      categories: [
        { id: '1', name: 'Category A', completionRate: 100, status: 'completed' },
        { id: '2', name: 'Category B', completionRate: 65, status: 'in-progress' },
        { id: '3', name: 'Category C', completionRate: 0, status: 'not-started' },
      ],
      completionStats: {
        'Category A': 100,
        'Category B': 65,
        'Category C': 0
      },
      upcomingDeadlines: [
        // Deadline data
      ],
      notifications: [
        // Notification data
      ]
    };

    setDashboardData(data);
  };

  return {
    loading,
    error,
    data: dashboardData
  };
};
