
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from './common/StatsCard';
import { CompletionRateCard } from './common/CompletionRateCard';
import NotificationsCard from './common/NotificationsCard';
import { SchoolAdminDashboardData, SchoolAdminDashboardProps } from '@/types/dashboard';
import { adaptDashboardNotificationToApp } from '@/utils/notificationUtils';
import { AppNotification } from '@/types/notification';
import { FormIcon, CheckCircleIcon, AlertTriangleIcon, ClockIcon } from 'lucide-react';
import FormTabs from './school-admin/FormTabs';
import { Button } from '@/components/ui/button';

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ 
  data, 
  isLoading, 
  error, 
  onRefresh, 
  navigateToDataEntry,
  handleFormClick,
  schoolId 
}) => {
  if (isLoading) {
    return <div className="p-8 text-center">Yüklənir...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Xəta baş verdi</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            Yenidən cəhd et
          </Button>
        )}
      </div>
    );
  }

  // Bildirişləri adaptasiya et
  const adaptedNotifications = Array.isArray(data.notifications)
    ? data.notifications.map(notification => {
        const notificationWithAllFields = {
          ...notification,
          isRead: notification.isRead || false
        };
        return adaptDashboardNotificationToApp(notificationWithAllFields);
      })
    : [];

  // Status obyektini DashboardStatus tipinə uyğunlaşdır
  const statusData = data.status ? {
    ...data.status,
    active: data.status.active || 0,
    inactive: data.status.inactive || 0,
  } : {
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    total: 0,
    active: 0,
    inactive: 0
  };

  // Form stats obyektini DashboardFormStats tipinə uyğunlaşdır
  const formStatsData = data.formStats ? {
    ...data.formStats,
    dueSoon: data.formStats.dueSoon || 0,
    overdue: data.formStats.overdue || 0
  } : {
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    dueSoon: 0,
    overdue: 0,
    total: 0
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Məktəb Dashboard</h2>
      
      <Grid columns={4} className="gap-4">
        <StatsCard
          title="Təsdiq gözləyən"
          value={statusData.pending}
          icon={<ClockIcon className="h-4 w-4 text-primary" />}
          description="Təsdiq gözləyən formlar"
        />
        <StatsCard
          title="Təsdiqlənmiş"
          value={statusData.approved}
          icon={<CheckCircleIcon className="h-4 w-4 text-primary" />}
          description="Təsdiqlənmiş formlar"
        />
        <StatsCard
          title="Son tarixə yaxın"
          value={formStatsData.dueSoon || 0}
          icon={<AlertTriangleIcon className="h-4 w-4 text-primary" />}
          description="Tezliklə bitəcək formlar"
        />
        <StatsCard
          title="Toplam form"
          value={statusData.total}
          icon={<FormIcon className="h-4 w-4 text-primary" />}
          description="Ümumi form sayı"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate || 0}
          title="Tamamlanma dərəcəsi"
        />
        
        <NotificationsCard
          title="Bildirişlər"
          notifications={adaptedNotifications as AppNotification[]}
        />
      </Grid>
      
      {data.upcoming && data.categories && data.pendingForms && (
        <FormTabs 
          upcoming={data.upcoming} 
          categories={data.categories}
          pendingForms={data.pendingForms}
          onNewDataEntry={navigateToDataEntry}
          handleFormClick={handleFormClick}
        />
      )}
    </div>
  );
};

export default SchoolAdminDashboard;
