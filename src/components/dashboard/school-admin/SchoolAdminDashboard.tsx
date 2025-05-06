
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormTabs } from './FormTabs';
import { StatusCards } from './StatusCards';
import { CompletionChart } from './CompletionChart';
import { NotificationList } from './NotificationList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolAdminDashboardData, FormItem } from '@/types/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading: boolean;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ data, isLoading }) => {
  const { t } = useLanguage();
  
  // Loading durumunu işləyək
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Mock data üçün tip dönüşümləri
  const recentForms: FormItem[] = (data.recentForms || []).map(form => ({
    id: form.id || 'unknown',
    title: form.title || form.name || 'Unnamed Form',
    name: form.name || form.title || 'Unnamed Form',
    status: form.status as 'pending' | 'approved' | 'rejected' | 'draft',
    categoryName: form.categoryName || '',
    dueDate: form.dueDate || '',
    createdAt: form.createdAt || '',
    completionRate: form.completionRate || 0
  }));
  
  const upcomingDeadlines: FormItem[] = (data.upcomingDeadlines || []).map(deadline => ({
    id: deadline.id || 'unknown',
    title: deadline.title || deadline.name || 'Unnamed Form',
    name: deadline.name || deadline.title || 'Unnamed Form',
    status: deadline.status as 'pending' | 'approved' | 'rejected' | 'draft',
    categoryName: deadline.categoryName || '',
    dueDate: deadline.dueDate || '',
    createdAt: deadline.createdAt || '',
    completionRate: deadline.completionRate || 0
  }));
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="col-span-full lg:col-span-2">
        <FormTabs 
          recentForms={recentForms}
          upcomingDeadlines={upcomingDeadlines}
        />
      </div>
      
      <div className="col-span-full lg:col-span-1 space-y-4">
        {/* Right column */}
        <Card>
          <CardHeader>
            <CardTitle>{t('formStatus')}</CardTitle>
            <CardDescription>{t('formStatusDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <StatusCards 
              pending={data.formStats?.pending || 0}
              approved={data.formStats?.approved || 0}
              rejected={data.formStats?.rejected || 0}
              draft={data.formStats?.draft || 0}
              dueSoon={data.formStats?.dueSoon || 0}
              overdue={data.formStats?.overdue || 0}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('completionRate')}</CardTitle>
            <CardDescription>{t('completionRateDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 pt-0">
            <CompletionChart 
              percentage={data.completionRate || 0}
              total={data.formStats?.total || 0}
              completed={data.formStats?.approved || 0}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('notifications')}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <NotificationList notifications={data.notifications || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Skeleton loading state */}
      <div className="col-span-full lg:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-full lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
