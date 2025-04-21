import React from 'react';
import { useAuth } from '@/context/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SectorAdminDashboard from '@/components/dashboard/SectorAdminDashboard';
import { useRealDashboardData } from '@/hooks/useRealDashboardData';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isSchoolAdmin = user?.role === 'schooladmin';
  const isSectorAdmin = user?.role === 'sectoradmin';
  
  const { 
    dashboardData, 
    chartData, 
    isLoading,
    error 
  } = useRealDashboardData();

  React.useEffect(() => {
    if (error) {
      console.error('Dashboard data yüklənmə xətası:', error);
      toast.error('Məlumatları yükləyərkən xəta baş verdi');
    }
  }, [error]);
  
  return (
    <SidebarLayout>
      <div className="space-y-4">
        <DashboardHeader />
        
        {isSchoolAdmin && <SchoolAdminSetupCheck />}
        
        {isSectorAdmin ? (
          <SectorAdminDashboard />
        ) : (
          <DashboardContent 
            data={dashboardData} 
            chartData={chartData}
            isLoading={isLoading} 
            error={error} 
          />
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
