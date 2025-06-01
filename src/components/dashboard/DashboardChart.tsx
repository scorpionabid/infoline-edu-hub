
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DashboardFormStats } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface DashboardChartProps {
  stats: DashboardFormStats;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ stats }) => {
  const { t } = useLanguage();

  const data = [
    {
      name: t('approved'),
      value: stats.approved || 0,
      fill: '#10b981'
    },
    {
      name: t('pending'),
      value: stats.pending || 0,
      fill: '#f59e0b'
    },
    {
      name: t('rejected'),
      value: stats.rejected || 0,
      fill: '#ef4444'
    },
    {
      name: t('draft'),
      value: stats.draft || 0,
      fill: '#6b7280'
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DashboardChart;
