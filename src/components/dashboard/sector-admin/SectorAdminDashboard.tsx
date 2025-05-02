
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
  const schoolStats = data.schoolsStats[0] || { total: 0, active: 0, incomplete: 0 };

  return (
    <div className="space-y-6">
      <Grid columns={3} className="gap-6">
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon={<School className="h-4 w-4" />}
          description="Sektor daxilində məktəb sayı"
          trend={`${schoolStats.active} aktiv məktəb`}
          trendDirection="neutral"
        />
        <StatsCard
          title="Tamamlanmayan məktəblər"
          value={schoolStats.incomplete}
          icon={<School className="h-4 w-4" />}
          description="Məlumatları tam doldurmamış məktəblər"
          trend={`${schoolStats.incomplete} tamamlanmayan məktəb`}
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
          title="Sektor Tamamlama Faizi"
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

export default SectorAdminDashboard;
