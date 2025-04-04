
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { SuperAdminDashboardData } from '@/types/dashboard';
import NotificationList from './NotificationList';
import ActivityList from './ActivityList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, School, Layers, Award, Check, Clock, XCircle } from 'lucide-react';
import { StatusCards } from './StatusCards';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Define status data for the pie chart
  const statusData = data.statusData || [
    { name: t('pending'), value: data.pendingSchools },
    { name: t('approved'), value: data.approvedSchools },
    { name: t('rejected'), value: data.rejectedSchools },
  ];
  
  const formattedStatusData = statusData.filter(item => item.value > 0);
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('superadminDashboard')}</h2>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalRegions')}
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.regions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalSectors')}
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sectors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalSchools')}
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.schools}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Status Cards */}
      <StatusCards 
        data={{
          completionRate: data.completionRate,
          pendingApprovals: data.pendingApprovals
        }}
      />
      
      {/* Visualizations and Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('statusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={formattedStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {formattedStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Category Completion */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('categoryCompletionRates')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 250 }}>
              {data.categoryCompletionData && data.categoryCompletionData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart
                    data={data.categoryCompletionData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="completed" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">{t('noDataAvailable')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList items={data.activityData || []} />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('notifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationList notifications={data.notifications || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
