
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useRealDashboardData } from '@/hooks/useRealDashboardData';
import { useDashboardData } from '@/hooks/useDashboardData';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isSchoolAdmin = user?.role === 'schooladmin';
  
  // Real və mock data arasında seçim edirik
  // Qeyd: Hazırda biz real məlumatları əldə edirik, ancaq əgər xəta olsa köhnə verilənləri istifadə edirik
  const { 
    dashboardData: realDashboardData, 
    chartData: realChartData, 
    isLoading: realDataLoading, 
    error: realDataError 
  } = useRealDashboardData();
  
  // Köhnə hook-u xəta olduğu təqdirdə istifadə edirik
  const { dashboardData: mockDashboardData, isLoading: mockDataLoading, chartData: mockChartData } = useDashboardData();
  
  // Real məlumat əldə edilə bilmirsə, mock data istifadə edirik
  const dashboardData = realDataError ? mockDashboardData : realDashboardData;
  const chartData = realDataError ? mockChartData : realChartData;
  const isLoading = realDataLoading || mockDataLoading;
  
  // Xəta mesajını göstər
  React.useEffect(() => {
    if (realDataError) {
      console.error('Real data yüklənmə xətası:', realDataError);
      toast.error('Məlumatları yükləyərkən xəta baş verdi', {
        description: 'Müvəqqəti olaraq demo məlumatlar göstərilir'
      });
    }
  }, [realDataError]);
  
  // ChartData tipini düzgün şəkildə təyin edirik
  const safeChartData = chartData || {
    activityData: [] as Array<{ name: string; value: number }>,
    regionSchoolsData: [] as Array<{ name: string; value: number }>,
    categoryCompletionData: [] as Array<{ name: string; completed: number }>
  };
  
  return (
    <SidebarLayout>
      <div className="space-y-4">
        <DashboardHeader />
        
        {isSchoolAdmin && <SchoolAdminSetupCheck />}
        
        <DashboardContent 
          userRole={user?.role}
          dashboardData={dashboardData}
          chartData={safeChartData}
          isLoading={isLoading}
        />
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
