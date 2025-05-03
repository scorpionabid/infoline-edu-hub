
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { RegionAdminDashboardData } from '@/types/dashboard';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

export const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  // Notification tipini uyğunlaşdırma
  const mappedNotifications = data.notifications.map(n => ({
    id: n.id,
    title: n.title || '',
    message: n.message,
    date: new Date(n.timestamp || n.createdAt || Date.now()).toLocaleDateString(),
    // Tipi uyğunlaşdırırıq
    type: (n.type === 'deadline' || n.type === 'approval' || n.type === 'rejection' || n.type === 'comment' || n.type === 'system')
      ? 'info' // deadline, approval -> info
      : (n.type as 'info' | 'warning' | 'success' | 'error'),
    isRead: n.isRead ?? n.read ?? false
  }));

  const sectorActivePercentage = data.sectorStats 
    ? Math.round((data.sectorStats.active / (data.sectorStats.total || 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Region Dashboard</h2>
      
      <Grid columns={3} className="gap-6">
        <StatsCard
          title="Sektorlar"
          value={data.stats.sectors}
          icon="S"
          description="Toplam sektor sayı"
          trend={`${sectorActivePercentage}% aktiv`}
          trendDirection="up"
        />
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`${data.schoolStats?.incomplete || 0} tamamlanmamış`}
          trendDirection="neutral"
        />
        <StatsCard
          title="İstifadəçilər"
          value={data.stats.users}
          icon="U"
          description="Toplam istifadəçi sayı"
          trend="Tam tamamlanıb"
          trendDirection="up"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate || 0}
          title="Ümumi Tamamlanma"
        />
                
        <NotificationsCard
          title="Bildirişlər"
          notifications={mappedNotifications}
        />
      </Grid>
    </div>
  );
};

export default RegionAdminDashboard;
