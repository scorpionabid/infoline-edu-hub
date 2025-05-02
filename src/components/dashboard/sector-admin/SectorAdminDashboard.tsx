
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { SectorAdminDashboardData } from '@/types/dashboard';
import { School, Users } from 'lucide-react';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <Grid columns={3} className="gap-6">
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon={<School className="h-4 w-4" />}
          description="Sektor daxilində məktəb sayı"
          trend={`${data.schoolStats.active} aktiv məktəb`}
          trendDirection="neutral"
        />
        <StatsCard
          title="Tamamlanmamış"
          value={data.schoolStats.incomplete}
          icon="!"
          description="Məlumatları tamamlanmamış məktəblər"
          trend={`${data.schoolStats.incomplete} məktəb`}
          trendDirection="down"
        />
        <StatsCard
          title="İstifadəçilər"
          value={data.stats.users}
          icon={<Users className="h-4 w-4" />}
          description="Sektor daxilində istifadəçi sayı"
          trend={`${data.stats.users} aktiv istifadəçi`}
          trendDirection="neutral"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate}
          title="Sektor Tamamlama Faizi"
        />
        <NotificationsCard
          title="Bildirişlər"
          notifications={data.notifications}
        />
      </Grid>
    </div>
  );
};
