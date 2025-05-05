
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import NotificationsCard from '../common/NotificationsCard';
import { SectorAdminDashboardData } from '@/types/dashboard';
import { Notification, adaptDashboardNotificationToApp } from '@/types/notification';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  // Default məlumatlar əlavə edək
  const schoolStatsData = data.schoolsStats?.[0] || { 
    total: data.stats?.schools || 0, 
    active: data.stats?.schools || 0, 
    incomplete: 0 
  };

  // Dashboard notifikasiyalarını uyğunlaşdıraq
  const adaptedNotifications: Notification[] = Array.isArray(data.notifications) 
    ? data.notifications.map((notification) => adaptDashboardNotificationToApp(notification))
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sektor Dashboard</h2>
      
      <Grid columns={2} className="gap-6">
        <StatsCard
          title="Məktəblər"
          value={data.stats?.schools || 0}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`${schoolStatsData.active || 0} aktiv məktəb`}
          trendDirection="up"
        />
        <StatsCard
          title="Tamamlanmamış Məktəblər"
          value={schoolStatsData.incomplete || 0}
          icon="I"
          description="Məlumatları tamamlanmayan məktəblər"
          trend={`${Math.round((schoolStatsData.incomplete || 0) / (schoolStatsData.total || 1) * 100)}% sektorda`}
          trendDirection="down"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate || 0}
          title="Ümumi Tamamlanma"
        />
                
        <NotificationsCard
          title="Bildirişlər"
          notifications={adaptedNotifications}
        />
      </Grid>
    </div>
  );
};

export default SectorAdminDashboard;
