
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardFormStats } from '@/types/dashboard';
import StatsGrid from '../StatsGrid';
import DashboardChart from '../DashboardChart';

interface SectorAdminDashboardProps {
  dashboardData?: any;
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ dashboardData }) => {
  const { t } = useLanguage();

  // Mock data for demonstration
  const mockStats: DashboardFormStats = {
    completedForms: 150,
    pendingForms: 35,
    approvalRate: 75,
    total: 200,
    completed: 150,
    approved: 130,
    pending: 35,
    rejected: 8,
    draft: 7,
    dueSoon: 5,
    overdue: 2,
    percentage: 75,
    completion_rate: 75,
    completionRate: 75
  };

  const statsGridData = [
    {
      title: t('totalApproved'),
      value: mockStats.approved || 0,
      color: 'text-green-600',
      description: t('approved')
    },
    {
      title: t('totalPending'),
      value: mockStats.pending || 0,
      color: 'text-yellow-600',
      description: t('pending')
    },
    {
      title: t('totalRejected'),
      value: mockStats.rejected || 0,
      color: 'text-red-600',
      description: t('rejected')
    },
    {
      title: t('completion'),
      value: `${mockStats.percentage || 0}%`,
      color: 'text-blue-600',
      description: t('completionRate')
    }
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsGridData} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardChart stats={mockStats} />
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
