
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from './NotificationsCard';
import NotificationsCard from './NotificationsCard';
import StatsRow from './StatsRow';
import StatusCards from './StatusCards';
import DashboardTabs from './DashboardTabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface SuperAdminDashboardProps {
  data: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
    completionRate: number;
    pendingApprovals: number;
    notifications: Notification[];
    activityData?: Array<{
      id: string;
      action: string;
      actor: string;
      target: string;
      time: string;
    }>;
    pendingSchools?: number;
    approvedSchools?: number;
    rejectedSchools?: number;
    statusData?: {
      completed: number;
      pending: number;
      rejected: number;
      notStarted: number;
    };
    regionCompletionData?: Array<{
      name: string;
      completed: number;
    }>;
    sectorCompletionData?: Array<{
      name: string;
      completed: number;
    }>;
    categoryCompletionData?: Array<{
      name: string;
      completed: number;
    }>;
  };
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  // Əmin olaq ki, data mövcuddur
  if (!data) {
    console.error('SuperAdminDashboard: data yoxdur', data);
    return (
      <div className="p-4 border rounded-md">
        <p className="text-center text-muted-foreground">Məlumatlar mövcud deyil</p>
      </div>
    );
  }
  
  console.log("SuperAdminDashboard data:", data);
  
  // Notification verilərini kontrola keçirək
  const notifications = Array.isArray(data.notifications) ? data.notifications : [];
  
  // Vizualizasiya üçün məlumatları hazırlayaq
  const regionChartData = data.regionCompletionData || [
    { name: 'Bakı', completed: 85 },
    { name: 'Sumqayıt', completed: 72 },
    { name: 'Gəncə', completed: 65 },
    { name: 'Quba', completed: 58 },
    { name: 'Lənkəran', completed: 63 }
  ];
  
  const sectorChartData = data.sectorCompletionData || [
    { name: 'Sektor A', completed: 92 },
    { name: 'Sektor B', completed: 78 },
    { name: 'Sektor C', completed: 56 },
    { name: 'Sektor D', completed: 81 },
    { name: 'Sektor E', completed: 69 }
  ];
  
  const categoryChartData = data.categoryCompletionData || [
    { name: 'Ümumi məlumat', completed: 95 },
    { name: 'Təhsil prosesi', completed: 82 },
    { name: 'Maddi-texniki baza', completed: 71 },
    { name: 'Müəllim heyəti', completed: 88 },
    { name: 'Şagird statistikası', completed: 79 }
  ];
  
  return (
    <div className="space-y-6">
      {/* Əsas statistika kartları */}
      <StatsRow stats={data} />
      
      {/* Tamamlanma və təsdiq kartları */}
      <StatusCards 
        completionRate={data.completionRate} 
        pendingApprovals={data.pendingApprovals} 
      />
      
      {/* Region tamamlanma kartı */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Region tamamlanma dərəcəsi</CardTitle>
            <CardDescription>Regionlar üzrə məlumatların tamamlanma faizi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Tamamlanma']}
                    labelFormatter={(label) => `Region: ${label}`}
                  />
                  <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sektor tamamlanma dərəcəsi</CardTitle>
            <CardDescription>Sektorlar üzrə məlumatların tamamlanma faizi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Tamamlanma']}
                    labelFormatter={(label) => `Sektor: ${label}`}
                  />
                  <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Kateqoriya tamamlanma dərəcəsi</CardTitle>
            <CardDescription>Kateqoriyalar üzrə məlumatların tamamlanma faizi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Tamamlanma']}
                    labelFormatter={(label) => `Kateqoriya: ${label}`}
                  />
                  <Bar dataKey="completed" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tab paneli */}
      <DashboardTabs 
        activityData={[
          { name: 'Yan', value: 20 },
          { name: 'Fev', value: 45 },
          { name: 'Mar', value: 28 },
          { name: 'Apr', value: 80 },
          { name: 'May', value: 99 },
          { name: 'İyn', value: 43 },
          { name: 'İyl', value: 50 },
        ]}
        regionSchoolsData={[
          { name: 'Bakı', value: 120 },
          { name: 'Sumqayıt', value: 75 },
          { name: 'Gəncə', value: 65 },
          { name: 'Lənkəran', value: 45 },
          { name: 'Şəki', value: 30 },
        ]}
        categoryCompletionData={categoryChartData}
      />
      
      {/* Bildirişlər kartı */}
      <NotificationsCard notifications={notifications} />
    </div>
  );
};

export default SuperAdminDashboard;
