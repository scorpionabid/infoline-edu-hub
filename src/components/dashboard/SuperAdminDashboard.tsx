
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from './common/StatsCard';
import { CompletionRateCard } from './common/CompletionRateCard';
import { NotificationsCard } from './common/NotificationsCard';
import { SuperAdminDashboardData } from '@/types/dashboard';
import { adaptDashboardNotificationToApp } from '@/types/notification';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  // formsByStatus sahəsini kontrol edək
  const pendingCount = data.formsByStatus?.pending || 0;
  const approvedCount = data.formsByStatus?.approved || 0;
  const rejectedCount = data.formsByStatus?.rejected || 0;
  const totalForms = data.formsByStatus?.total || 0;

  // Bildirişleri adapterlə çevirək
  const adaptedNotifications = Array.isArray(data.notifications) 
    ? data.notifications.map((notification) => adaptDashboardNotificationToApp(notification))
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sistem Dashboard</h2>
      
      <Grid columns={4} className="gap-6">
        <StatsCard
          title="Regionlar"
          value={data.stats.regions}
          icon="R"
          description="Toplam region sayı"
          trend="Aktiv"
          trendDirection="up"
        />
        <StatsCard
          title="Sektorlar"
          value={data.stats.sectors}
          icon="S"
          description="Toplam sektor sayı"
          trend="Aktiv"
          trendDirection="up"
        />
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon="M"
          description="Toplam məktəb sayı"
          trend="Aktiv"
          trendDirection="up"
        />
        <StatsCard
          title="İstifadəçilər"
          value={data.stats.users}
          icon="U"
          description="Toplam istifadəçi sayı"
          trend="Aktiv"
          trendDirection="up"
        />
      </Grid>
      
      <Grid columns={3} className="gap-6">
        <StatsCard
          title="Təsdiq gözləyən"
          value={pendingCount}
          icon="P"
          description="Təsdiq gözləyən form sayı"
          trend={`${totalForms > 0 ? Math.round((pendingCount / totalForms) * 100) : 0}% toplam`}
          trendDirection="neutral"
        />
        <StatsCard
          title="Təsdiqlənmiş"
          value={approvedCount}
          icon="A"
          description="Təsdiqlənmiş form sayı"
          trend={`${totalForms > 0 ? Math.round((approvedCount / totalForms) * 100) : 0}% toplam`}
          trendDirection="up"
        />
        <StatsCard
          title="Rədd edilmiş"
          value={rejectedCount}
          icon="R"
          description="Rədd edilmiş form sayı"
          trend={`${totalForms > 0 ? Math.round((rejectedCount / totalForms) * 100) : 0}% toplam`}
          trendDirection="down"
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

export default SuperAdminDashboard;
