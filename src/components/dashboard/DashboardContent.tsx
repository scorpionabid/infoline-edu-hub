import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleDollarSign, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useSchoolAdminDashboard } from '@/hooks/useSchoolAdminDashboard';
import { Skeleton } from "@/components/ui/skeleton"
import { ChartData } from '@/types/dashboard';
import { DoughnutChart } from '@/components/charts/DoughnutChart';
import { Progress } from "@/components/ui/progress"
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, error, handleFormClick, navigateToDataEntry } = useSchoolAdminDashboard();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error.message || t('errorLoadingDashboard')}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('noDashboardData')}
        </AlertDescription>
      </Alert>
    );
  }

  const completionData: ChartData[] = [
    { name: t('completed'), value: data.completion.completed, color: "#22c55e" },
    { name: t('pending'), value: data.completion.total - data.completion.completed, color: "#f43f5e" },
  ];

  const statusData: ChartData[] = [
    { name: t('pending'), value: data.status.pending, color: "#facc15" },
    { name: t('approved'), value: data.status.approved, color: "#22c55e" },
    { name: t('rejected'), value: data.status.rejected, color: "#f43f5e" },
    { name: t('active'), value: data.status.active, color: "#3b82f6" },
    { name: t('inactive'), value: data.status.inactive, color: "#9ca3af" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('completionRate')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <DoughnutChart data={completionData} />
            <div className="text-center mt-2">
              <p className="text-2xl font-semibold">{data.completion.percentage}%</p>
              <p className="text-sm text-muted-foreground">
                {t('completedForms')} {data.completion.completed} / {data.completion.total}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('formStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <DoughnutChart data={statusData} />
            <div className="text-center mt-2">
              <p className="text-sm text-muted-foreground">
                {t('totalForms')} {data.status.total}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('upcomingDeadlines')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcoming.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('formName')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dueDate')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('progress')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.upcoming.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dueDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Progress value={item.progress} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/data-entry/${item.id}`} className="text-primary-600 hover:text-primary-900">
                            {t('fillOut')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>{t('noUpcomingDeadlines')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('pendingForms')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingForms.length > 0 ? (
              <ul className="list-none space-y-2">
                {data.pendingForms.map((form) => (
                  <li key={form.id} className="flex items-center justify-between">
                    <span>{form.name}</span>
                    <Badge variant="secondary">{form.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('noPendingForms')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('notifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.notifications.length > 0 ? (
              <ul className="list-none space-y-2">
                {data.notifications.map((notification) => (
                  <li key={notification.id} className="flex items-start space-x-2">
                    {notification.type === 'success' && <CheckCircle2 className="text-green-500" />}
                    {notification.type === 'warning' && <AlertTriangle className="text-yellow-500" />}
                    {notification.type === 'error' && <AlertTriangle className="text-red-500" />}
                    {notification.type === 'info' && <Info className="text-blue-500" />}
                    <div>
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('noNotifications')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('actions')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button onClick={navigateToDataEntry}>
              {t('addData')}
            </Button>
            {user?.role === 'schooladmin' && user?.school_id && (
              <Button variant="secondary" onClick={() => handleFormClick(user.school_id as string)}>
                {t('fillSchoolInfo')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
