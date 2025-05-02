
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { SectorAdminDashboardData } from '@/types/dashboard';
import { School, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const schoolStats = data.schoolsStats && data.schoolsStats.length > 0 ? data.schoolsStats[0] : null;
  
  return (
    <div className="space-y-6">
      <Grid columns={3} className="gap-6">
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon={<School className="h-4 w-4" />}
          description="Sektor daxilində məktəb sayı"
          trend={`${schoolStats?.active || 0} aktiv məktəb`}
          trendDirection="neutral"
        />
        <StatsCard
          title="İstifadəçilər"
          value={data.stats.users || 0}
          icon={<Users className="h-4 w-4" />}
          description="Sektor daxilində istifadəçi sayı"
        />
        <StatsCard
          title="Natamam məlumatlar"
          value={schoolStats?.incomplete || 0}
          icon={<AlertCircle className="h-4 w-4" />}
          description="Məlumat tələb edən məktəblər"
          trendDirection="down"
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
