
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { RegionAdminDashboardData } from '@/types/dashboard';
import { Building, School, Users } from 'lucide-react';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

export const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  // Boş obyektlər ilə inicializə edək
  const sectorStats = data.sectorStats || { total: 0, active: 0 };
  const schoolStats = data.schoolStats || { total: 0, active: 0, incomplete: 0 };

  return (
    <div className="space-y-6">
      <Grid columns={3} className="gap-6">
        <StatsCard
          title="Sektorlar"
          value={data.stats.sectors}
          icon={<Building className="h-4 w-4" />}
          description="Region daxilində sektor sayı"
          trend={`${sectorStats.active} aktiv sektor`}
          trendDirection="neutral"
        />
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon={<School className="h-4 w-4" />}
          description="Region daxilində məktəb sayı"
          trend={`${schoolStats.active} aktiv məktəb`}
          trendDirection="neutral"
        />
        <StatsCard
          title="İstifadəçilər"
          value={data.stats.users}
          icon={<Users className="h-4 w-4" />}
          description="Region daxilində istifadəçi sayı"
          trend={`${data.stats.users} aktiv istifadəçi`}
          trendDirection="neutral"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          title="Region Tamamlama Faizi"
          completionRate={data.completionRate}
        />
        <NotificationsCard
          title="Bildirişlər"
          notifications={data.notifications}
        />
      </Grid>
    </div>
  );
};
