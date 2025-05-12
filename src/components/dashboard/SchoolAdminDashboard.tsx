
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from './common/StatsCard';
import { CompletionRateCard } from './common/CompletionRateCard';
import NotificationsCard from './common/NotificationsCard';
import { SchoolAdminDashboardData, CategoryItem, FormItem, DeadlineItem } from '@/types/dashboard';
import { AppNotification, adaptDashboardNotificationToApp } from '@/types/notification';
import { ClockIcon, CheckCircleIcon, AlertTriangleIcon, FileText } from 'lucide-react';
import FormTabs from './school-admin/FormTabs';
import { Button } from '@/components/ui/button';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
  schoolId?: string;
}

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

  // Ensure notifications exist and are properly formatted
  const adaptedNotifications: AppNotification[] = 
    Array.isArray(data.notifications)
      ? data.notifications.map(notification => {
          // Ensure all required fields exist
          const notificationWithAllFields = {
            ...notification,
            isRead: notification.isRead ?? false,
            date: notification.date ?? new Date().toISOString(),
            createdAt: notification.createdAt ?? notification.date ?? new Date().toISOString()
          };
          return adaptDashboardNotificationToApp(notificationWithAllFields);
        })
      : [];

  // Ensure status data exists
  const status = data.status || {
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    total: 0,
    active: 0,
    inactive: 0
  };

  // Ensure formStats data exists
  const formStats = data.formStats || {
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    dueSoon: 0,
    overdue: 0,
    total: 0
  };

  // Handle both completion object and completionRate number
  const completionPercentage = typeof data.completion === 'object' && data.completion
    ? (data.completion?.percentage || 0) 
    : (typeof data.completion === 'number' 
        ? data.completion 
        : (data.completionRate || 0));
      
  // Safely get completion details for display
  const completionDetails = typeof data.completion === 'object' && data.completion
    ? {
        completed: data.completion.completed || 0,
        total: data.completion.total || 0
      }
    : { completed: 0, total: 0 };

  // Prepare categories, upcoming and pendingForms
  const categories = Array.isArray(data.categories) ? data.categories as CategoryItem[] : [];
  const upcoming = Array.isArray(data.upcoming) ? data.upcoming : [];
  const pendingForms = Array.isArray(data.pendingForms) ? data.pendingForms : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Məktəb Dashboard</h2>
      
      <Grid columns={4} className="gap-4">
        <StatsCard
          title="Təsdiq gözləyən"
          value={status.pending}
          icon={<ClockIcon className="h-4 w-4 text-primary" />}
          description="Təsdiq gözləyən formlar"
        />
        <StatsCard
          title="Təsdiqlənmiş"
          value={status.approved}
          icon={<CheckCircleIcon className="h-4 w-4 text-primary" />}
          description="Təsdiqlənmiş formlar"
        />
        <StatsCard
          title="Son tarixə yaxın"
          value={formStats.dueSoon || 0}
          icon={<AlertTriangleIcon className="h-4 w-4 text-primary" />}
          description="Tezliklə bitəcək formlar"
        />
        <StatsCard
          title="Toplam form"
          value={status.total}
          icon={<FileText className="h-4 w-4 text-primary" />}
          description="Ümumi form sayı"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={completionPercentage}
          title="Tamamlanma dərəcəsi"
        />
        
        <NotificationsCard
          title="Bildirişlər"
          notifications={adaptedNotifications}
        />
      </Grid>
      
      {categories.length > 0 && upcoming.length > 0 && pendingForms.length > 0 && (
        <FormTabs 
          categories={categories}
          upcoming={upcoming}
          pendingForms={pendingForms}
          navigateToDataEntry={navigateToDataEntry}
          handleFormClick={handleFormClick}
        />
      )}
    </div>
  );
};

export default SchoolAdminDashboard;
