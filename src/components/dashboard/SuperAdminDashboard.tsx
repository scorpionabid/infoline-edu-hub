
import React from 'react';
import { SuperAdminDashboardData } from '@/types/dashboard';
import StatsCard from './common/StatsCard';
import StatusCards from './common/StatusCards';
import CompletionRateCard from './common/CompletionRateCard';
import PendingApprovalsCard from './common/PendingApprovalsCard';
import NotificationsCard from './common/NotificationsCard';
import RegionsList from './super-admin/RegionsList';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  // Tip dönüşümü yaparak hata mesajlarını gidermek
  const statsItems = data.stats ? [
    { label: 'Regions', value: data.stats.regions },
    { label: 'Sectors', value: data.stats.sectors },
    { label: 'Schools', value: data.stats.schools },
    { label: 'Users', value: data.stats.users }
  ] : [];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <StatsCard stats={statsItems} className="col-span-full lg:col-span-2" />
      
      <StatusCards 
        stats={{ 
          pending: data.formsByStatus?.pending || 0, 
          approved: data.formsByStatus?.approved || 0, 
          rejected: data.formsByStatus?.rejected || 0, 
          total: data.formsByStatus?.total || 0 
        }} 
        className="col-span-full lg:col-span-1" 
      />
      
      <CompletionRateCard value={data.completionRate || 0} className="col-span-full md:col-span-1" />
      
      <PendingApprovalsCard 
        approvals={data.pendingApprovals || []} 
        className="col-span-full xl:col-span-2" 
      />
      
      {Array.isArray(data.regions) && data.regions.length > 0 && (
        <RegionsList regions={data.regions.map(region => ({
          id: region.id,
          name: region.name,
          schoolCount: region.schoolCount,
          sectorCount: region.sectorCount || 0,
          completionRate: region.completionRate
        }))} className="col-span-full" />
      )}
      
      <NotificationsCard 
        notifications={data.notifications || []} 
      />
    </div>
  );
};

export default SuperAdminDashboard;
