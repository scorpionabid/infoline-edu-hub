import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from './common/StatsCard';
import { CompletionRateCard } from './common/CompletionRateCard';
import NotificationsCard from './common/NotificationsCard'; 
import { SuperAdminDashboardData } from '@/types/dashboard';
import { adaptDashboardNotificationToApp } from '@/utils/notificationUtils';
import { AppNotification } from '@/types/notification';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  // Bildirişləri adaptasiya edək
  const adaptedNotifications = data.notifications 
    ? data.notifications.map(notification => adaptDashboardNotificationToApp(notification))
    : [];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Super Admin Dashboard</h2>
      
      <Grid columns={4} className="gap-6">
        <StatsCard
          title="Regionlar"
          value={data.stats?.regions || 0}
          icon="R"
          description="Toplam regionlar"
        />
        <StatsCard
          title="Sektorlar"
          value={data.stats?.sectors || 0}
          icon="S"
          description="Toplam sektorlar"
        />
        <StatsCard
          title="Məktəblər"
          value={data.stats?.schools || 0}
          icon="M"
          description="Toplam məktəblər"
        />
        <StatsCard
          title="İstifadəçilər"
          value={data.stats?.users || 0}
          icon="U"
          description="Toplam istifadəçilər"
        />
      </Grid>
      
      <Grid columns={2} className="gap-6">
        <Grid columns={2} className="gap-6">
          <StatsCard
            title="Təsdiqlənmiş"
            value={data.formsByStatus?.approved || 0}
            icon="✓"
            trendDirection="up"
          />
          <StatsCard
            title="Gözləmədə"
            value={data.formsByStatus?.pending || 0}
            icon="⏳"
          />
          <StatsCard
            title="Rədd edilmiş"
            value={data.formsByStatus?.rejected || 0}
            icon="✗"
            trendDirection="down"
          />
          <StatsCard
            title="Cəmi"
            value={data.formsByStatus?.total || 0}
            icon="#"
          />
        </Grid>
        
        <CompletionRateCard
          completionRate={data.completionRate || 0}
          title="Ümumi Tamamlanma"
        />
      </Grid>
      
      <Grid columns={1} className="gap-6">
        <NotificationsCard
          title="Bildirişlər"
          notifications={adaptedNotifications}
        />
      </Grid>
    </div>
  );
};

export default SuperAdminDashboard;
