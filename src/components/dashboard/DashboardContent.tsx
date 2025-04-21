
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatusCards from './common/StatusCards';
import PendingItems from './common/PendingItems';
import RecentActivity from './common/RecentActivity';
import CategoryList from './common/CategoryList';
import RegionList from './common/RegionList';
import ReportChart from '../reports/ReportChart';

interface DashboardContentProps {
  data: any;
  chartData: any;
  isLoading: boolean;
  error: Error | null;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  data,
  chartData,
  isLoading,
  error
}) => {
  const { t } = useLanguage();
  
  if (isLoading) {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full lg:col-span-2" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || t('errorLoadingDashboard')}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('noDashboardData')}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Determine user role and show appropriate dashboard
  const isSuperAdmin = data.stats?.regions !== undefined;
  const isRegionAdmin = data.stats?.sectors !== undefined && !isSuperAdmin;
  
  const statsItems = isSuperAdmin ? [
    {
      title: t('regions'),
      count: data.stats?.regions || 0,
      description: t('totalRegions')
    },
    {
      title: t('sectors'),
      count: data.stats?.sectors || 0,
      description: t('totalSectors')
    },
    {
      title: t('schools'),
      count: data.stats?.schools || 0,
      description: t('totalSchools')
    },
    {
      title: t('users'),
      count: data.stats?.users || 0,
      description: t('totalUsers')
    }
  ] : isRegionAdmin ? [
    {
      title: t('sectors'),
      count: data.stats?.sectors || 0,
      description: t('totalSectors')
    },
    {
      title: t('schools'),
      count: data.stats?.schools || 0,
      description: t('totalSchools')
    },
    {
      title: t('users'),
      count: data.stats?.users || 0,
      description: t('totalUsers')
    }
  ] : [];
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatusCards 
        stats={statsItems}
        completionRate={data.completionRate}
        pendingItems={data.pendingApprovals?.length || 0}
      />
      
      {/* Charts & Tables (SuperAdmin) */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('activityOverview')}</CardTitle>
              <CardDescription>{t('recentActivityDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportChart 
                data={chartData?.activityData || []} 
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
                data={chartData?.regionSchoolsData || []} 
                title={t('schoolsByRegion')}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* RegionAdmin Charts */}
      {isRegionAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('sectorCompletion')}</CardTitle>
              <CardDescription>{t('sectorCompletionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.sectors?.map((sector: any) => (
                  <div key={sector.id} className="flex items-center justify-between">
                    <div className="w-40 truncate">{sector.name}</div>
                    <div className="flex-1 mx-4">
                      <Progress value={sector.completionRate || 0} className="h-2" />
                    </div>
                    <div className="w-10 text-right">{sector.completionRate || 0}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('categoryCompletion')}</CardTitle>
              <CardDescription>{t('categoryCompletionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportChart 
                data={chartData?.categoryCompletionData || []} 
                title={t('completionByCategory')}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Tabs content based on role */}
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">{t('pendingApprovals')}</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="regions">{t('regions')}</TabsTrigger>}
          {isRegionAdmin && <TabsTrigger value="sectors">{t('sectors')}</TabsTrigger>}
          {(isSuperAdmin || isRegionAdmin) && <TabsTrigger value="categories">{t('categories')}</TabsTrigger>}
          <TabsTrigger value="activity">{t('recentActivity')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <PendingItems items={data.pendingApprovals || []} />
        </TabsContent>
        
        {isSuperAdmin && (
          <TabsContent value="regions" className="space-y-4">
            <RegionList regions={data.regions || []} />
          </TabsContent>
        )}
        
        {isRegionAdmin && (
          <TabsContent value="sectors" className="space-y-4">
            <RegionList regions={data.sectors || []} />
          </TabsContent>
        )}
        
        {(isSuperAdmin || isRegionAdmin) && (
          <TabsContent value="categories" className="space-y-4">
            <CategoryList categories={data.categories || []} />
          </TabsContent>
        )}
        
        <TabsContent value="activity" className="space-y-4">
          <RecentActivity activities={data.recentActivities || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardContent;
