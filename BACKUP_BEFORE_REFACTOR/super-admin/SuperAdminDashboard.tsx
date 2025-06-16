
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardFormStats } from '@/types/dashboard';
import StatsGrid from '../StatsGrid';
import DashboardChart from '../DashboardChart';

interface SuperAdminDashboardProps {
  dashboardData?: any;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ dashboardData }) => {
  const { t } = useLanguage();

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">{t('loading') || 'Yüklənir...'}</div>
    );
  }

  // Use real data from the backend
  const formStats: DashboardFormStats = {
    completedForms: dashboardData.formsByStatus?.approved || 0,
    pendingForms: dashboardData.formsByStatus?.pending || 0,
    approvalRate: dashboardData.approvalRate || 0,
    total: dashboardData.formsByStatus?.total || 0,
    completed: dashboardData.formsByStatus?.approved || 0,
    approved: dashboardData.formsByStatus?.approved || 0,
    pending: dashboardData.formsByStatus?.pending || 0,
    rejected: dashboardData.formsByStatus?.rejected || 0,
    dueSoon: 0,
    overdue: 0,
    draft: 0,
    percentage: dashboardData.completionRate || 0,
    completion_rate: dashboardData.completionRate || 0,
    completionRate: dashboardData.completionRate || 0,
  };

  const statsGridData = [
    {
      title: t('totalSchools') || 'Məktəblər',
      value: dashboardData.totalSchools || 0,
      color: 'text-blue-600',
      description: t('activeSchools') || 'Aktiv məktəblər'
    },
    {
      title: t('totalRegions') || 'Regionlar',
      value: dashboardData.totalRegions || 0,
      color: 'text-green-600',
      description: t('regions') || 'Regionlar'
    },
    {
      title: t('totalSectors') || 'Sektorlar',
      value: dashboardData.totalSectors || 0,
      color: 'text-purple-600',
      description: t('sectors') || 'Sektorlar'
    },
    {
      title: t('totalUsers') || 'İstifadəçilər',
      value: dashboardData.totalUsers || 0,
      color: 'text-orange-600',
      description: t('users') || 'İstifadəçilər'
    }
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsGridData} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardChart stats={formStats} />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
