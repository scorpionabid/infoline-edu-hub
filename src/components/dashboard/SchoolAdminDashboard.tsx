import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/notification';
import NotificationsCard from './NotificationsCard';
import { 
  SchoolAdminDashboardData, 
  FormItem 
} from '@/types/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormStatus } from '@/types/form';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  navigateToDataEntry: () => void;
  handleFormClick: (formId: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ 
  data,
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Əsas statistika kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('pendingForms')}</CardTitle>
            <CardDescription>{t('pendingFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.forms?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('approvedForms')}</CardTitle>
            <CardDescription>{t('approvedFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.forms?.approved || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('rejectedForms')}</CardTitle>
            <CardDescription>{t('rejectedFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.forms?.rejected || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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
            <div className="divide-y divide-border">
              {data.pendingForms?.map((form) => (
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
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Yeni məlumat əlavə etmək üçün düymə */}
      <Button onClick={navigateToDataEntry}>{t('addData')}</Button>
    </div>
  );
};

export default SchoolAdminDashboard;
