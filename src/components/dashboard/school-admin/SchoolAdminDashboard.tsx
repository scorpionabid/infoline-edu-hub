
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/notification';
import NotificationsCard from '../NotificationsCard';
import { 
  SchoolAdminDashboardData, 
  FormItem 
} from '@/types/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormStatus } from '@/types/form';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import FormStatusSection from './FormStatusSection';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
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

  // Status rəngləri üçün funksiya
  const getStatusColor = (status: FormStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'dueSoon':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-[120px]" />
          </CardHeader>
          <CardContent className="h-[400px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="text-lg font-semibold">{t('errorLoadingData')}</h3>
          <p className="text-muted-foreground text-center">{error.message}</p>
          <Button onClick={onRefresh} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('tryAgain')}
          </Button>
        </div>
      </Card>
    );
  }

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
            <div className="text-2xl font-bold">{data.forms?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('approvedForms')}</CardTitle>
            <CardDescription>{t('approvedFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.forms?.approved || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('rejectedForms')}</CardTitle>
            <CardDescription>{t('rejectedFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.forms?.rejected || 0}</div>
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

      {/* Vaxt və status statistikası */}
      <FormStatusSection 
        dueSoonCount={data.forms?.dueSoon || 0}
        overdueCount={data.forms?.overdue || 0}
        totalCount={data.forms?.total || 0}
      />

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
                      <div className="text-sm text-muted-foreground">{form.date}</div>
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
              <div className="flex flex-col items-center justify-center h-full">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-center text-muted-foreground">{t('noDataToProcess')}</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Yeni məlumat əlavə etmək üçün düymə */}
      <Button onClick={navigateToDataEntry}>{t('addData')}</Button>
    </div>
  );
};

export default SchoolAdminDashboard;
