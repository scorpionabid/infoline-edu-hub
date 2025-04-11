
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import NotificationsCard from './NotificationsCard';
import StatsRow from './StatsRow';
import StatusCards from './StatusCards';
import { SuperAdminDashboardData } from '@/types/dashboard';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  // Null və undefined yoxlamaları əlavə edək
  const safeData = {
    regions: data?.regions || { total: 0, active: 0, inactive: 0 },
    sectors: data?.sectors || { total: 0, active: 0, inactive: 0 },
    schools: data?.schools || { total: 0, active: 0, inactive: 0 },
    users: data?.users || { 
      total: 0, 
      active: 0, 
      inactive: 0, 
      byRole: { 
        superadmin: 0, 
        regionadmin: 0, 
        sectoradmin: 0, 
        schooladmin: 0 
      } 
    },
    completionRate: data?.completionRate || data?.statistics?.completionRate || 0,
    pendingApprovals: data?.pendingApprovals || 0,
    notifications: Array.isArray(data?.notifications) ? data.notifications : []
  };
  
  return (
    <div className="space-y-6">
      {/* Əsas statistika kartları */}
      <StatsRow stats={{
        regions: safeData.regions.total,
        sectors: safeData.sectors.total,
        schools: safeData.schools.total,
        users: safeData.users.total,
      }} />
      
      {/* Tamamlanma və təsdiq kartları */}
      <StatusCards 
        completionRate={safeData.completionRate} 
        pendingApprovals={safeData.pendingApprovals} 
      />
      
      {/* Bildirişlər kartı */}
      <NotificationsCard notifications={safeData.notifications} />
    </div>
  );
};

export default SuperAdminDashboard;
