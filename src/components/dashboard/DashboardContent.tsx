
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import { DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData } from '@/types/supabase';
import { Loader2 } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboardData', user?.role, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User is not authenticated');
      
      // Rol əsasında uyğun edge funksiyasını çağırırıq
      const { data, error } = await supabase.functions.invoke('get-dashboard-data', {
        body: { 
          role: user.role,
          entityId: user.region_id || user.sector_id || user.school_id
        }
      });
      
      if (error) throw new Error(error.message);
      return data as DashboardData;
    },
    staleTime: 5 * 60 * 1000 // 5 dəqiqə müddətində keş olunur
  });
  
  useEffect(() => {
    if (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error(t('errorLoadingDashboard') || 'Error loading dashboard data', {
        description: (error as Error)?.message || t('unexpectedError') || 'An unexpected error occurred'
      });
    }
  }, [error, t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4">
        <p>{t('noDataAvailable')}</p>
        <button 
          onClick={() => refetch()} 
          className="mt-2 px-4 py-2 bg-primary text-white rounded-md"
        >
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  // İstifadəçi roluna görə müvafiq dashboard komponenti göstərilir
  switch (user?.role) {
    case 'superadmin':
      return <SuperAdminDashboard data={dashboardData as SuperAdminDashboardData} />;
    
    case 'regionadmin':
      return <RegionAdminDashboard data={dashboardData as RegionAdminDashboardData} />;
    
    case 'sectoradmin':
      return <SectorAdminDashboard data={dashboardData as SectorAdminDashboardData} />;
    
    case 'schooladmin':
      return <SchoolAdminDashboard data={dashboardData as SchoolAdminDashboardData} />;
      
    default:
      return <div>{t('unknownUserRole')}</div>;
  }
};

export default DashboardContent;
