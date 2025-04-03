
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';

/**
 * Dashboard Səhifəsi
 * İstifadəçinin roluna görə fərqli dashboard məzmunu göstərir.
 */
const Dashboard = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { dashboardData, isLoading, error, chartData, refreshData, userRole } = useDashboardData();

  // Komponent yükləndikdə və user dəyişdikdə məlumatları yükləyək
  useEffect(() => {
    if (!authLoading && user) {
      console.log('Dashboard məlumatları yüklənir, İstifadəçi:', user?.id);
      refreshData();
    }
  }, [user, authLoading]);

  // İcazəsi olmayan istifadəçiləri yoxlayaq
  if (!user || !userRole) {
    return (
      <>
        <Helmet>
          <title>{t('dashboard')} | InfoLine</title>
        </Helmet>
        <SidebarLayout>
          <div className="container mx-auto py-6">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </SidebarLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('dashboard')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          {isLoading || !dashboardData ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="border border-red-200 rounded-md p-4 bg-red-50 text-red-500">
              <h3 className="font-semibold">{t('errorLoading')}</h3>
              <p>{t('tryAgainLater')}</p>
              <button 
                className="mt-2 px-3 py-1 bg-red-100 rounded-md hover:bg-red-200"
                onClick={() => refreshData()}
              >
                {t('refreshData')}
              </button>
            </div>
          ) : (
            <DashboardContent 
              userRole={userRole} 
              dashboardData={dashboardData} 
              chartData={chartData}
              isLoading={isLoading}
            />
          )}
        </div>
      </SidebarLayout>
    </>
  );
};

export default Dashboard;
