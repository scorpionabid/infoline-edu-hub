
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from './NotificationsCard';
import NotificationsCard from './NotificationsCard';
import StatsRow from './StatsRow';
import StatusCards from './StatusCards';
import DashboardTabs from './DashboardTabs';

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
  };
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  const activityData = [
    { name: 'Yan', value: 20 },
    { name: 'Fev', value: 45 },
    { name: 'Mar', value: 28 },
    { name: 'Apr', value: 80 },
    { name: 'May', value: 99 },
    { name: 'İyn', value: 43 },
    { name: 'İyl', value: 50 },
  ];
  
  const regionSchoolsData = [
    { name: 'Bakı', value: 120 },
    { name: 'Sumqayıt', value: 75 },
    { name: 'Gəncə', value: 65 },
    { name: 'Lənkəran', value: 45 },
    { name: 'Şəki', value: 30 },
  ];
  
  const categoryCompletionData = [
    { name: 'Ümumi məlumat', completed: 78 },
    { name: 'Müəllim heyəti', completed: 65 },
    { name: 'Texniki baza', completed: 82 },
    { name: 'Maliyyə', completed: 59 },
    { name: 'Tədris planı', completed: 91 },
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
      
      {/* Tab paneli */}
      <DashboardTabs 
        activityData={activityData}
        regionSchoolsData={regionSchoolsData}
        categoryCompletionData={categoryCompletionData}
      />
      
      {/* Bildirişlər kartı */}
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SuperAdminDashboard;
