
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusCards from './StatusCards';
import NotificationsCard from './NotificationsCard';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import { DashboardNotification } from '@/types/notification';
import { SchoolAdminDashboardData } from '@/types/dashboard';
import { adaptAppNotificationToDashboard } from '@/types/notification';
import useSchoolAdminDashboard from '@/hooks/useSchoolAdminDashboard';
import FormTabs from './school-admin/FormTabs';

interface SchoolAdminDashboardProps {
  schoolId?: string;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ schoolId }) => {
  const { t } = useLanguage();
  const { notifications, markAsRead } = useNotifications();
  const { data, isLoading, error } = useSchoolAdminDashboard();
  
  const [dashboardData, setDashboardData] = useState<SchoolAdminDashboardData>({
    completion: {
      percentage: 0,
      total: 0,
      completed: 0,
    },
    status: {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      total: 0,
    },
    categories: [],
    upcoming: [],
    forms: {
      pending: 0,
      approved: 0,
      rejected: 0,
      dueSoon: 0,
      overdue: 0,
      total: 0,
    },
    pendingForms: [],
    completionRate: 0,
    notifications: [],
  });

  // Bildirişləri adaptasiya etmək
  useEffect(() => {
    const dashboardNotifications: DashboardNotification[] = notifications.map(notification => ({
      ...adaptAppNotificationToDashboard(notification)
    }));

    setDashboardData(prev => ({
      ...prev,
      notifications: dashboardNotifications
    }));
  }, [notifications]);

  // Real data və ya mock data yükləmək
  useEffect(() => {
    if (!isLoading && data) {
      setDashboardData(prev => ({
        ...prev,
        completion: data.completion,
        status: data.status,
        categories: data.categories,
        upcoming: data.upcoming,
        pendingForms: data.pendingForms,
        completionRate: data.completionRate,
      }));
    }
  }, [isLoading, data]);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatusCards
        completion={dashboardData.completion}
        status={dashboardData.status}
        formStats={{
          pending: dashboardData.status.pending,
          approved: dashboardData.status.approved,
          rejected: dashboardData.status.rejected,
          draft: dashboardData.status.draft,
          total: dashboardData.status.total
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">{t('upcomingDeadlines')}</TabsTrigger>
              <TabsTrigger value="pending">{t('pendingForms')}</TabsTrigger>
              <TabsTrigger value="categories">{t('allCategories')}</TabsTrigger>
            </TabsList>

            <FormTabs 
              categories={dashboardData.categories}
              upcoming={dashboardData.upcoming}
              pendingForms={dashboardData.pendingForms}
            />
          </Tabs>
        </div>

        <div className="space-y-6">
          <NotificationsCard 
            notifications={dashboardData.notifications} 
            onMarkAsRead={markAsRead} 
          />

          <Card>
            <CardHeader>
              <CardTitle>{t('completionRate')}</CardTitle>
              <CardDescription>{t('completionRateDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(dashboardData.completionRate)}%
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {t('completedFormsInfo', {
                  completed: dashboardData.completion.completed,
                  total: dashboardData.completion.total
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
