
import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from './StatsCard';
import CompletionRateCard from './CompletionRateCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from './NotificationsCard';

interface SchoolAdminDashboardProps {
  data: {
    forms: {
      pending: number;
      approved: number;
      rejected: number;
      dueSoon: number;
      overdue: number;
    };
    completionRate: number;
    notifications: Notification[];
  };
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatsCard 
          title={t('pendingForms')}
          value={data.forms.pending}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
        <StatsCard 
          title={t('approvedForms')}
          value={data.forms.approved}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatsCard 
          title={t('rejectedForms')}
          value={data.forms.rejected}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          color="red"
        />
        <StatsCard 
          title={t('dueSoon')}
          value={data.forms.dueSoon}
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <StatsCard 
          title={t('overdue')}
          value={data.forms.overdue}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          color={data.forms.overdue > 0 ? "red" : "green"}
        />
      </div>
      
      <CompletionRateCard 
        completionRate={data.completionRate} 
        description="School data submission rate"
      />
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SchoolAdminDashboard;
