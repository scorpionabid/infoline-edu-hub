
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsGrid from './StatsGrid';
import DashboardChart from './DashboardChart';
import CategoryProgressList from './CategoryProgressList';
import SchoolsCompletionList from './SchoolsCompletionList';
import { DashboardFormStats } from '@/types/dashboard';

const SuperAdminDashboard = ({ data }) => {
  const stats = [
    {
      title: 'Aktiv istifadəçilər',
      value: data.activeUsers || 0,
      color: 'bg-green-50'
    },
    {
      title: 'Ümumi regionlar',
      value: data.totalRegions || 0,
      color: 'bg-blue-50'
    },
    {
      title: 'Ümumi sektorlar',
      value: data.totalSectors || 0,
      color: 'bg-amber-50'
    },
    {
      title: 'Ümumi məktəblər',
      value: data.totalSchools || 0,
      color: 'bg-purple-50'
    }
  ];

  const dashboardStats: DashboardFormStats = {
    completed: data.approvedEntries || 0,
    approved: data.approvedEntries || 0,
    pending: data.pendingEntries || 0,
    rejected: data.rejectedEntries || 0,
    dueSoon: data.dueSoonEntries || 0,
    overdue: data.overdueEntries || 0,
    draft: data.draftEntries || 0,
    percentage: data.completionRate || 0,
    completion_rate: data.completionRate || 0
  };

  return (
    <div className="space-y-4">
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Qeydlərin tamamlanması</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart 
              completion={data.completionRate || 0} 
              stats={dashboardStats} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kateqoriyalar</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryProgressList categories={data.categories || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tamamlanma dərəcələri</CardTitle>
          </CardHeader>
          <CardContent>
            <SchoolsCompletionList schools={data.schools || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Məlumat Statistikası</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">İstifadəçilər</span>
                <span className="text-lg font-medium">{data.activeUsers || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Məktəblər</span>
                <span className="text-lg font-medium">{data.totalSchools || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
