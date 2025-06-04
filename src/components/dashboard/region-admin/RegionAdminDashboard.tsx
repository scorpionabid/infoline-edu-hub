
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
    completedForms: 380,
    pendingForms: 85,
    approvalRate: 76,
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
    completionRate: 76
  };

  const formStats: DashboardFormStats = {
    completedForms: mockStats.completedForms,
    pendingForms: mockStats.pendingForms,
    approvalRate: mockStats.approvalRate,
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

  const mockSectors = [
    { 
      id: '1', 
      name: 'Sektor 1', 
      schoolCount: 10, 
      totalSchools: 12,
      activeSchools: 10,
      completionRate: 85, 
      status: 'active' as const 
    },
    { 
      id: '2', 
      name: 'Sektor 2', 
      schoolCount: 8, 
      totalSchools: 10,
      activeSchools: 8,
      completionRate: 92, 
      status: 'active' as const 
    }
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsGridData} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardChart stats={formStats} />
        <SectorStatsTable sectors={mockSectors} />
      </div>
    </div>
  );
};

export default RegionAdminDashboard;
