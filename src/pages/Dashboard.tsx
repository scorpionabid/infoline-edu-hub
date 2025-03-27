
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
  
  // Sistem vəziyyətinin diaqnostikası
  useEffect(() => {
    console.group('Dashboard komponent diaqnostikası');
    console.log('Authentication vəziyyəti:', { isAuthenticated, authLoading, user: user ? `${user.email} (${user.role})` : 'yoxdur' });
    console.log('Dashboard məlumat vəziyyəti:', { isLoading, error: error ? error.message : 'xəta yoxdur', dataLoaded: !!dashboardData });
    console.log('userRole:', userRole);
    console.log('Fallback vəziyyəti:', fallbackLoaded);
    
    if (dashboardData) {
      console.log('Dashboard data tipləri:', {
        pendingForms: Array.isArray(dashboardData.pendingForms) ? 'array' : typeof dashboardData.pendingForms,
        pendingFormsCount: Array.isArray(dashboardData.pendingForms) ? dashboardData.pendingForms.length : 'N/A',
        upcomingDeadlines: Array.isArray(dashboardData.upcomingDeadlines) ? 'array' : typeof dashboardData.upcomingDeadlines,
        deadlinesCount: Array.isArray(dashboardData.upcomingDeadlines) ? dashboardData.upcomingDeadlines.length : 'N/A'
      });
    }
    console.groupEnd();
  }, [user, isAuthenticated, authLoading, dashboardData, isLoading, error, fallbackLoaded, userRole]);
  
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
        description: `Xəta: ${error.message || 'Naməlum xəta'}`
      });
    }
  }, [error]);

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
