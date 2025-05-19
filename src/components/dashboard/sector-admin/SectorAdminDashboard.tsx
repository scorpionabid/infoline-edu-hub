
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
import { SchoolStat } from '@/types/school';

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
  
  // Get statistics data from the correct property with proper type casting
  const statsData = [
    { 
      title: t('totalSchools'), 
      value: (data.status?.total || 
        (data.schools && 'total' in data.schools ? data.schools.total : 
         (data.schools ? data.schools.length : 0))) as number,
      color: 'bg-blue-100' 
    },
    { 
      title: t('activeSchools'), 
      value: (data.status?.active || 
        (data.schools && 'active' in data.schools ? data.schools.active : 
         (data.schools ? data.schools.filter(s => s.status === 'active').length : 0))) as number,
      color: 'bg-green-100' 
    },
    { 
      title: t('inactiveSchools'), 
      value: (data.status?.inactive || 
        (data.schools && 'inactive' in data.schools ? data.schools.inactive : 
         (data.schools ? data.schools.filter(s => s.status === 'inactive').length : 0))) as number,
      color: 'bg-gray-100' 
    },
  ];
  
  const formStatsData: DashboardFormStats = {
    pending: data.formStats?.pending || data.status?.pending || 0,
    approved: data.formStats?.approved || data.status?.approved || 0,
    rejected: data.formStats?.rejected || data.status?.rejected || 0,
    total: data.formStats?.total || data.status?.total || 0,
    dueSoon: data.formStats?.dueSoon || 0,
    overdue: data.formStats?.overdue || 0,
    draft: data.formStats?.draft || data.status?.draft || 0,
    completed: data.formStats?.completed || data.status?.approved || 0,
    percentage: data.formStats?.percentage || data.completionRate || 0
  };

  // Handle completion data safely regardless of whether it's an object or number
  const completionPercentage = typeof data.completion === 'object' && data.completion
    ? data.completion.percentage
    : (typeof data.completion === 'number' ? data.completion : data.completionRate || 0);

  // Convert school stats to the correct format
  const schoolStats: SchoolStat[] = (data.schoolStats || []).map(school => ({
    id: school.id,
    name: school.name,
    completionRate: school.completionRate || school.completion || 0,
    status: school.status,
    // Include other properties that might be used
    lastUpdate: school.lastUpdate,
    pendingForms: school.pendingForms,
    formsCompleted: school.formsCompleted,
    totalForms: school.totalForms,
    principalName: school.principalName || school.principal_name,
    address: school.address,
    phone: school.phone,
    email: school.email
  }));

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
