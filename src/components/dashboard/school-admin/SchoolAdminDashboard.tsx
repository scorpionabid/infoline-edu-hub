
import React from 'react';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { SchoolAdminDashboardData } from '@/types/dashboard';
import { Grid } from '@/components/ui/grid';
import { CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading?: boolean;
}

export function SchoolAdminDashboard({ data, isLoading }: SchoolAdminDashboardProps) {
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  const { formStats, completionRate, notifications } = data;
  
  return (
    <div className="space-y-6">
      <Grid columns={4} className="gap-4">
        <StatsCard 
          title="Təsdiqlənmiş" 
          value={formStats.approved} 
          icon={<CheckCircle size={18} />}
          trendDirection="up"
        />
        <StatsCard 
          title="Gözləyən" 
          value={formStats.pending} 
          icon={<Clock size={18} />}
        />
        <StatsCard 
          title="Rədd edilən" 
          value={formStats.rejected} 
          icon={<XCircle size={18} />}
          trendDirection="down"
        />
        <StatsCard 
          title="Natamam" 
          value={formStats.incomplete} 
          icon={<AlertTriangle size={18} />}
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
