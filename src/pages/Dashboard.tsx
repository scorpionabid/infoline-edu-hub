
import React, { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useDashboardData } from '@/hooks/dashboard';
import { ChartData } from '@/types/dashboard';

const Dashboard: React.FC = () => {
  const { dashboardData, isLoading, chartData, userRole } = useDashboardData();
  const [fallbackLoaded, setFallbackLoaded] = useState(false);
  
  // Əgər 5 saniyədən çox yüklənmə davam edirsə, fallback data göstərək
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setFallbackLoaded(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Fallback data
  const emptyChartData: ChartData = {
    activityData: [],
    regionSchoolsData: [],
    categoryCompletionData: []
  };
  
  return (
    <SidebarLayout>
      <div className="space-y-4">
        <DashboardHeader />
        
        {isLoading && !fallbackLoaded ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Məlumatlar yüklənir...</p>
          </div>
        ) : (
          <DashboardContent 
            userRole={userRole || 'schooladmin'}
            dashboardData={dashboardData}
            chartData={chartData || emptyChartData}
            isLoading={isLoading && !fallbackLoaded}
          />
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
