import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchDashboardChartData } from '@/services/dashboardService';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import { DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData } from '@/types/dashboard';
import { usePermissions } from '@/hooks/auth/usePermissions';

export const DashboardContent: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { userRole, isRegionAdmin, isSectorAdmin, isSchoolAdmin, isLoading } = usePermissions();
  
  // Fetch dashboard data based on user role
  const fetchDashboardData = async (): Promise<DashboardData> => {
    console.log('Fetching dashboard data for role:', userRole);
    
    // Basic dashboard data structure
    const dashboardData: any = {
      stats: {
        totalSchools: 0,
        totalCategories: 0,
        totalColumns: 0,
        activeSchools: 0
      },
      completionRate: 0,
      notifications: []
    };
    
    try {
      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      dashboardData.notifications = notificationsData || [];
      
      // Fetch statistics based on role
      if (userRole === 'superadmin') {
        const superAdminData = await fetchSuperAdminData();
        return { ...dashboardData, ...superAdminData };
      } else if (isRegionAdmin) {
        const regionAdminData = await fetchRegionAdminData(user?.regionId);
        return { ...dashboardData, ...regionAdminData };
      } else if (isSectorAdmin) {
        const sectorAdminData = await fetchSectorAdminData(user?.sectorId);
        return { ...dashboardData, ...sectorAdminData };
      } else if (isSchoolAdmin) {
        const schoolAdminData = await fetchSchoolAdminData(user?.schoolId);
        return { ...dashboardData, ...schoolAdminData };
      }
      
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  };
  
  // Fetch data for SuperAdmin
  const fetchSuperAdminData = async (): Promise<SuperAdminDashboardData> => {
    const [regions, sectors, schools] = await Promise.all([
      supabase.from('regions').select('*'),
      supabase.from('sectors').select('*'),
      supabase.from('schools').select('*')
    ]);
    
    return {
      regionStats: {
        total: regions.data?.length || 0,
        active: regions.data?.filter(r => r.status === 'active').length || 0
      },
      sectorStats: {
        total: sectors.data?.length || 0,
        active: sectors.data?.filter(s => s.status === 'active').length || 0
      },
      schoolStats: {
        total: schools.data?.length || 0,
        active: schools.data?.filter(s => s.status === 'active').length || 0,
        incomplete: schools.data?.filter(s => s.completion_rate < 50).length || 0
      },
      stats: {
        totalSchools: schools.data?.length || 0,
        totalCategories: 10,
        totalColumns: 50,
        activeSchools: schools.data?.filter(s => s.status === 'active').length || 0
      },
      completionRate: 75,
      notifications: []
    };
  };
  
  // Fetch data for RegionAdmin
  const fetchRegionAdminData = async (regionId: string | undefined): Promise<RegionAdminDashboardData> => {
    const [sectors, schools] = await Promise.all([
      supabase.from('sectors').select('*').eq('region_id', regionId),
      supabase.from('schools').select('*').eq('region_id', regionId)
    ]);
    
    return {
      sectorStats: {
        total: sectors.data?.length || 0,
        active: sectors.data?.filter(s => s.status === 'active').length || 0
      },
      schoolStats: {
        total: schools.data?.length || 0,
        active: schools.data?.filter(s => s.status === 'active').length || 0,
        incomplete: schools.data?.filter(s => s.completion_rate < 50).length || 0
      },
      stats: {
        totalSchools: schools.data?.length || 0,
        totalCategories: 10,
        totalColumns: 50,
        activeSchools: schools.data?.filter(s => s.status === 'active').length || 0
      },
      completionRate: 60,
      notifications: []
    };
  };
  
  // Fetch data for SectorAdmin
  const fetchSectorAdminData = async (sectorId: string | undefined): Promise<SectorAdminDashboardData> => {
    const schools = await supabase.from('schools').select('*').eq('sector_id', sectorId);
    
    return {
      schoolStats: {
        total: schools.data?.length || 0,
        active: schools.data?.filter(s => s.status === 'active').length || 0,
        incomplete: schools.data?.filter(s => s.completion_rate < 50).length || 0
      },
      stats: {
        totalSchools: schools.data?.length || 0,
        totalCategories: 10,
        totalColumns: 50,
        activeSchools: schools.data?.filter(s => s.status === 'active').length || 0
      },
      completionRate: 45,
      notifications: []
    };
  };
  
  // Fetch data for SchoolAdmin
  const fetchSchoolAdminData = async (schoolId: string | undefined): Promise<SchoolAdminDashboardData> => {
    // Fetch form statistics
    const { data: entries, error: entriesError } = await supabase
      .from('data_entries')
      .select('status')
      .eq('school_id', schoolId);
    
    if (entriesError) {
      console.error('Error fetching data entries:', entriesError);
      throw entriesError;
    }
    
    // Count entries by status
    const formStats = {
      approved: entries?.filter(e => e.status === 'approved').length || 0,
      pending: entries?.filter(e => e.status === 'pending').length || 0,
      rejected: entries?.filter(e => e.status === 'rejected').length || 0,
      incomplete: entries?.filter(e => e.status === 'draft').length || 0
    };
    
    return {
      formStats,
      completionRate: 30,
      notifications: []
    };
  };
  
  const { data, isLoading: isDataLoading, error } = useQuery({
    queryKey: ['dashboard-data', userRole, user?.id],
    queryFn: fetchDashboardData,
    enabled: !!user && !isLoading,
  });
  
  const {
    data: chartData,
    isLoading: isChartLoading,
    error: chartError,
  } = useQuery({
    queryKey: ['dashboard-chart-data'],
    queryFn: fetchDashboardChartData,
  });
  
  if (isLoading || isDataLoading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">{t('errorLoadingDashboard')}</h3>
            <p className="text-muted-foreground">{(error as Error)?.message || t('unexpectedError')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render dashboard based on user role
  return (
    <div>
      {userRole === 'superadmin' && data && (
        <SuperAdminDashboard data={data as SuperAdminDashboardData} />
      )}
      
      {isRegionAdmin && data && (
        <RegionAdminDashboard data={data as RegionAdminDashboardData} />
      )}
      
      {isSectorAdmin && data && (
        <SectorAdminDashboard data={data as SectorAdminDashboardData} />
      )}
      
      {isSchoolAdmin && data && (
        <SchoolAdminDashboard data={data as SchoolAdminDashboardData} />
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="grid gap-4">
    <Card>
      <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-8 w-8" />
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px] mt-2" />
      </CardContent>
    </Card>
  </div>
);
