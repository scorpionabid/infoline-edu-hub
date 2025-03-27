
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { ChartData } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { dashboardData, isLoading, error, chartData, userRole } = useDashboardData();
  const [fallbackLoaded, setFallbackLoaded] = useState(false);
  
  // Əgər 5 saniyədən çox yüklənmə davam edirsə, fallback data göstərək
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('5 saniyə keçdi, fallback data göstəriləcək');
        setFallbackLoaded(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Xəta olduqda bildiriş göstərək
  useEffect(() => {
    if (error) {
      console.error('Dashboard data error:', error);
      toast.error('Məlumatları yükləmək mümkün olmadı', {
        description: 'Xahiş edirik bir az sonra yenidən cəhd edin',
      });
    }
  }, [error]);

  // Console-a debug məlumatları yazdırırıq
  useEffect(() => {
    console.log('Dashboard render olunur. User:', user?.role);
    console.log('Dashboard data:', dashboardData ? 'mövcuddur' : 'yoxdur');
    console.log('Loading:', isLoading);
    console.log('Fallback:', fallbackLoaded);
  }, [user, dashboardData, isLoading, fallbackLoaded]);
  
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
            userRole={userRole || (user?.role as string) || 'schooladmin'}
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
