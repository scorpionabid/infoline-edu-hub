
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { FormStatus } from '@/types/form';
import { SchoolAdminDashboardData } from '@/hooks/useSchoolAdminDashboard';
import NotificationsCard from '../NotificationsCard';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData | null;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  navigateToDataEntry: () => void;
  handleFormClick: (formId: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({
  data,
  isLoading,
  error,
  onRefresh,
  navigateToDataEntry,
  handleFormClick
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive text-lg">{t('errorOccurred')}</p>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={onRefresh}>{t('tryAgain')}</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">{t('noDataAvailable')}</p>
        <Button onClick={onRefresh} className="mt-4">{t('refresh')}</Button>
      </div>
    );
  }

  // Status rəngləri üçün funksiya
  const getStatusColor = (status: FormStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Əsas statistika kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('pendingForms')}</CardTitle>
            <CardDescription>{t('pendingFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.forms.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('approvedForms')}</CardTitle>
            <CardDescription>{t('approvedFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.forms.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('rejectedForms')}</CardTitle>
            <CardDescription>{t('rejectedFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.forms.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('completionRate')}</CardTitle>
            <CardDescription>{t('completionRateDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Bildirişlər kartı */}
      <NotificationsCard notifications={data.notifications} />

      {/* Pending formlar */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingForms')}</CardTitle>
          <CardDescription>{t('pendingFormsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ScrollArea className="h-full w-full rounded-md border">
            {data.pendingForms && data.pendingForms.length > 0 ? (
              <div className="divide-y divide-border">
                {data.pendingForms.map((form) => (
                  <div key={form.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{form.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {form.date}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status as FormStatus)}`}>
                      {t(form.status)}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleFormClick(form.id)}>
                      {t('view')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t('noPendingForms')}</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Məlumat əlavə etmək düyməsi */}
      <div className="flex justify-end">
        <Button onClick={navigateToDataEntry} size="lg" className="gap-2">
          {t('addData')}
        </Button>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
