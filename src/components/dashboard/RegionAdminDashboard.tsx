
import React from 'react';
import { School, Users, Map, Globe, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from './StatsCard';
import CompletionRateCard from './CompletionRateCard';
import PendingApprovalsCard from './PendingApprovalsCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from './NotificationsCard';

interface RegionAdminDashboardProps {
  data: {
    sectors: number;
    schools: number;
    users: number;
    completionRate: number;
    pendingApprovals: number;
    pendingSchools: number;
    approvedSchools: number;
    rejectedSchools: number;
    notifications: Notification[];
  };
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title={t('sectors')}
          value={data.sectors}
          icon={<Globe className="h-5 w-5 text-purple-500" />}
          color="purple"
        />
        <StatsCard 
          title={t('schools')}
          value={data.schools}
          icon={<School className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatsCard 
          title={t('users')}
          value={data.users}
          icon={<Users className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionRateCard 
          completionRate={data.completionRate} 
          description="Region data submission rate"
        />
        <PendingApprovalsCard 
          pendingApprovals={data.pendingApprovals}
          todayCount={6}
          weekCount={10}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title={t('pendingSchools')}
          value={data.pendingSchools}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
        <StatsCard 
          title={t('approvedSchools')}
          value={data.approvedSchools}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatsCard 
          title={t('rejectedSchools')}
          value={data.rejectedSchools}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          color="red"
        />
      </div>
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default RegionAdminDashboard;
