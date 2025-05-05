
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatusCards } from '../common/StatusCards';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { SchoolAdminDashboardData, FormItem } from '@/types/dashboard';
import { FormTabs } from './FormTabs';
import { FormStatusSection } from './FormStatusSection';
import { Loader2 } from 'lucide-react';
import { adaptDashboardNotificationToApp } from '@/types/notification';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading: boolean;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Yüklənir...</span>
      </div>
    );
  }

  // Verilənlərin mövcudluğunu yoxlayırıq
  if (!data) {
    return (
      <div className="text-center p-6 bg-muted rounded-lg">
        <p className="text-lg text-muted-foreground">Məlumatlar mövcud deyil</p>
      </div>
    );
  }

  const formStats = data.formStats || {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    incomplete: 0,
    drafts: 0,
    dueSoon: 0,
    overdue: 0
  };
  
  // Bildirişləri adapterlə çevirək
  const adaptedNotifications = Array.isArray(data.notifications) 
    ? data.notifications.map((notification) => adaptDashboardNotificationToApp(notification))
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Məktəb Dashboard</h2>

      <StatusCards 
        stats={formStats}
        totalForms={formStats.total || 0}
      />

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

      <FormStatusSection 
        pendingCount={formStats.pending || 0} 
        approvedCount={formStats.approved || 0} 
        rejectedCount={formStats.rejected || 0} 
        totalCount={formStats.total || 0}
      />

      <FormTabs 
        upcomingDeadlines={data.upcomingDeadlines as FormItem[]} 
        recentForms={data.recentForms as FormItem[]}
      />
    </div>
  );
};

export default SchoolAdminDashboard;
