
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
  const sectorStatsTotal = data.sectorStats?.total || (data.stats?.sectors || 0);
  const sectorStatsActive = data.sectorStats?.active || (data.stats?.sectors || 0);
  const activePercentage = sectorStatsTotal > 0 ? 
    Math.round((sectorStatsActive / sectorStatsTotal) * 100) : 
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
          value={data.stats?.sectors}
          icon="S"
          description="Toplam sektor sayı"
          trend={`${activePercentage}% aktiv`}
          trendDirection="up"
        />
        <StatsCard
          title="Məktəblər"
          value={data.stats?.schools}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`${data.schoolStats?.incomplete || 0} tamamlanmamış`}
          trendDirection="neutral"
        />
        <StatsCard
          title="İstifadəçilər"
          value={data.stats?.users}
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
          notifications={adaptedNotifications}
        />
      </Grid>
    </div>
  );
};

export default RegionAdminDashboard;
