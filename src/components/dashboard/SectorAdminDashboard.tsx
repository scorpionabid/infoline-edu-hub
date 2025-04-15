
import React from 'react';
import { SectorAdminDashboardData } from '@/types/dashboard';
import NotificationsCard from './NotificationsCard';
import PendingApprovalsCard from './PendingApprovalsCard';
import StatusCards from './StatusCards';
import SchoolsList from './sector-admin/SchoolsList';
import ActivityLogCard from './sector-admin/ActivityLogCard';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const pendingItems = data?.pendingItems || [];
  const schoolStats = data?.schoolStats || [];
  const notifications = data?.notifications || [];
  const activityLog = data?.activityLog || [];

  return (
    <div className="space-y-6">
      <StatusCards 
        stats={data?.stats || []}
        completionRate={data?.completionRate || 0}
        schools={data?.schools || 0}
        sectorRate={data?.completionRate || 0}
        pendingApprovals={data?.pendingApprovals || 0}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SchoolsList schools={schoolStats} />
        <PendingApprovalsCard pendingItems={pendingItems} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityLogCard activities={activityLog} />
        <NotificationsCard notifications={notifications} />
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
