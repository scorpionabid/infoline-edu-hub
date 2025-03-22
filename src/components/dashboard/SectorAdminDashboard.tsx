
import React from 'react';
import { School, FileBarChart, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from './StatsCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from './NotificationsCard';

interface SectorAdminDashboardProps {
  data: {
    schools: number;
    completionRate: number;
    pendingApprovals: number;
    pendingSchools: number;
    approvedSchools: number;
    rejectedSchools: number;
    notifications: Notification[];
  };
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title={t('schools')}
          value={data.schools}
          icon={<School className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatsCard 
          title={t('completionRate')}
          value={`${data.completionRate}%`}
          icon={<FileBarChart className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <StatsCard 
          title={t('pendingApprovals')}
          value={data.pendingApprovals}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          color="amber"
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

export default SectorAdminDashboard;
