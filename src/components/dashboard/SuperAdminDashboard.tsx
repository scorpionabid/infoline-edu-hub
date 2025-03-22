
import React from 'react';
import { School, FileBarChart, Users, Map, Globe, Activity } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from './StatsCard';
import CompletionRateCard from './CompletionRateCard';
import PendingApprovalsCard from './PendingApprovalsCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from './NotificationsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      name: string;
      value: number;
    }>;
  };
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  // Fəaliyyət qrafikası üçün demo məlumatlar
  const activityData = data.activityData || [
    { name: 'Jan', value: 20 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 28 },
    { name: 'Apr', value: 80 },
    { name: 'May', value: 99 },
    { name: 'Jun', value: 43 },
    { name: 'Jul', value: 50 },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title={t('totalRegions')}
          value={data.regions}
          icon={<Map className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <StatsCard 
          title={t('totalSectors')}
          value={data.sectors}
          icon={<Globe className="h-5 w-5 text-purple-500" />}
          color="purple"
        />
        <StatsCard 
          title={t('totalSchools')}
          value={data.schools}
          icon={<School className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatsCard 
          title={t('totalUsers')}
          value={data.users}
          icon={<Users className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionRateCard completionRate={data.completionRate} />
        <PendingApprovalsCard pendingApprovals={data.pendingApprovals} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('systemActivity')}</CardTitle>
          <CardDescription>Sistem aktivliyi statistikası</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activityData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SuperAdminDashboard;
