
import React from 'react';
import { StatsCard } from './common/StatsCard';
import { NotificationsCard } from './common/NotificationsCard';
import { CompletionRateCard } from './common/CompletionRateCard';
import { SuperAdminDashboardData } from '@/types/dashboard';
import { Grid } from '@/components/ui/grid';
import { Users, Building2, School, CheckCircle } from 'lucide-react';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
  isLoading?: boolean;
}

export function SuperAdminDashboard({ data, isLoading }: SuperAdminDashboardProps) {
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  const { stats, completionRate, notifications } = data;
  
  return (
    <div className="space-y-6">
      <Grid columns={4} className="gap-4">
        <StatsCard 
          title="Regionlar" 
          value={stats.regions} 
          icon={<Building2 size={18} />}
          trend={`+${stats.regions} son 30 gündə`}
          trendDirection="up"
        />
        <StatsCard 
          title="Sektorlar" 
          value={stats.sectors} 
          icon={<Building2 size={18} />}
        />
        <StatsCard 
          title="Məktəblər" 
          value={stats.schools} 
          icon={<School size={18} />}
        />
        <StatsCard 
          title="İstifadəçilər" 
          value={stats.users} 
          icon={<Users size={18} />}
        />
      </Grid>
      <Grid columns={2} className="gap-4">
        <CompletionRateCard 
          completionRate={completionRate} 
          title="Ümumi Tamamlanma Faizi" 
        />
        <NotificationsCard 
          title="Son Bildirişlər" 
          notifications={notifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            date: n.timestamp,
            type: n.type,
            isRead: !n.read
          }))} 
        />
      </Grid>
    </div>
  );
}
