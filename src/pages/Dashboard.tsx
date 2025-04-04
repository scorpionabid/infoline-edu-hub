
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard: React.FC = () => {
  const { dashboardData, isLoading, chartData, userRole } = useDashboardData();
  
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
