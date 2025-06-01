
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

  // Mock data for demonstration
  const mockStats: DashboardFormStats = {
    total: 500,
    completed: 380,
    approved: 320,
    pending: 85,
    rejected: 15,
    draft: 20,
    dueSoon: 12,
    overdue: 5,
    percentage: 76,
    completion_rate: 76,
    completionRate: 76,
    active: {
      schools: 25,
      sectors: 8,
      users: 45
    },
    inactive: {
      schools: 3,
      sectors: 1,
      users: 2
    }
  };

  const formStats: DashboardFormStats = {
    total: mockStats.total,
    pending: mockStats.pending,
    approved: mockStats.approved,
    rejected: mockStats.rejected,
    draft: mockStats.draft,
    dueSoon: mockStats.dueSoon,
    overdue: mockStats.overdue,
    completed: mockStats.completed,
    percentage: mockStats.percentage,
    completion_rate: mockStats.completion_rate,
    completionRate: mockStats.completionRate
  };

  const statsGridData = [
    {
      title: t('totalApproved'),
      value: mockStats.approved,
      color: 'text-green-600',
      description: t('approved')
    },
    {
      title: t('totalPending'),
      value: mockStats.pending,
      color: 'text-yellow-600',
      description: t('pending')
    },
    {
      title: t('totalRejected'),
      value: mockStats.rejected,
      color: 'text-red-600',
      description: t('rejected')
    },
    {
      title: t('completion'),
      value: `${mockStats.percentage}%`,
      color: 'text-blue-600',
      description: t('completionRate')
    }
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsGridData} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardChart stats={formStats} />
        <SectorStatsTable />
      </div>
    </div>
  );
};

export default RegionAdminDashboard;
