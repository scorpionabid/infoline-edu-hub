
import React, { useEffect } from 'react';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import { useRealDashboardData } from '@/hooks/useRealDashboardData';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData, SuperAdminDashboardData } from '@/types/dashboard';
import { UserRole } from '@/types/supabase';

const DashboardContent: React.FC = () => {
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);
  const { getDashboardData, loading, error: hookError } = useRealDashboardData();

  const { data, error, isLoading } = useQuery({
    queryKey: ['dashboardData', userRole, user?.id],
    queryFn: () => getDashboardData(userRole as UserRole),
    enabled: !!userRole && !!user,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  useEffect(() => {
    if (error || hookError) {
      console.error('Dashboard data fetch error:', error || hookError);
      toast.error('İdarə paneli məlumatları yüklənərkən xəta baş verdi', {
        description: 'Zəhmət olmasa, yenidən cəhd edin və ya administratorla əlaqə saxlayın',
      });
    }
  }, [error, hookError]);

  if (isLoading || loading) {
    return (
      <div className="w-full p-8 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Məlumatlar yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error || hookError || !data) {
    return (
      <div className="w-full p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Məlumat yükləmə xətası</h3>
          <p className="text-red-700">
            İdarə paneli məlumatları yüklənərkən problem yarandı. Zəhmət olmasa daha sonra yenidən cəhd edin.
          </p>
          <button
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded transition-colors text-sm"
            onClick={() => window.location.reload()}
          >
            Yenidən yüklə
          </button>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="w-full p-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-amber-800">İstifadəçi rolu təyin edilməyib</h3>
          <p className="text-amber-700">
            Profiliniz üçün rol təyin edilməyib. Zəhmət olmasa sistem administratoru ilə əlaqə saxlayın.
          </p>
        </div>
      </div>
    );
  }

  // Depending on user role, render the appropriate dashboard
  switch (userRole) {
    case 'superadmin':
      return <SuperAdminDashboard data={data as SuperAdminDashboardData} />;

    case 'regionadmin':
      return <RegionAdminDashboard data={data as RegionAdminDashboardData} />;

    case 'sectoradmin':
      return <SectorAdminDashboard data={data as SectorAdminDashboardData} />;

    case 'schooladmin':
      return <SchoolAdminDashboard data={data as SchoolAdminDashboardData} />;

    default:
      return (
        <div className="w-full p-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-amber-800">Naməlum istifadəçi rolu</h3>
            <p className="text-amber-700">
              "{userRole}" rolu üçün idarə paneli mövcud deyil. Zəhmət olmasa sistem administratoru ilə əlaqə saxlayın.
            </p>
          </div>
        </div>
      );
  }
};

export default DashboardContent;
