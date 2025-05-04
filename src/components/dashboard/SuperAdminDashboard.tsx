
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from './common/StatsCard';
import { NotificationsCard } from './common/NotificationsCard';
import { CompletionRateCard } from './common/CompletionRateCard';
import { SuperAdminDashboardData, UINotification } from '@/types/dashboard';
import { Building, Users, Landmark, School } from 'lucide-react';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  // Bildirişləri UI formatına çeviririk
  const convertedNotifications: UINotification[] = data.notifications.map(notification => ({
    id: notification.id,
    title: notification.title || 'Bildiriş',
    message: notification.message,
    date: notification.date,
    isRead: notification.isRead,
    type: notification.type === 'system' ? 'info' : 
           notification.type === 'deadline' ? 'warning' :
           notification.type === 'approval' ? 'success' :
           notification.type === 'rejection' ? 'error' : 'info'
  }));

  return (
    <div className="space-y-6">
      <Grid columns={4} className="gap-6">
        <StatsCard
          title="Regionlar"
          value={data.stats.regions}
          icon={<Landmark className="h-4 w-4" />}
          description="Ümumi region sayı"
          trend={`${data.stats.regions} aktiv region`}
          trendDirection="neutral"
        />
        <StatsCard
          title="Sektorlar"
          value={data.stats.sectors}
          icon={<Building className="h-4 w-4" />}
          description="Ümumi sektor sayı"
          trend={`${data.stats.sectors} aktiv sektor`}
          trendDirection="neutral"
        />
        <StatsCard
          title="Məktəblər"
          value={data.stats.schools}
          icon={<School className="h-4 w-4" />}
          description="Ümumi məktəb sayı"
          trend={`${data.stats.schools} aktiv məktəb`}
          trendDirection="neutral"
        />
        <StatsCard
          title="İstifadəçilər"
          value={data.stats.users}
          icon={<Users className="h-4 w-4" />}
          description="Ümumi istifadəçi sayı"
          trend={`${data.stats.users} aktiv istifadəçi`}
          trendDirection="neutral"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate || 0}
          title="Ümumi Tamamlama Faizi"
        />
        <NotificationsCard
          title="Bildirişlər"
          notifications={convertedNotifications}
        />
      </Grid>
    </div>
  );
};

export default SuperAdminDashboard;
