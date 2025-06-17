import React from 'react';
import { Grid } from '@/components/ui/grid';
import StatsCard from '../StatsCard';
import CompletionRateCard from '../CompletionRateCard';
import NotificationsCard from '../common/NotificationsCard';
import { SchoolAdminDashboardData, CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';
import { AppNotification, adaptDashboardNotificationToApp } from '@/types/notification';
import { ClockIcon, CheckCircleIcon, AlertTriangleIcon, FileText } from 'lucide-react';
import FormTabs from './FormTabs';
import { Button } from '@/components/ui/button';
import { LinksCard } from './LinksCard';
import { FilesCard } from './FilesCard';
import { useTranslation } from '@/contexts/TranslationContext';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({
  data,
  isLoading,
  error,
  onRefresh,
  navigateToDataEntry,
  handleFormClick
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="p-8 text-center">{t('ui.loading')}</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{t('ui.error')}</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            {t('ui.retry')}
          </Button>
        )}
      </div>
    );
  }

  console.log('[SchoolAdminDashboard] Data received:', data);

  // Ensure notifications exist and are properly formatted
  const adaptedNotifications: AppNotification[] = 
    Array.isArray(data.notifications)
      ? data.notifications.map(notification => {
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

  // Ensure formStats data exists with dueSoon fallback
  const formStats = data.formStats ? {
    ...data.formStats,
    dueSoon: data.formStats.dueSoon || 0
  } : {
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
    ? (data.completion.percentage || 0) 
    : (typeof data.completion === 'number' 
        ? data.completion 
        : (data.completionRate || 0));

  // Prepare categories as CategoryItem array
  const categories: CategoryItem[] = Array.isArray(data.categories) 
    ? data.categories
    : [];
    
  // Handle upcoming deadlines
  const upcoming: DeadlineItem[] = Array.isArray(data.upcoming) 
    ? data.upcoming 
    : [];
    
  // Handle pending forms
  const pendingForms: FormItem[] = Array.isArray(data.pendingForms) 
    ? data.pendingForms 
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('dashboard.role_specific.schooladmin.welcome')}</h2>
      
      <Grid columns={4} className="gap-4">
        <StatsCard
          title={t('status.pending_approval')}
          value={status.pending}
          icon={<ClockIcon className="h-4 w-4 text-primary" />}
          description={t('dashboard.stats.pending_forms')}
        />
        <StatsCard
          title={t('status.approved')}
          value={status.approved}
          icon={<CheckCircleIcon className="h-4 w-4 text-primary" />}
          description={t('dashboard.stats.completed_forms')}
        />
        <StatsCard
          title={t('status.due_soon')}
          value={formStats.dueSoon || 0}
          icon={<AlertTriangleIcon className="h-4 w-4 text-primary" />}
          description={t('dashboard.stats.overdue_forms')}
        />
        <StatsCard
          title={t('dashboard.stats.total_forms')}
          value={status.total || 0}
          icon={<FileText className="h-4 w-4 text-primary" />}
          description={t('dashboard.stats.total_forms_description')}
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={completionPercentage}
          title={t('dashboard.stats.completion_rate')}
        />
        
        <NotificationsCard
          title={t('dashboard.notifications.title')}
          notifications={adaptedNotifications}
        />
      </Grid>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <LinksCard />
        <FilesCard />
      </div>

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
