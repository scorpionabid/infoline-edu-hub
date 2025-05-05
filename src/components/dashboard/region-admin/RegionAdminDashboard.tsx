
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { RegionAdminDashboardData } from '@/types/dashboard';
import { adaptDashboardNotificationToApp } from '@/types/notification';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

export const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  // Sektör statistikası üçün default dəyərlər təyin edirik
  const sectorStatsTotal = data.sectorStats?.length || (data.stats?.totalSectors || 0);
  const activePercentage = sectorStatsTotal > 0 ? 
    Math.round((sectorStatsTotal / sectorStatsTotal) * 100) : 
    100;

  // Bildirişleri adapterlə çevirək
  const adaptedNotifications = Array.isArray(data.notifications) 
    ? data.notifications.map((notification) => adaptDashboardNotificationToApp(notification))
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Region Dashboard</h2>
      
      <Grid columns={3} className="gap-6">
        <StatsCard
          title="Sektorlar"
          value={data.stats?.totalSectors}
          icon="S"
          description="Toplam sektor sayı"
          trend={`${activePercentage}% aktiv`}
          trendDirection="up"
        />
        <StatsCard
          title="Məktəblər"
          value={data.stats?.totalSchools}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`0 tamamlanmamış`} // data.schoolStats?.incomplete || 0 burada istifadə edə bilərsiniz
          trendDirection="neutral"
        />
        <StatsCard
          title="Formlar"
          value={data.stats?.totalForms || 0}
          icon="F"
          description="Toplam form sayı"
          trend="Aktiv formlar"
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
          notifications={adaptedNotifications}
        />
      </Grid>
    </div>
  );
};

export default RegionAdminDashboard;
