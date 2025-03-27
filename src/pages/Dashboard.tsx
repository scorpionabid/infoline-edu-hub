
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { ChartData } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { dashboardData, isLoading, error, chartData, userRole } = useDashboardData();
  const [fallbackLoaded, setFallbackLoaded] = useState(false);
  const navigate = useNavigate();
  
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
  
  // Əgər istifadəçi autentifikasiya olmayıbsa, login səhifəsinə yönləndirək
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('İstifadəçi autentifikasiya olmayıb, login səhifəsinə yönləndirilir');
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
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
    console.log('Auth loading:', authLoading);
    console.log('İstifadəçi authenticated?', isAuthenticated);
  }, [user, dashboardData, isLoading, fallbackLoaded, authLoading, isAuthenticated]);
  
  // Fallback data
  const emptyChartData: ChartData = {
    activityData: [
      { name: 'Yan', value: 20 },
      { name: 'Fev', value: 45 },
      { name: 'Mar', value: 28 }
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 120 },
      { name: 'Sumqayıt', value: 75 }
    ],
    categoryCompletionData: [
      { name: 'Ümumi məlumat', completed: 78 },
      { name: 'Müəllim heyəti', completed: 65 }
    ]
  };
  
  // Auth yüklənməsi davam edirsə
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">İstifadəçi məlumatları yüklənir...</p>
      </div>
    );
  }
  
  // İstifadəçi authenticated deyilsə, login component onsuz da yönləndirəcək
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Login səhifəsinə yönləndirilir...</p>
      </div>
    );
  }
  
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
