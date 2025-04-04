
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const { dashboardData, isLoading, chartData } = useDashboardData();
  const { user, isAuthenticated } = useAuth();
  
  // userRole null olduqda istifadəçi rolunu Auth contextdən əldə edirik
  const userRole = user?.role || 'schooladmin';
  
  return (
    <SidebarLayout>
      <div className="space-y-4">
        <DashboardHeader />
        
        <DashboardContent 
          userRole={userRole}
          dashboardData={dashboardData}
          chartData={chartData || {
            activityData: [],
            regionSchoolsData: [],
            categoryCompletionData: []
          }}
          isLoading={isLoading}
        />
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
