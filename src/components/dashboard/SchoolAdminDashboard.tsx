
import React from 'react';
import { StatsCard } from './common/StatsCard';
import { CompletionRateCard } from './common/CompletionRateCard';
import { NotificationsCard } from './common/NotificationsCard';
import { SchoolAdminDashboardData } from '@/types/dashboard';
import { Grid } from '@/components/ui/grid';
import { CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { adaptDashboardNotificationToApp, NotificationType } from '@/types/notification';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

export function SchoolAdminDashboard({ 
  data, 
  isLoading,
  error,
  onRefresh,
  navigateToDataEntry,
  handleFormClick
}: SchoolAdminDashboardProps) {
  const { t } = useLanguage();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (error) {
    let errorMessage = 'Məlumatları yükləmək mümkün olmadı';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = error.message || JSON.stringify(error);
    }
    
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-3">Xəta baş verdi</div>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        {onRefresh && (
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={onRefresh}
          >
            Yenidən yüklə
          </button>
        )}
      </div>
    );
  }

  // Bildirişləri adapter ilə çevirək - tip problemini həll edirik
  const adaptedNotifications: NotificationType[] = Array.isArray(data.notifications) 
    ? data.notifications.map((notification) => {
        // Əgər bəzi tələb olunan xüsusiyyətlər yoxdursa əlavə edirik
        return {
          ...adaptDashboardNotificationToApp({
            ...notification,
            createdAt: notification.createdAt || new Date().toISOString()
          })
        };
      })
    : [];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
        {navigateToDataEntry && (
          <button
            onClick={navigateToDataEntry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            {t('dataEntry')}
          </button>
        )}
      </div>
      
      <Grid columns={4} className="gap-6">
        <StatsCard 
          title={t('approved')} 
          value={data.formStats?.approved || 0} 
          icon={<CheckCircle size={18} />}
          trendDirection="up"
        />
        <StatsCard 
          title={t('pending')} 
          value={data.formStats?.pending || 0} 
          icon={<Clock size={18} />}
        />
        <StatsCard 
          title={t('rejected')} 
          value={data.formStats?.rejected || 0} 
          icon={<XCircle size={18} />}
          trendDirection="down"
        />
        <StatsCard 
          title={t('incomplete')} 
          value={data.formStats?.incomplete || 0} 
          icon={<AlertTriangle size={18} />}
        />
      </Grid>
      <Grid columns={2} className="gap-6">
        <CompletionRateCard 
          completionRate={data.completionRate || 0} 
          title={t('overallCompletion')} 
        />
        <NotificationsCard 
          title={t('notifications')} 
          notifications={adaptedNotifications}
        />
      </Grid>
    </div>
  );
}

export default SchoolAdminDashboard;
