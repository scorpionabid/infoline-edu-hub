
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardNotification } from '@/types/dashboard';
import { 
  SchoolAdminDashboardData, 
  FormItem 
} from '@/types/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader, Plus, RefreshCw } from 'lucide-react';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'dueSoon':
        return 'bg-orange-100 text-orange-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive mb-4">{error.message || t('errorOccurred')}</p>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('refresh')}
          </Button>
        )}
      </div>
    );
  }

  // Təhlükəsiz dəyərlər
  const formStats = data?.forms || { pending: 0, approved: 0, rejected: 0, dueSoon: 0, overdue: 0, total: 0 };
  const completionRate = data?.completionRate || 0;
  const notifications = data?.notifications || [];
  const pendingForms = data?.pendingForms || [];

  return (
    <div className="space-y-6">
      {/* Əsas statistika kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gözləmədə</CardTitle>
            <CardDescription>Gözləmədə olan formlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Təsdiqlənmiş</CardTitle>
            <CardDescription>Təsdiqlənmiş formlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formStats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rədd edilmiş</CardTitle>
            <CardDescription>Rədd edilmiş formlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formStats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tamamlanma</CardTitle>
            <CardDescription>Ümumi tamamlanma faizi</CardDescription>
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
            <CardTitle>Gözləmədə olan formlar</CardTitle>
            <CardDescription>Təsdiq gözləyən formların siyahısı</CardDescription>
          </div>
          <Button onClick={navigateToDataEntry} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Yeni məlumat əlavə et
          </Button>
        </CardHeader>
        <CardContent>
          {pendingForms.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Hazırda doldurulacaq form yoxdur
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
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                        {form.status}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${form.completionPercentage}%` }}
                        ></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleFormClick(form.id)}>
                        Bax
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
      <Card>
        <CardHeader>
          <CardTitle>Bildirişlər</CardTitle>
          <CardDescription>Son bildirişlər</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Yeni bildiriş yoxdur
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border rounded-md">
                    <div className="font-semibold">{notification.title}</div>
                    <div className="text-sm text-muted-foreground">{notification.date}</div>
                    <div className="mt-2">{notification.message}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminDashboard;
