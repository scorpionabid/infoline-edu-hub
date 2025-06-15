
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardFormStats } from '@/types/dashboard';
import StatsGrid from '../StatsGrid';
import DashboardChart from '../DashboardChart';
import SectorStatsTable from './SectorStatsTable';

interface RegionAdminDashboardProps {
  dashboardData?: any;
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ dashboardData }) => {
  const { t } = useLanguage();

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">{t('loading') || 'Yüklənir...'}</div>
    );
  }

  // Real Backend Data
  const formStats: DashboardFormStats = {
    completedForms: dashboardData.formStats?.completedForms || 0,
    pendingForms: dashboardData.formStats?.pendingForms || 0,
    approvalRate: dashboardData.formStats?.approvalRate || 0,
    total: dashboardData.formStats?.total || 0,
    completed: dashboardData.formStats?.completed || 0,
    approved: dashboardData.formStats?.approved || 0,
    pending: dashboardData.formStats?.pending || 0,
    rejected: dashboardData.formStats?.rejected || 0,
    draft: dashboardData.formStats?.draft || 0,
    dueSoon: dashboardData.formStats?.dueSoon || 0,
    overdue: dashboardData.formStats?.overdue || 0,
    percentage: dashboardData.formStats?.percentage || 0,
    completion_rate: dashboardData.formStats?.completion_rate || 0,
    completionRate: dashboardData.formStats?.completionRate || 0,
  };

  const statsGridData = [
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
      title: t('completion'),
      value: `${formStats.percentage || 0}%`,
      color: 'text-blue-600',
      description: t('completionRate')
    }
  ];

  // Real sector data
  const sectors = dashboardData.sectors || [];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsGridData} />

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardChart stats={formStats} />
        <SectorStatsTable sectors={sectors} />
      </div>
    </div>
  );
};

export default RegionAdminDashboard;
