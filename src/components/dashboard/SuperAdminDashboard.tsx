
import React from 'react';
import { SuperAdminDashboardData, StatsItem } from '@/types/dashboard';
import StatsCard from './common/StatsCard';
import StatusCards from './common/StatusCards';
import CompletionRateCard from './common/CompletionRateCard';
import PendingApprovalsCard from './common/PendingApprovalsCard';
import NotificationsCard from './common/NotificationsCard';
import RegionsList from './super-admin/RegionsList';
import { Users, School, Building2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import ReportChart from '../reports/ReportChart';
import PendingItems from './common/PendingItems';
import CategoryList from './common/CategoryList';
import RecentActivity from './common/RecentActivity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData | any;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }
  
  // Statslar üçün array formatına çevirmə
  const statsItems: StatsItem[] = [
    { title: t('regions'), count: data.stats?.regions || 0, icon: <MapPin className="h-4 w-4 text-gray-500" /> },
    { title: t('sectors'), count: data.stats?.sectors || 0, icon: <Building2 className="h-4 w-4 text-gray-500" /> },
    { title: t('schools'), count: data.stats?.schools || 0, icon: <School className="h-4 w-4 text-gray-500" /> },
    { title: t('users'), count: data.stats?.users || 0, icon: <Users className="h-4 w-4 text-gray-500" /> }
  ];
  
  // formsByStatus'u stat array-inə çevirmək
  const statusStats: StatsItem[] = data.formsByStatus ? [
    { title: t('pending'), count: data.formsByStatus.pending || 0 },
    { title: t('approved'), count: data.formsByStatus.approved || 0 },
    { title: t('rejected'), count: data.formsByStatus.rejected || 0 },
    { title: t('total'), count: data.formsByStatus.total || 0 }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Əsas statistika kartları */}
      <StatusCards 
        stats={statsItems}
        completionRate={data.completionRate || 0}
        pendingItems={Array.isArray(data?.pendingApprovals) ? data?.pendingApprovals.length : 0}
      />
      
      {/* Qrafikalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('activityOverview')}</CardTitle>
            <CardDescription>{t('recentActivityDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportChart 
              data={[
                { name: t('newSchools'), value: 24 },
                { name: t('newEntries'), value: 85 },
                { name: t('approvedEntries'), value: 67 },
                { name: t('rejectedEntries'), value: 12 }
              ]}
              title={t('activityByType')}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('regionSchoolsDistribution')}</CardTitle>
            <CardDescription>{t('schoolsDistributionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportChart 
              data={Array.isArray(data.regions) ? data.regions.slice(0, 5).map(r => ({
                name: r.name,
                value: r.schoolCount || 0
              })) : []}
              title={t('schoolsByRegion')}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Tab paneli */}
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">{t('pendingApprovals')}</TabsTrigger>
          <TabsTrigger value="regions">{t('regions')}</TabsTrigger>
          <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
          <TabsTrigger value="activity">{t('recentActivity')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <PendingItems items={data.pendingApprovals || []} />
        </TabsContent>
        
        <TabsContent value="regions" className="space-y-4">
          {Array.isArray(data.regions) && data.regions.length > 0 && (
            <RegionsList regions={data.regions} className="w-full" />
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <CategoryList categories={data.categories || []} />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <RecentActivity activities={data.recentActivities || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
