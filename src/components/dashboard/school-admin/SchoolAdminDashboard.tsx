
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusCards from '../StatusCards';
import NotificationsCard from '../common/NotificationsCard';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';
import { CategoryItem, DeadlineItem, FormItem, SchoolAdminDashboardData } from '@/types/dashboard';
import useSchoolAdminDashboard from '@/hooks/useSchoolAdminDashboard';
import FormTabs from './FormTabs';
import { AppNotification } from '@/types/notification';

interface SchoolAdminDashboardProps {
  schoolId?: string;
  data?: SchoolAdminDashboardData;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ schoolId, data: propData }) => {
  const { t } = useLanguage();
  const { notifications } = useNotifications();
  const { data: fetchedData, isLoading, error } = useSchoolAdminDashboard();
  
  const data = propData || fetchedData;
  
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
      active: 0,
      inactive: 0
    },
    categories: [],
    upcoming: [],
    formStats: {
      pending: 0,
      approved: 0,
      rejected: 0,
      dueSoon: 0,
      overdue: 0,
      draft: 0,
      total: 0
    },
    pendingForms: [],
    categoryData: [],
    recentActivities: [],
    notifications: []
  });

  // Real data və ya mock data yükləmək
  useEffect(() => {
    if (!isLoading && data) {
      const transformedData: SchoolAdminDashboardData = {
        completion: data.completion || {
          percentage: data.completionRate || 0,
          total: 0,
          completed: 0
        },
        status: data.status || {
          pending: 0,
          approved: 0,
          rejected: 0,
          draft: 0,
          total: 0,
          active: 0,
          inactive: 0
        },
        categories: Array.isArray(data.categories) 
          ? data.categories.map(cat => ({
              id: cat.id,
              name: cat.name,
              description: cat.description || '',
              completionRate: cat.completionRate || 0,
              status: cat.status || 'active'
            }))
          : [],
        upcoming: data.upcoming || [],
        pendingForms: data.pendingForms || [],
        formStats: data.formStats || {
          pending: data.status?.pending || 0,
          approved: data.status?.approved || 0,
          rejected: data.status?.rejected || 0,
          draft: data.status?.draft || 0,
          total: data.status?.total || 0,
          dueSoon: 0,
          overdue: 0
        },
        categoryData: data.categoryData || [],
        recentActivities: data.recentActivities || [],
        notifications: data.notifications || [],
        completionRate: data.completionRate || data.completion?.percentage || 0
      };

      setDashboardData(transformedData);
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
        formStats={dashboardData.formStats}
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
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications')}</CardTitle>
              <CardDescription>{t('recentNotifications')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('noRecentNotifications')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('completionRate')}</CardTitle>
              <CardDescription>{t('completionRateDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(dashboardData.completion?.percentage || dashboardData.completionRate || 0)}%
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {t('completedFormsInfo', {
                  completed: dashboardData.completion?.completed || 0,
                  total: dashboardData.completion?.total || 0
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
