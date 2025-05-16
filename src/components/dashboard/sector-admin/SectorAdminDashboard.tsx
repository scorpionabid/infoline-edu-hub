
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
  
  const statsData = [
    { 
      title: t('totalSchools'), 
      value: data.status?.total || (data.schools ? data.schools.total : 0), 
      color: 'bg-blue-100' 
    },
    { 
      title: t('activeSchools'), 
      value: data.status?.active || (data.schools ? data.schools.active : 0), 
      color: 'bg-green-100' 
    },
    { 
      title: t('inactiveSchools'), 
      value: data.status?.inactive || (data.schools ? data.schools.inactive : 0), 
      color: 'bg-gray-100' 
    },
  ];
  
  const formStatsData: DashboardFormStats = data.formStats || {
    pending: data.status?.pending || 0,
    approved: data.status?.approved || 0,
    rejected: data.status?.rejected || 0,
    total: data.status?.total || 0,
    dueSoon: 0,
    overdue: 0,
    draft: data.status?.draft || 0,
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
            <SchoolsCompletionList schools={data.schoolStats || []} />
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
