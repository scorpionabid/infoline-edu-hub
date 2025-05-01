import React from 'react';
import { Grid } from '../../components/ui/grid';
import { StatsCard } from './common/StatsCardProps';
import { NotificationsCard } from './common/NotificationsCardProps';
import CompletionRateCard from '../../components/dashboard/common/CompletionRateCard';
import { SuperAdminDashboardData } from '@/types/dashboard';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export function SuperAdminDashboard({ data }: SuperAdminDashboardProps) {
  return (
    <div className="space-y-6">
      <Grid columns={4} className="gap-6">
        <StatsCard 
          title="Regionlar" 
          value={data.regionCount} 
          icon="R" 
          description="Ümumi region sayı"
          trend={`Son 30 gün: +${data.regionCount > 0 ? Math.floor(data.regionCount * 0.1) : 0}`}
          trendDirection="up"
        />
        <StatsCard 
          title="Sektorlar" 
          value={data.sectorCount} 
          icon="S" 
          description="Ümumi sektor sayı"
          trend={`Son 30 gün: +${data.sectorCount > 0 ? Math.floor(data.sectorCount * 0.15) : 0}`}
          trendDirection="up"
        />
        <StatsCard 
          title="Məktəblər" 
          value={data.schoolCount} 
          icon="M" 
          description="Ümumi məktəb sayı"
          trend={`Son 30 gün: +${data.schoolCount > 0 ? Math.floor(data.schoolCount * 0.05) : 0}`}
          trendDirection="up"
        />
        <StatsCard 
          title="İstifadəçilər" 
          value={data.userCount} 
          icon="İ" 
          description="Ümumi istifadəçi sayı"
          trend={`Son 30 gün: +${data.userCount > 0 ? Math.floor(data.userCount * 0.2) : 0}`}
          trendDirection="up"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard 
          title="Sistem ümumi məlumat tamamlanma faizi" 
          completionRate={data.completionRate} 
        />
        <CompletionRateCard 
          title="Təsdiq edilmiş məlumatlar" 
          completionRate={data.approvalRate} 
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <NotificationsCard
          title="Son bildirişlər"
          notifications={data.notifications.map(n => ({
            id: n.id || Math.random().toString(),
            title: n.title || 'Bildiriş',
            message: n.message,
            date: n.date || new Date(n.timestamp || Date.now()).toLocaleDateString(),
            type: n.type || 'info',
            isRead: n.read
          }))}
          viewAllLink="/notifications"
        />
      </Grid>
    </div>
  );
}

export default SuperAdminDashboard;
