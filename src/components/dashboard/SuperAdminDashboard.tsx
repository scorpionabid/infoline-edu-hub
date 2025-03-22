
import React from 'react';
import { School, FileBarChart, Users, Map, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from './StatsCard';
import CompletionRateCard from './CompletionRateCard';
import PendingApprovalsCard from './PendingApprovalsCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from './NotificationsCard';

interface SuperAdminDashboardProps {
  data: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
    completionRate: number;
    pendingApprovals: number;
    notifications: Notification[];
  };
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
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
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SuperAdminDashboard;
