
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusCards from '../StatusCards';
import NotificationsCard from '../common/NotificationsCard';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';
import { 
  CategoryItem, 
  DeadlineItem, 
  FormItem, 
  SchoolAdminDashboardData 
} from '@/types/dashboard';
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

  // Load data from props or fetched data
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
        formStats: data.formStats || {
          pending: data.status?.pending || 0,
          approved: data.status?.approved || 0,
          rejected: data.status?.rejected || 0,
          draft: data.status?.draft || 0,
          total: data.status?.total || 0,
          dueSoon: 0,
          overdue: 0
        },
        categories: Array.isArray(data.categories) 
          ? data.categories
          : [],
        upcoming: data.upcoming || [],
        pendingForms: data.pendingForms || [],
        categoryData: data.categoryData || [],
        recentActivities: data.recentActivities || [],
        notifications: data.notifications || [],
        completionRate: data.completionRate || (
          typeof data.completion === 'object' && data.completion 
            ? data.completion?.percentage || 0 
            : (typeof data.completion === 'number' ? data.completion : 0)
        )
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

  // Safely compute the completion rate
  const completionRate = typeof dashboardData.completion === 'object' && dashboardData.completion
    ? dashboardData.completion?.percentage || 0
    : typeof dashboardData.completion === 'number'
      ? dashboardData.completion
      : dashboardData.completionRate || 0;
      
  // Safely get completion details for display
  const completionDetails = typeof dashboardData.completion === 'object' && dashboardData.completion
    ? {
        completed: dashboardData.completion?.completed || 0,
        total: dashboardData.completion?.total || 0
      }
    : { completed: 0, total: 0 };

  // Prepare categories, upcoming and pendingForms data
  const categories = Array.isArray(dashboardData.categories) ? dashboardData.categories as CategoryItem[] : [];
  const upcoming = dashboardData.upcoming || [];
  const pendingForms = dashboardData.pendingForms || [];

  return (
    <div className="space-y-6">
      <StatusCards
        completion={typeof dashboardData.completion === 'object' ? dashboardData.completion : { percentage: completionRate, total: 0, completed: 0 }}
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
              categories={categories}
              upcoming={upcoming}
              pendingForms={pendingForms}
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
                {Math.round(completionRate)}%
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {t('completedFormsInfo', {
                  completed: completionDetails.completed,
                  total: completionDetails.total
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
