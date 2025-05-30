
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardFormStats, RegionAdminDashboardData } from '@/types/dashboard';
import StatsGrid from '../StatsGrid';
import DashboardChart from '../DashboardChart';
import PendingApprovalsCard from '../PendingApprovalsCard';
import SchoolsCompletionList from '../SchoolsCompletionList';
import CategoryProgressList from '../CategoryProgressList';
import UpcomingDeadlinesList from '../UpcomingDeadlinesList';
import SectorsList from './SectorsList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
  isLoading?: boolean;
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data, isLoading = false }) => {
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const statsData = [
    { 
      title: t('totalSectors'), 
      value: data.status?.total || 0,
      color: 'bg-blue-100' 
    },
    { 
      title: t('activeSectors'), 
      value: data.status?.active || 0,
      color: 'bg-green-100' 
    },
    { 
      title: t('inactiveSectors'), 
      value: data.status?.inactive || 0,
      color: 'bg-gray-100' 
    },
  ];
  
  const formStatsData: DashboardFormStats = {
    total: data.formStats?.total || data.status?.total || 0,
    pending: data.formStats?.pending || data.status?.pending || 0,
    approved: data.formStats?.approved || data.status?.approved || 0,
    rejected: data.formStats?.rejected || data.status?.rejected || 0,
    draft: data.formStats?.draft || data.status?.draft || 0,
    dueSoon: data.formStats?.dueSoon || 0,
    overdue: data.formStats?.overdue || 0,
    completed: data.formStats?.completed || data.status?.approved || 0,
    percentage: data.formStats?.percentage || data.completionRate || 0,
    completion_rate: data.formStats?.completion_rate || data.completionRate || 0
  };

  // Handle completion data safely regardless of whether it's an object or number
  const completionPercentage = typeof data.completion === 'object' && data.completion
    ? data.completion.percentage
    : (typeof data.completion === 'number' ? data.completion : data.completionRate || 0);

  return (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t('regionAdminWelcome')}</AlertTitle>
        <AlertDescription>
          {t('regionAdminDashboardDescription')}
        </AlertDescription>
      </Alert>
      
      <StatsGrid stats={statsData} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('completionRate')}</CardTitle>
            <CardDescription>{t('overallCompletionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardChart 
              completion={completionPercentage} 
              stats={formStatsData} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('sectorsProgress')}</CardTitle>
            <CardDescription>{t('sectorsProgressDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SectorsList sectors={data.sectorStats || []} />
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">{t('pendingApprovals')}</TabsTrigger>
          <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('upcomingDeadlines')}</TabsTrigger>
          <TabsTrigger value="schools">{t('schools')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="approvals" className="space-y-4">
          <PendingApprovalsCard items={data.pendingApprovals || []} />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <CategoryProgressList categories={data.categories || []} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <UpcomingDeadlinesList deadlines={data.upcomingDeadlines || []} />
        </TabsContent>
        
        <TabsContent value="schools" className="space-y-4">
          <SchoolsCompletionList schools={data.schoolStats || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegionAdminDashboard;
