
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsGrid from '@/components/dashboard/StatsGrid';
import DashboardChart from '@/components/dashboard/DashboardChart';
import CategoryProgressList from '@/components/dashboard/CategoryProgressList';
import SchoolsCompletionList from '@/components/dashboard/SchoolsCompletionList';
import RegionsList from './RegionsList';
import { SuperAdminDashboardData, CategoryItem } from '@/types/dashboard';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const stats = [
    {
      title: 'Aktiv istifadəçilər',
      value: data.users?.active || 0,
      color: 'bg-green-50'
    },
    {
      title: 'Ümumi regionlar',
      value: data.regionCount || 0,
      color: 'bg-blue-50'
    },
    {
      title: 'Ümumi sektorlar',
      value: data.sectorCount || 0,
      color: 'bg-amber-50'
    },
    {
      title: 'Ümumi məktəblər',
      value: data.schoolCount || 0,
      color: 'bg-purple-50'
    }
  ];

  // Handle completion data safely regardless of type
  const completionValue = typeof data.completion === 'object' && data.completion
    ? data.completion.percentage
    : (typeof data.completion === 'number' ? data.completion : data.completionRate || 0);

  // Convert categoryData to CategoryItem array if needed
  const categoryItems: CategoryItem[] = data.categoryData 
    ? data.categoryData.map(item => ({
        id: item.id,
        name: item.name,
        completionRate: item.completionRate,
        description: item.description,
        deadline: item.deadline,
        // Ensure status is always provided
        status: item.status || 'active'
      }))
    : [];

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
              completion={completionValue}
              stats={{
                total: data.entryCount?.total || 0,
                approved: data.entryCount?.approved || 0,
                pending: data.entryCount?.pending || 0,
                rejected: data.entryCount?.rejected || 0,
                dueSoon: data.entryCount?.dueSoon || 0,
                overdue: data.entryCount?.overdue || 0,
                draft: data.entryCount?.draft || 0
              }} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kateqoriyalar</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryProgressList categories={categoryItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Məktəblər</CardTitle>
          </CardHeader>
          <CardContent>
            <SchoolsCompletionList schools={data.schoolData || []} />
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
                <span className="text-lg font-medium">{data.users?.active || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Məktəblər</span>
                <span className="text-lg font-medium">{data.schoolCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.regionData && data.regionData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Regionlar</CardTitle>
            </CardHeader>
            <CardContent>
              <RegionsList regions={data.regionData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
