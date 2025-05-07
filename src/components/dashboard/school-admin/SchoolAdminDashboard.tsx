import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import NotificationsCard from '../common/NotificationsCard';
import { SchoolAdminDashboardData, FormItem, StatusCardsProps } from '@/types/dashboard';
import { Loader2 } from 'lucide-react';
import { adaptDashboardNotificationToApp, DashboardNotification } from '@/types/notification';
import CompletionProgress from '../CompletionProgress';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  handleFormClick?: (id: string) => void;
  navigateToDataEntry?: () => void;
}

export function SchoolAdminDashboard({ 
  data, 
  isLoading,
  error,
  onRefresh,
  navigateToDataEntry,
  handleFormClick
}: SchoolAdminDashboardProps) {
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Yüklənir...</span>
      </div>
    );
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

  // Bildirişləri adapterlə çevirək - tip problemini həll edirik
  const adaptedNotifications: DashboardNotification[] = Array.isArray(data.notifications) 
    ? data.notifications.map((notification) => {
        return adaptDashboardNotificationToApp({
          ...notification,
          createdAt: notification.createdAt || new Date().toISOString()
        });
      })
    : [];

  // formStats obyekti üçün dəyərləri hazırlayırıq
  const formStatsValues = {
    pending: data.formStats?.pending || data.forms?.pending || 0,
    approved: data.formStats?.approved || data.forms?.approved || 0, 
    rejected: data.formStats?.rejected || data.forms?.rejected || 0,
    draft: data.formStats?.draft || 0,
    dueSoon: data.formStats?.dueSoon || data.forms?.dueSoon || 0,
    overdue: data.formStats?.overdue || data.forms?.overdue || 0,
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        {navigateToDataEntry && (
          <button
            onClick={navigateToDataEntry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Məlumat Daxil Et
          </button>
        )}
      </div>
      
      <Grid columns={4} className="gap-6">
        <StatsCard 
          title="Təsdiqlənmiş" 
          value={formStatsValues.approved || 0} 
          icon="✓"
          trendDirection="up"
        />
        <StatsCard 
          title="Gözləmədə" 
          value={formStatsValues.pending || 0} 
          icon="⏳"
        />
        <StatsCard 
          title="Rədd edilmiş" 
          value={formStatsValues.rejected || 0} 
          icon="✗"
          trendDirection="down"
        />
        <StatsCard 
          title="Tamamlanmamış" 
          value={data.formStats?.incomplete || 0} 
          icon="!"
        />
      </Grid>
      <Grid columns={2} className="gap-6">
        <CompletionRateCard 
          completionRate={data.completionRate || 0} 
          title="Ümumi Tamamlanma" 
        />
        <NotificationsCard 
          title="Bildirişlər" 
          notifications={adaptedNotifications}
          emptyMessage="Bildiriş yoxdur" 
        />
      </Grid>
    </div>
  );
};

export default SchoolAdminDashboard;
