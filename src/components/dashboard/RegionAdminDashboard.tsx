
import React from 'react';
import { RegionAdminDashboardData, StatsItem, CategoryStat, SectorCompletionItem } from '@/types/dashboard';
import StatusCards from './common/StatusCards';
import NotificationsCard from './common/NotificationsCard';
import SectorsList from './region-admin/SectorsList';
import CategoriesList from './region-admin/CategoriesList';
import CompletionChart from './region-admin/CompletionChart';
import { Users, School, Building2 } from 'lucide-react';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  const sectors = data?.sectorCompletions || data?.sectors || [];
  const categories = data?.categories || [];
  const notifications = data?.notifications || [];
  const pendingApprovals = data?.pendingApprovals || data?.pendingItems || [];
  
  // Stats items for region admin
  const statsItems: StatsItem[] = data?.stats ? [
    { title: 'Sectors', count: data.stats.sectors, icon: <Building2 className="h-4 w-4 text-gray-500" /> },
    { title: 'Schools', count: data.stats.schools, icon: <School className="h-4 w-4 text-gray-500" /> },
    { title: 'Users', count: data.stats.users || data.users || 0, icon: <Users className="h-4 w-4 text-gray-500" /> }
  ] : [];

  // Kateqoriyaları CategoryStat formatına çeviririk
  const formattedCategories: CategoryStat[] = categories.map(cat => {
    // Əgər completion property artıq mövcuddursa, onu saxlayırıq
    if (cat.completion) return cat;
    
    // Əks halda yeni completion obyekti yaradırıq
    return {
      ...cat,
      completion: {
        total: cat.columnCount || 0,
        completed: Math.round((cat.completionPercentage || 0) * (cat.columnCount || 0) / 100),
        percentage: cat.completionPercentage || cat.completionRate || 0
      }
    };
  });

  return (
    <div className="space-y-6">
      <StatusCards 
        stats={statsItems}
        completionRate={data?.completionRate || 0}
        pendingItems={pendingApprovals.length}
        additionalStats={{
          activeUsers: data?.users,
          upcomingDeadlines: categories.length,
          recentSubmissions: data?.schools
        }}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectorsList sectors={sectors} />
        <CategoriesList categories={formattedCategories} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionChart sectors={sectors} />
        <NotificationsCard notifications={notifications} />
      </div>
    </div>
  );
};

export default RegionAdminDashboard;
