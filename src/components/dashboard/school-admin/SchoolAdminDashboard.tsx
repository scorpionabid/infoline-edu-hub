
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import NotificationsCard from '../common/NotificationsCard';
import { 
  SchoolAdminDashboardData,
  DashboardNotification,
  FormStatus,
  FormItem
} from '@/types/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Əminliklə yoxlayırıq ki, data null deyil, əgər nulldursa default dəyərlər istifadə edirik
  const safeData = data || {
    formStats: { total: 0, pending: 0, approved: 0, rejected: 0, drafts: 0 },
    categories: [],
    notifications: [],
    forms: { pending: 0, approved: 0, rejected: 0, dueSoon: 0, overdue: 0, total: 0 },
    pendingForms: [],
    completionRate: 0,
    completion: { percentage: 0, total: 0, completed: 0 }
  };

  // Status rəngləri üçün funksiya
  const getStatusColor = (status: string) => {
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
          <CardContent className="h-[300px]">
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

  // Təhlükəsiz əldə edilmiş məlumatlar
  const forms = safeData.forms || { pending: 0, approved: 0, rejected: 0, dueSoon: 0, overdue: 0, total: 0 };
  const pendingForms = safeData.pendingForms || [];
  const completionRate = safeData.completionRate || safeData.completion?.percentage || 0;
  
  // Notification tipini uyğunlaşdırırıq
  const notifications = (safeData.notifications || []).map(notification => {
    const processedNotification = { ...notification };
    
    // Əgər date və time yoxdursa, amma timestamp varsa
    if (!notification.date && notification.timestamp) {
      const createdDate = new Date(notification.timestamp);
      processedNotification.date = createdDate.toISOString().split('T')[0];
      processedNotification.time = createdDate.toISOString().split('T')[1]?.substring(0, 5) || '00:00';
    } else if (!notification.date && notification.createdAt) {
      // Əgər createdAt varsa
      const createdDate = new Date(notification.createdAt);
      processedNotification.date = createdDate.toISOString().split('T')[0];
      processedNotification.time = createdDate.toISOString().split('T')[1]?.substring(0, 5) || '00:00';
    }
    
    // Əgər time yoxdursa əlavə edək
    if (!processedNotification.time) {
      processedNotification.time = '00:00';
    }
    
    // read və isRead sahələrinin uyğunluğu
    if (notification.isRead !== undefined && notification.read === undefined) {
      processedNotification.read = notification.isRead;
    } else if (notification.read !== undefined) {
      processedNotification.isRead = notification.read;
    }
    
    return processedNotification;
  });

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
            <div className="text-2xl font-bold">{forms.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('approvedForms')}</CardTitle>
            <CardDescription>{t('approvedFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.approved || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('rejectedForms')}</CardTitle>
            <CardDescription>{t('rejectedFormsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.rejected || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('completionRate')}</CardTitle>
            <CardDescription>{t('completionRateDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending formlar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('pendingForms')}</CardTitle>
            <CardDescription>{t('pendingFormsDesc')}</CardDescription>
          </div>
          <Button onClick={navigateToDataEntry}>
            {t('addData')}
          </Button>
        </CardHeader>
        <CardContent>
          {pendingForms.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {t('noFormsToFill')}
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {pendingForms.map((form) => (
                  <div key={form.id} className="p-4 border rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{form.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {form.category && <span className="mr-2">{form.category}</span>}
                        <span>{form.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(typeof form.status === 'string' ? form.status : '')}`}>
                        {t(typeof form.status === 'string' ? form.status : '')}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${form.completionPercentage}%` }}
                        ></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleFormClick(form.id)}>
                        {t('view')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Bildirişlər kartı */}
      <NotificationsCard notifications={notifications} />
    </div>
  );
};

export default SchoolAdminDashboard;
