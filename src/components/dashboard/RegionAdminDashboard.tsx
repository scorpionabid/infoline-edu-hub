
import React from 'react';
import { RegionAdminDashboardData } from '@/types/dashboard';
import StatusCards from './common/StatusCards';
import NotificationsCard from './common/NotificationsCard';
import SectorsList from './region-admin/SectorsList';
import CategoriesList from './region-admin/CategoriesList';
import CompletionChart from './region-admin/CompletionChart';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  const sectorCompletions = data?.sectorCompletions || [];
  const categories = data?.categories || [];
  const notifications = data?.notifications || [];

  return (
    <div className="space-y-6">
      <StatusCards 
        stats={data?.stats || []}
        completionRate={data?.completionRate || 0}
        pendingApprovals={data?.pendingApprovals || 0}
        additionalStats={{
          activeUsers: data?.users,
          upcomingDeadlines: categories.length,
          recentSubmissions: data?.schools
        }}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectorsList sectors={sectorCompletions} />
        <CategoriesList categories={categories} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionChart data={sectorCompletions} />
        <NotificationsCard notifications={notifications} />
      </div>
    </div>
  );
};

export default RegionAdminDashboard;
