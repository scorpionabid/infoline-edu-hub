
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardFormStats, SectorAdminDashboardData } from '@/types/dashboard';
import StatsGrid from '../StatsGrid';
import DashboardChart from '../DashboardChart';
import PendingApprovalsCard from '../PendingApprovalsCard';
import SchoolsCompletionList from '../SchoolsCompletionList';
import CategoryProgressList from '../CategoryProgressList';
import UpcomingDeadlinesList from '../UpcomingDeadlinesList';
import PendingFormsList from '../PendingFormsList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { SchoolStat, adaptToSchoolStat } from '@/types/school';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
  isLoading?: boolean;
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data, isLoading = false }) => {
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
  
  // Handle schools data - check if it's an array or status object
  const schoolsArray = Array.isArray(data.schools) ? data.schools : [];
  
  // Get statistics data with proper type casting
  const statsData = [
    { 
      title: t('totalSchools'), 
      value: (data.status?.total || schoolsArray.length) as number,
      color: 'bg-blue-100' 
    },
    { 
      title: t('activeSchools'), 
      value: (data.status?.active || schoolsArray.filter(s => s.status === 'active').length) as number,
      color: 'bg-green-100' 
    },
    { 
      title: t('inactiveSchools'), 
      value: (data.status?.inactive || schoolsArray.filter(s => s.status === 'inactive').length) as number,
      color: 'bg-gray-100' 
    },
  ];
  
  const formStatsData: DashboardFormStats = {
    total: data.formStats?.total || data.status?.total || 0,
    pending: data.formStats?.pending || data.status?.pending || 0,
    approved: data.formStats?.approved || data.status?.approved || 0,
    rejected: data.formStats?.rejected || data.status?.rejected || 0,
    dueSoon: data.formStats?.dueSoon || 0,
    overdue: data.formStats?.overdue || 0,
    draft: data.formStats?.draft || data.status?.draft || 0,
    completed: data.formStats?.completed || data.status?.approved || 0,
    percentage: data.formStats?.percentage || data.completionRate || 0,
    completion_rate: data.formStats?.completion_rate || data.completionRate || 0
  };

  // Handle completion data safely regardless of whether it's an object or number
  const completionPercentage = typeof data.completion === 'object' && data.completion
    ? data.completion.percentage
    : (typeof data.completion === 'number' ? data.completion : data.completionRate || 0);

  // Convert school stats to the correct format and ensure property consistency
  const schoolStats: SchoolStat[] = (data.schoolStats || schoolsArray).map(school => adaptToSchoolStat(school));

  return (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t('sectorAdminWelcome')}</AlertTitle>
        <AlertDescription>
          {t('sectorAdminDashboardDescription')}
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
            <CardTitle>{t('schoolsProgress')}</CardTitle>
            <CardDescription>{t('schoolsProgressDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SchoolsCompletionList schools={schoolStats} />
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">{t('pendingApprovals')}</TabsTrigger>
          <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('upcomingDeadlines')}</TabsTrigger>
          <TabsTrigger value="pendingForms">{t('pendingForms')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="approvals" className="space-y-4">
          <PendingApprovalsCard items={data.pendingApprovals || []} />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <CategoryProgressList categories={data.categories || []} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <UpcomingDeadlinesList deadlines={data.upcoming || []} />
        </TabsContent>
        
        <TabsContent value="pendingForms" className="space-y-4">
          <PendingFormsList forms={data.pendingForms || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SectorAdminDashboard;
