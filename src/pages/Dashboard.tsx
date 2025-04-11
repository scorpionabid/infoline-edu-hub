
import React, { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Sadə mock data
  const mockData = {
    stats: {
      totalSchools: 120,
      totalSectors: 15,
      totalRegions: 5,
      totalUsers: 350,
      recentActivities: 42,
      pendingApprovals: 8
    },
    notifications: [],
    pendingTasks: []
  };
  
  // Chart data üçün nümunə
  const chartData = {
    activityData: [
      { name: 'Daxil edilən məlumatlar', value: 65 },
      { name: 'Təsdiqlənən məlumatlar', value: 45 },
      { name: 'Rədd edilən məlumatlar', value: 20 }
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 40 },
      { name: 'Gəncə', value: 25 },
      { name: 'Sumqayıt', value: 20 },
      { name: 'Şəki', value: 15 },
      { name: 'Digər', value: 20 }
    ],
    categoryCompletionData: [
      { name: 'Ümumi məlumatlar', completed: 85 },
      { name: 'Statistik məlumatlar', completed: 65 },
      { name: 'Təhsil göstəriciləri', completed: 75 }
    ]
  };
  
  // Yükləmə simulyasiyası
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('dashboard')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <DashboardHeader />
        <DashboardContent 
          userRole={user?.role}
          dashboardData={mockData}
          chartData={chartData}
          isLoading={isLoading}
        />
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
