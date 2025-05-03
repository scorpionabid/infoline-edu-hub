
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
  // Notification tipini uyğunlaşdırma
  const mappedNotifications = data.notifications.map(n => ({
    id: n.id,
    title: n.title || '',
    message: n.message,
    date: new Date(n.timestamp || n.createdAt || Date.now()).toLocaleDateString(),
    // Tipi uyğunlaşdırırıq
    type: (n.type === 'deadline' || n.type === 'approval' || n.type === 'rejection' || n.type === 'comment' || n.type === 'system')
      ? 'info' // deadline, approval -> info
      : (n.type as 'info' | 'warning' | 'success' | 'error'),
    isRead: n.isRead ?? n.read ?? false
  }));

  // Məlumatları təhlükəsiz şəkildə əldə edirik
  const schoolStats = data.schoolsStats?.[0] || { total: 0, active: 0, incomplete: 0 };
  const incompletePercent = Math.round((schoolStats.incomplete || 0) / (schoolStats.total || 1) * 100);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sektor Dashboard</h2>
      
      <Grid columns={2} className="gap-6">
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`${schoolStats.active || 0} aktiv məktəb`}
          trendDirection="up"
        />
        <StatsCard
          title="Tamamlanmamış Məktəblər"
          value={schoolStats.incomplete || 0}
          icon="I"
          description="Məlumatları tamamlanmayan məktəblər"
          trend={`${incompletePercent}% sektorda`}
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
          notifications={mappedNotifications}
        />
      </Grid>
    </div>
  );
};

export default SectorAdminDashboard;
