
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardFormStats, RegionAdminDashboardData } from '@/types/dashboard';
import StatsGrid from '../StatsGrid';
import DashboardChart from '../DashboardChart';
import PendingApprovalsCard from '../PendingApprovalsCard';
import SectorStatsTable from './SectorStatsTable';
import CategoryProgressList from '../CategoryProgressList';
import SchoolsCompletionList from '../SchoolsCompletionList';
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
      value: data.sectorStats?.length || 0, 
      color: 'bg-blue-100' 
    },
    { 
      title: t('totalSchools'), 
      value: data.schoolStats?.length || 0, 
      color: 'bg-green-100' 
    },
    { 
      title: t('pendingApprovals'), 
      value: data.pendingApprovals?.length || 0, 
      color: 'bg-amber-100' 
    },
  ];
  
  const formStatsData: DashboardFormStats = data.formStats || {
    pending: data.status?.pending || 0,
    approved: data.status?.approved || 0,
    rejected: data.status?.rejected || 0,
    draft: data.status?.draft || 0,
    total: data.status?.total || 0,
    dueSoon: 0,
    overdue: 0,
    completed: data.status?.approved || 0,
    percentage: data.completionRate || 0
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
          <CardContent className="px-2">
            <SectorStatsTable sectors={data.sectorStats || []} />
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">{t('pendingApprovals')}</TabsTrigger>
          <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
          <TabsTrigger value="schools">{t('schools')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="approvals" className="space-y-4">
          <PendingApprovalsCard items={data.pendingApprovals || []} />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <CategoryProgressList categories={data.categories || []} />
        </TabsContent>
        
        <TabsContent value="schools" className="space-y-4">
          <SchoolsCompletionList schools={data.schoolStats || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegionAdminDashboard;
