
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useDashboardData } from '@/hooks/useDashboardData';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';

const Dashboard: React.FC = () => {
  const { dashboardData, isLoading, chartData, userRole } = useDashboardData();
  const { user } = useAuth();
  
  const isSchoolAdmin = user?.role === 'schooladmin';
  
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
          userRole={userRole}
          dashboardData={dashboardData}
          chartData={safeChartData}
          isLoading={isLoading}
        />
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
