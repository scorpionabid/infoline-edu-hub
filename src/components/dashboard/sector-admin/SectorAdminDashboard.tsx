
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { SectorAdminDashboardData } from '@/types/dashboard';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const schoolStats = data.schoolsStats?.[0] || { total: 0, active: 0, incomplete: 0 };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sektor Dashboard</h2>
      
      <Grid columns={2} className="gap-6">
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`${schoolStats?.active || 0} aktiv məktəb`}
          trendDirection="up"
        />
        <StatsCard
          title="Tamamlanmamış Məktəblər"
          value={schoolStats?.incomplete || 0}
          icon="I"
          description="Məlumatları tamamlanmayan məktəblər"
          trend={`${Math.round((schoolStats?.incomplete || 0) / (schoolStats?.total || 1) * 100)}% sektorda`}
          trendDirection="down"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate}
          title="Ümumi Tamamlanma"
        />
                
        <NotificationsCard
          title="Bildirişlər"
          notifications={data.notifications}
        />
      </Grid>
    </div>
  );
};

export default SectorAdminDashboard;
