
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSupabaseDashboardData } from './useSupabaseDashboardData';
import { useNotifications } from '@/hooks/useNotifications';
import { getBaseData } from './providers';

export const useDashboardData = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  // Diagram/Chart Data
  const [chartData, setChartData] = useState({
    activityData: [],
    regionSchoolsData: [],
    categoryCompletionData: []
  });

  // Supabase dashboard data hook
  const supabaseDashboard = useSupabaseDashboardData();
  
  // Notification data
  const { notifications } = useNotifications();

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setUserRole(user.role);

    try {
      // Base məlumatlarını əldə edək
      const baseData = await getBaseData(user);
      let roleSpecificData = {};

      // İstifadəçi roluna görə fərqli məlumatları əldə edək
      switch (user.role) {
        case 'superadmin':
          roleSpecificData = await supabaseDashboard.fetchSuperAdminData(user);
          break;
        case 'regionadmin':
          roleSpecificData = await supabaseDashboard.fetchRegionAdminData(user);
          break;
        case 'sectoradmin':
          roleSpecificData = await supabaseDashboard.fetchSectorAdminData(user);
          break;
        case 'schooladmin':
          roleSpecificData = await supabaseDashboard.fetchSchoolAdminData(user);
          break;
        default:
          break;
      }

      // Bütün məlumatları birləşdirək
      setDashboardData({
        ...baseData,
        ...roleSpecificData,
        notifications: notifications,
        isLoading: false
      });

      // Sadə diaqram verilənlərini əldə edək
      setChartData({
        activityData: [
          { name: 'Pending', value: Math.floor(Math.random() * 100) },
          { name: 'Approved', value: Math.floor(Math.random() * 100) },
          { name: 'Rejected', value: Math.floor(Math.random() * 100) }
        ],
        regionSchoolsData: [
          { name: 'Region 1', value: Math.floor(Math.random() * 100) + 50 },
          { name: 'Region 2', value: Math.floor(Math.random() * 100) + 50 },
          { name: 'Region 3', value: Math.floor(Math.random() * 100) + 50 }
        ],
        categoryCompletionData: [
          { name: 'Category A', completed: Math.floor(Math.random() * 100) },
          { name: 'Category B', completed: Math.floor(Math.random() * 100) },
          { name: 'Category C', completed: Math.floor(Math.random() * 100) }
        ]
      });
    } catch (err: any) {
      console.error('Dashboard məlumatlarını əldə edərkən xəta:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabaseDashboard, notifications]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    dashboardData,
    isLoading,
    error,
    chartData,
    refreshData: fetchData,
    userRole
  };
};
