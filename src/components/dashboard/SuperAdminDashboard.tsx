
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardFormStats, StatsGridItem } from '@/types/dashboard';
import StatsGrid from './StatsGrid';
import DashboardChart from './DashboardChart';
import { BarChart3, Users, School, MapPin } from 'lucide-react';

interface SuperAdminDashboardProps {
  dashboardData?: any;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ dashboardData }) => {
  const { t } = useLanguage();

  // Mock data for demonstration
  const mockData = {
    stats: {
      totalUsers: 150,
      totalSchools: 85,
      totalRegions: 12,
      totalSectors: 45,
    },
    completion: {
      percentage: 78,
      total: 1250,
      completed: 975
    }
  };

  const formStats: DashboardFormStats = {
    completedForms: mockData.completion.completed || 0,
    pendingForms: 175,
    approvalRate: 85,
    total: mockData.completion.total || 0,
    completed: mockData.completion.completed || 0,
    approved: 800,
    pending: 175,
    rejected: 50,
    dueSoon: 25,
    overdue: 10,
    draft: 40,
    percentage: mockData.completion.percentage || 0,
    completion_rate: mockData.completion.percentage || 0,
    completionRate: mockData.completion.percentage || 0,
  };

  const statsGridData: StatsGridItem[] = [
    {
      title: t('totalApproved'),
      value: formStats.approved || 0,
      color: 'text-green-600',
      description: t('approved')
    },
    {
      title: t('totalPending'),
      value: formStats.pending || 0,
      color: 'text-yellow-600',
      description: t('pending')
    },
    {
      title: t('totalRejected'),
      value: formStats.rejected || 0,
      color: 'text-red-600',
      description: t('rejected')
    },
    {
      title: t('totalDraft'),
      value: formStats.draft || 0,
      color: 'text-gray-600',
      description: t('draft')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% {t('fromLastMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalSchools')}
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              +5% {t('fromLastMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalRegions')}
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.totalRegions}</div>
            <p className="text-xs text-muted-foreground">
              {t('stable')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('completion')}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.completion.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              +8% {t('fromLastMonth')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('formStatistics')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart stats={formStats} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {t('dataSubmission')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ABC Məktəbi - 2 saat əvvəl
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {t('dataApproval')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    XYZ Sektor - 1 gün əvvəl
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {t('userRegistration')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yeni istifadəçi qeydiyyatdan keçdi - 3 gün əvvəl
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StatsGrid stats={statsGridData} />
    </div>
  );
};

export default SuperAdminDashboard;
