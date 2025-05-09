
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from './common/StatsCard';
import { CompletionRateCard } from './common/CompletionRateCard';
import RegionCompletionCard from './superadmin/RegionCompletionCard';
import SectorCompletionCard from './superadmin/SectorCompletionCard';
import NotificationsCard from './common/NotificationsCard';
import { SuperAdminDashboardProps } from '@/types/dashboard';
import { adaptDashboardNotificationToApp } from '@/utils/notificationUtils';

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  // Convert notifications to AppNotification type
  const adaptedNotifications = Array.isArray(data.notifications) 
    ? data.notifications.map(notification => adaptDashboardNotificationToApp(notification)) 
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Super Admin Dashboard</h2>
      
      <Grid columns={4} className="gap-6">
        <StatsCard
          title="Regionlar"
          value={data.totalRegions || 0}
          icon="R"
          description="Toplam region sayı"
          trend={`${data.regionStats?.filter(r => r.status === 'active')?.length || 0} aktiv`}
          trendDirection="up"
        />
        <StatsCard
          title="Sektorlar"
          value={data.totalSectors || 0}
          icon="S"
          description="Toplam sektor sayı"
          trend={`${data.sectorStats?.filter(s => s.status === 'active')?.length || 0} aktiv`}
          trendDirection="up"
        />
        <StatsCard
          title="Məktəblər"
          value={data.totalSchools || 0}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`${data.schoolStats?.filter(s => s.status === 'active')?.length || 0} aktiv`}
          trendDirection="up"
        />
        <StatsCard
          title="Formlar"
          value={data.status?.total || 0}
          icon="F"
          description="Toplam form sayı"
          trend={`${data.status?.approved || 0} təsdiqlənmiş`}
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
          onMarkAsRead={() => {}}
        />
      </Grid>
      
      <Grid columns={2} className="gap-6">
        <RegionCompletionCard regions={data.regionStats || []} />
        <SectorCompletionCard sectors={data.sectorStats || []} />
      </Grid>
    </div>
  );
};

export default SuperAdminDashboard;
