
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { SectorAdminDashboardData, Notification } from '@/types/dashboard';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const schoolStats = data.schoolsStats?.[0] || { 
    total: data.stats.schools, 
    active: data.stats.schools, 
    incomplete: 0 
  };

  // Bildirişləri Notification tipinə çevirik (artıq UINotification əvəzinə)
  const convertedNotifications: Notification[] = data.notifications.map(notification => ({
    id: notification.id,
    title: notification.title || 'Bildiriş',
    message: notification.message,
    date: notification.date,
    isRead: notification.isRead,
    type: notification.type === 'system' ? 'info' : 
           notification.type === 'deadline' ? 'warning' :
           notification.type === 'approval' ? 'success' :
           notification.type === 'rejection' ? 'error' : 'info'
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sektor Dashboard</h2>
      
      <Grid columns={2} className="gap-6">
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`${schoolStats.active || 0} aktiv məktəb`}
          trendDirection="up"
        />
        <StatsCard
          title="Tamamlanmamış Məktəblər"
          value={schoolStats.incomplete || 0}
          icon="I"
          description="Məlumatları tamamlanmayan məktəblər"
          trend={`${Math.round((schoolStats.incomplete || 0) / (schoolStats.total || 1) * 100)}% sektorda`}
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
          notifications={convertedNotifications}
        />
      </Grid>
    </div>
  );
};

export default SectorAdminDashboard;
