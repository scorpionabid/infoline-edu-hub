
import React from 'react';
import { SectorAdminDashboardData, StatsItem } from '@/types/dashboard';
import NotificationsCard from './common/NotificationsCard';
import PendingApprovalsCard from './common/PendingApprovalsCard';
import StatusCards from './common/StatusCards';
import SchoolsList from './sector-admin/SchoolsList';
import ActivityLogCard from './sector-admin/ActivityLogCard';
import { School, Users } from 'lucide-react';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const pendingItems = data?.pendingItems || [];
  const schoolsStats = data?.schoolsStats || [];
  const notifications = data?.notifications || [];
  const activityLog = data?.activityLog || [];
  
  // Stats items for sector admin
  const statsItems: StatsItem[] = data?.stats ? [
    { title: 'Schools', count: data.stats.schools, icon: <School className="h-4 w-4 text-gray-500" /> },
    { title: 'Users', count: data.stats.users || 0, icon: <Users className="h-4 w-4 text-gray-500" /> }
  ] : [];

  return (
    <div className="space-y-6">
      <StatusCards 
        stats={statsItems}
        completionRate={data?.completionRate || 0}
        pendingItems={pendingItems.length}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SchoolsList schools={schoolsStats} />
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
