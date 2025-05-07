
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguageSafe } from '@/context/LanguageContext';
import { FilePlus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompletionProgress from '@/components/dashboard/CompletionProgress';
import FormTabs from '@/components/dashboard/school-admin/FormTabs';
import StatusCards from '@/components/dashboard/StatusCards';
import NotificationList from '@/components/notifications/NotificationList';
import { SchoolAdminDashboardData, FormItem, DeadlineItem } from '@/types/dashboard';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading: boolean;
  onFormClick: (formId: string) => void;
  navigateToDataEntry: () => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({
  data,
  isLoading,
  onFormClick,
  navigateToDataEntry,
}) => {
  const { t } = useLanguageSafe();
  const navigate = useNavigate();

  // Örnek veri varsa kullan, yoksa boş array
  const pendingForms: FormItem[] = data?.recentForms?.filter(form => 
    form.status === 'pending' || form.status === 'draft') || [];
  
  const upcomingDeadlines: DeadlineItem[] = data?.upcomingDeadlines || [];

  if (isLoading) {
    return (
      <div className="h-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h2>
        <Button onClick={navigateToDataEntry} className="flex gap-2 items-center">
          <FilePlus className="h-4 w-4" />
          {t('newDataEntry')}
        </Button>
      </div>

      <StatusCards formStats={data.formStats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('yourForms')}</CardTitle>
            <Button variant="outline" size="sm" onClick={navigateToDataEntry}>
              {t('viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            <FormTabs 
              pendingForms={pendingForms} 
              upcomingDeadlines={upcomingDeadlines} 
              onFormClick={onFormClick} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('completionRate')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <CompletionProgress rate={data.completionRate} />
            
            {data.completionRate < 100 && (
              <div className="flex items-start gap-2 rounded-lg border p-3 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-medium">{t('incompleteFormsWarning')}</p>
                  <p className="text-muted-foreground mt-1">
                    {t('pleaseCompleteAllRequiredForms')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('notifications')}</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationList 
            notifications={data.notifications || []} 
            limit={5}
            emptyMessage={t('noNotifications')}
            onViewAll={() => navigate('/notifications')}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminDashboard;
