
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useRealDashboardData } from '@/hooks/dashboard/useRealDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';
import LoadingScreen from '@/components/auth/LoadingScreen';

const Statistics = () => {
  const { t } = useLanguage();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin } = usePermissions();
  const { dashboardData, loading, error } = useRealDashboardData();

  if (loading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{t('common.error')}</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t('statistics.noData')}</p>
      </div>
    );
  }

  // Transform data for charts
  const chartData = [
    {
      name: t('statistics.approved'),
      value: dashboardData.formsByStatus?.approved || 0,
      color: '#10b981'
    },
    {
      name: t('statistics.pending'),
      value: dashboardData.formsByStatus?.pending || 0,
      color: '#f59e0b'
    },
    {
      name: t('statistics.rejected'),
      value: dashboardData.formsByStatus?.rejected || 0,
      color: '#ef4444'
    }
  ];

  // Get role-specific data
  const getRoleSpecificData = () => {
    if (isSuperAdmin) {
      return {
        totalSchools: dashboardData.totalSchools || 0,
        totalUsers: dashboardData.totalUsers || 0,
        completionRate: dashboardData.completionRate || 0,
        pendingApprovals: dashboardData.formsByStatus?.pending || 0,
        activeForms: dashboardData.formsByStatus?.total || 0,
        lastUpdated: new Date().toLocaleDateString()
      };
    } else if (isRegionAdmin) {
      return {
        totalSchools: dashboardData.totalSchools || 0,
        completionRate: dashboardData.completionRate || 0,
        pendingApprovals: dashboardData.formsByStatus?.pending || 0,
        activeForms: dashboardData.formsByStatus?.total || 0,
        schoolsCompleted: dashboardData.formsByStatus?.approved || 0,
        schoolsPending: dashboardData.formsByStatus?.pending || 0,
        lastUpdated: new Date().toLocaleDateString()
      };
    } else {
      return {
        totalSchools: dashboardData.totalSchools || 0,
        completionRate: dashboardData.completionRate || 0,
        pendingApprovals: dashboardData.formsByStatus?.pending || 0,
        activeForms: dashboardData.formsByStatus?.total || 0,
        schoolsCompleted: dashboardData.formsByStatus?.approved || 0,
        schoolsPending: dashboardData.formsByStatus?.pending || 0,
        lastUpdated: new Date().toLocaleDateString()
      };
    }
  };

  const stats = getRoleSpecificData();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('navigation.statistics')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('statistics.lastUpdated')}: {stats.lastUpdated}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('statistics.totalSchools')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin && stats.totalUsers && `+${stats.totalUsers} ${t('statistics.users')}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('statistics.completionRate')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.completionRate)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate > 50 ? t('statistics.aboveAverage') : t('statistics.belowAverage')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('statistics.pendingApprovals')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              {t('statistics.needsReview')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('statistics.activeForms')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeForms}</div>
            <p className="text-xs text-muted-foreground">
              {t('statistics.totalForms')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('statistics.formsByStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('statistics.performanceMetrics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('statistics.completionRate')}</span>
                <span className="text-sm text-muted-foreground">{Math.round(stats.completionRate)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('statistics.approvalRate')}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((dashboardData.formsByStatus?.approved || 0) / Math.max(1, dashboardData.formsByStatus?.total || 1) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(dashboardData.formsByStatus?.approved || 0) / Math.max(1, dashboardData.formsByStatus?.total || 1) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
