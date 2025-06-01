
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

  // Mock data for demonstration
  const mockActiveData = {
    schools: 150,
    regions: 10,
    sectors: 45,
    users: 200
  };

  const mockStats: DashboardFormStats = {
    total: 1000,
    approved: 750,
    pending: 150,
    rejected: 50,
    dueSoon: 25,
    overdue: 10,
    draft: 15,
    completed: 750,
    percentage: 75,
    completion_rate: 75,
    completionRate: 75
  };

  const statsGridData = [
    {
      title: t('totalSchools'),
      value: mockActiveData.schools,
      color: 'text-blue-600',
      description: t('activeSchools')
    },
    {
      title: t('totalRegions'),
      value: mockActiveData.regions,
      color: 'text-green-600',
      description: t('regions')
    },
    {
      title: t('totalSectors'),
      value: mockActiveData.sectors,
      color: 'text-purple-600',
      description: t('sectors')
    },
    {
      title: t('totalUsers'),
      value: mockActiveData.users,
      color: 'text-orange-600',
      description: t('users')
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

export default SuperAdminDashboard;
