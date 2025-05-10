
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsGrid from '@/components/dashboard/StatsGrid';
import DashboardChart from '@/components/dashboard/DashboardChart';
import CategoryProgressList from '@/components/dashboard/CategoryProgressList';
import SchoolsCompletionList from '@/components/dashboard/SchoolsCompletionList';
import RegionsList from './RegionsList';
import { SuperAdminDashboardData } from '@/types/dashboard';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
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
              stats={{
                approved: data.approvedEntries || 0,
                pending: data.pendingEntries || 0,
                rejected: data.rejectedEntries || 0
              }} 
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
            <CardTitle>Məktəblər</CardTitle>
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

        {data.regions && data.regions.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Regionlar</CardTitle>
            </CardHeader>
            <CardContent>
              <RegionsList regions={data.regions} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
