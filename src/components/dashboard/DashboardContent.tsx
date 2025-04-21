import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { School, Users, FileBarChart, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import { StatWidget } from '@/components/dashboard/StatWidget';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CompletionRateChart } from '@/components/dashboard/CompletionRateChart';
import { RegionComparisonChart } from '@/components/dashboard/RegionComparisonChart';
import { CategoryCompletionTable } from '@/components/dashboard/CategoryCompletionTable';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useStats } from '@/hooks/useStats';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardContent: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isRegionAdmin, isSectorAdmin, isSchoolAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');
  const { stats, isLoading } = useStats();
  
  const {
    schoolsCount = 0,
    usersCount = 0,
    categoriesCount = 0,
    regionsCount = 0,
    completionRate = 0,
    pendingApprovals = 0
  } = stats || {};

  useEffect(() => {
    // Rol əsasında başlanğıc tab seçimi
    if (isSchoolAdmin) {
      setActiveTab('school');
    } else if (isSectorAdmin) {
      setActiveTab('sector');
    } else if (isRegionAdmin) {
      setActiveTab('region');
    }
  }, [isSchoolAdmin, isSectorAdmin, isRegionAdmin]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {t('welcomeMessage', { name: user?.full_name || t('user') })}
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          {isRegionAdmin && <TabsTrigger value="region">{t('regionDashboard')}</TabsTrigger>}
          {isSectorAdmin && <TabsTrigger value="sector">{t('sectorDashboard')}</TabsTrigger>}
          {isSchoolAdmin && <TabsTrigger value="school">{t('schoolDashboard')}</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <StatCards />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompletionRateChart />
            <RegionComparisonChart />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('categoryCompletion')}</CardTitle>
                <CardDescription>{t('categoryCompletionDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryCompletionTable />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('recentActivity')}</CardTitle>
                <CardDescription>{t('recentActivityDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="region" className="space-y-6">
          <RegionDashboard />
        </TabsContent>
        
        <TabsContent value="sector" className="space-y-6">
          <SectorDashboard />
        </TabsContent>
        
        <TabsContent value="school" className="space-y-6">
          <SchoolDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatCards = () => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatWidget
        title={t('totalSchools')}
        icon={<School className="text-blue-500" />}
        value={schoolsCount}
        trend={+5}
        trendLabel={t('lastWeek')}
      />
      
      <StatWidget
        title={t('totalUsers')}
        icon={<Users className="text-green-500" />}
        value={usersCount}
        trend={+12}
        trendLabel={t('lastMonth')}
      />
      
      <StatWidget
        title={t('dataCategories')}
        icon={<FileBarChart className="text-purple-500" />}
        value={categoriesCount}
        trend={+2}
        trendLabel={t('lastMonth')}
      />
      
      <StatWidget
        title={t('regions')}
        icon={<Building2 className="text-orange-500" />}
        value={regionsCount}
        trend={0}
        trendLabel={t('noChange')}
      />
      
      <StatWidget
        title={t('completionRate')}
        icon={<TrendingUp className="text-blue-500" />}
        value={`${completionRate}%`}
        trend={+8}
        trendLabel={t('lastMonth')}
        trendType="positive"
      />
      
      <StatWidget
        title={t('pendingApprovals')}
        icon={<AlertTriangle className="text-yellow-500" />}
        value={pendingApprovals}
        trend={-3}
        trendLabel={t('lastWeek')}
        trendType="negative"
      />
    </div>
  );
};

const RegionDashboard = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('regionDashboard')}</h2>
      <p className="text-muted-foreground">{t('regionDashboardDescription')}</p>
      
      {/* Region specific content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('sectorPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sector performance chart would go here */}
            <div className="h-80 flex items-center justify-center bg-muted rounded-md">
              {t('sectorPerformanceChartPlaceholder')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('schoolsInRegion')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Schools in region table would go here */}
            <div className="h-80 flex items-center justify-center bg-muted rounded-md">
              {t('schoolsInRegionTablePlaceholder')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SectorDashboard = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('sectorDashboard')}</h2>
      <p className="text-muted-foreground">{t('sectorDashboardDescription')}</p>
      
      {/* Sector specific content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('schoolPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* School performance chart would go here */}
            <div className="h-80 flex items-center justify-center bg-muted rounded-md">
              {t('schoolPerformanceChartPlaceholder')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('dataCompletionBySector')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Data completion chart would go here */}
            <div className="h-80 flex items-center justify-center bg-muted rounded-md">
              {t('dataCompletionChartPlaceholder')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SchoolDashboard = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('schoolDashboard')}</h2>
      <p className="text-muted-foreground">{t('schoolDashboardDescription')}</p>
      
      {/* School specific content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('categoryStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Category status chart would go here */}
            <div className="h-80 flex items-center justify-center bg-muted rounded-md">
              {t('categoryStatusChartPlaceholder')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('pendingTasks')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pending tasks list would go here */}
            <div className="h-80 flex items-center justify-center bg-muted rounded-md">
              {t('pendingTasksListPlaceholder')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-2/3" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
