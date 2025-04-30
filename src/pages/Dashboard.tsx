
import React from 'react';
import { useAuth } from '@/context/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SectorAdminDashboard from '@/components/dashboard/SectorAdminDashboard';
import RegionAdminDashboard from '@/components/dashboard/RegionAdminDashboard';
import { useRealDashboardData } from '@/hooks/useRealDashboardData';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import SchoolAdminDashboard from '@/components/dashboard/SchoolAdminDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isSchoolAdmin = user?.role === 'schooladmin';
  const isSectorAdmin = user?.role === 'sectoradmin';
  const isRegionAdmin = user?.role === 'regionadmin';
  
  const { 
    dashboardData, 
    chartData, 
    isLoading,
    error,
    refetch 
  } = useRealDashboardData();

  React.useEffect(() => {
    if (error) {
      console.error('Dashboard data yüklənmə xətası:', error);
      toast.error('Məlumatları yükləyərkən xəta baş verdi');
    }
  }, [error]);
  
  // İstifadəçi və ya rol məlumatı yoxdursa, xəta göstər
  if (!user || !user.role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">
            <span className="icon">error</span>
          </div>
          <h1 className="text-xl font-semibold">İstifadəçi rolu tapılmadı</h1>
          <p className="text-gray-500 mt-2">Zəhmət olmasa yenidən daxil olun</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Yenidən cəhd edin
          </button>
        </div>
      </div>
    );
  }
  
  console.log(`Dashboard: İstifadəçi rolu - ${user.role}`);
  
  return (
    <SidebarLayout>
      <div className="space-y-4 p-4">
        <DashboardHeader />
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : isSchoolAdmin ? (
          <>
            <SchoolAdminSetupCheck />
            <SchoolAdminDashboard 
              data={dashboardData}
              isLoading={isLoading}
              error={error}
              onRefresh={refetch}
              navigateToDataEntry={() => {}}
              handleFormClick={() => {}}
            />
          </>
        ) : isSectorAdmin ? (
          <SectorAdminDashboard />
        ) : isRegionAdmin ? (
          <RegionAdminDashboard data={dashboardData} />
        ) : (
          <DashboardContent />
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
