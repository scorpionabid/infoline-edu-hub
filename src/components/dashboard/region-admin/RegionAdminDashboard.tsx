
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import NotificationsCard from '../common/NotificationsCard';
import { RegionAdminDashboardData } from '@/types/dashboard';
import { adaptDashboardNotificationToApp } from '@/types/notification';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
  regionId?: string;
}

export const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data, regionId }) => {
  // Bildirişlər notifcation.ts-dən gəlir və dashboard.ts-dən fərqli ola bilər
  // Adaptasiyadan əvvəl yoxlanış edirik ki, adaptasiya funksiyası mövcud tiplərlə işləyir
  const adaptedNotifications = Array.isArray(data.notifications) 
    ? data.notifications.map(notification => {
        const notificationWithAllFields = {
          ...notification,
          read: notification.read || notification.isRead || false,
          isRead: notification.isRead || notification.read || false
        };
        return adaptDashboardNotificationToApp(notificationWithAllFields);
      })
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Region Dashboard</h2>
      
      <Grid columns={3} className="gap-6">
        <StatsCard
          title="Sektorlar"
          value={data.sectors?.length || 0}
          icon="S"
          description="Toplam sektor sayı"
          trend={`${data.sectors?.length || 0} aktiv`}
          trendDirection="up"
        />
        <StatsCard
          title="Məktəblər"
          value={data.schoolStats?.length || 0}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`0 tamamlanmamış`}
          trendDirection="neutral"
        />
        <StatsCard
          title="Formlar"
          value={data.status?.total || 0}
          icon="F"
          description="Toplam form sayı"
          trend="Aktiv formlar"
          trendDirection="up"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completion?.percentage || 0}
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

export default RegionAdminDashboard;
