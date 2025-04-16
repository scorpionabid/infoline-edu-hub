
import React from 'react';
import { SuperAdminDashboardData, StatsItem } from '@/types/dashboard';
import StatsCard from './common/StatsCard';
import StatusCards from './common/StatusCards';
import CompletionRateCard from './common/CompletionRateCard';
import PendingApprovalsCard from './common/PendingApprovalsCard';
import NotificationsCard from './common/NotificationsCard';
import RegionsList from './super-admin/RegionsList';
import { Users, School, Building2, MapPin } from 'lucide-react';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  // Statslar üçün array formatına çevirmə
  const statsItems: StatsItem[] = data.stats ? [
    { title: 'Regions', count: data.stats.regions, icon: <MapPin className="h-4 w-4 text-gray-500" /> },
    { title: 'Sectors', count: data.stats.sectors, icon: <Building2 className="h-4 w-4 text-gray-500" /> },
    { title: 'Schools', count: data.stats.schools, icon: <School className="h-4 w-4 text-gray-500" /> },
    { title: 'Users', count: data.stats.users, icon: <Users className="h-4 w-4 text-gray-500" /> }
  ] : [];
  
  // formsByStatus'u stat array-inə çevirmək
  const statusStats: StatsItem[] = data.formsByStatus ? [
    { title: 'Pending', count: data.formsByStatus.pending },
    { title: 'Approved', count: data.formsByStatus.approved },
    { title: 'Rejected', count: data.formsByStatus.rejected },
    { title: 'Total', count: data.formsByStatus.total }
  ] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <StatsCard stats={statsItems} className="col-span-full lg:col-span-2" />
      
      <StatusCards 
        stats={statusStats}
        completionRate={data.completionRate || 0}
        pendingItems={Array.isArray(data?.pendingApprovals) ? data?.pendingApprovals.length : 0}
        className="col-span-full lg:col-span-1" 
      />
      
      <CompletionRateCard value={data.completionRate || 0} className="col-span-full md:col-span-1" />
      
      <PendingApprovalsCard 
        pendingItems={data.pendingApprovals || []}
        className="col-span-full xl:col-span-2" 
      />
      
      {Array.isArray(data.regions) && data.regions.length > 0 && (
        <RegionsList 
          regions={data.regions.map(region => ({
            id: region.id,
            name: region.name,
            schoolCount: region.schoolCount || 0,
            sectorCount: region.sectorCount || 0,
            completionRate: region.completionRate || 0
          }))} 
          className="col-span-full" 
        />
      )}
      
      <NotificationsCard 
        notifications={data.notifications || []}
      />
    </div>
  );
};

export default SuperAdminDashboard;
