import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from './common/StatsCard';
import { NotificationsCard } from './common/NotificationsCard';
import { CompletionRateCard } from './common/CompletionRateCard';
import { SchoolAdminDashboardData } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: () => void;
}

export const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ 
  data, 
  isLoading,
  error,
  onRefresh,
  navigateToDataEntry,
  handleFormClick
}) => {
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    // Xəta mesajını təhlükəsiz şəkildə əldə edirik
    let errorMessage = 'Məlumatları yükləmək mümkün olmadı';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Əgər error bir obyektdirsə və message xüsusiyyəti varsa
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
          value={data.formStats.approved}
          icon="A"
          description={t('approvedForms')}
          trend={`${Math.round((data.formStats.approved / (data.formStats.approved + data.formStats.pending + data.formStats.rejected + data.formStats.incomplete)) * 100)}% ${t('completion')}`}
          trendDirection="up"
        />
        <StatsCard
          title={t('pending')}
          value={data.formStats.pending}
          icon="P" 
          description={t('pendingForms')}
          trend={`${t('requiresAction')}`}
          trendDirection="neutral"
        />
        <StatsCard
          title={t('rejected')}
          value={data.formStats.rejected}
          icon="R"
          description={t('rejectedForms')}
          trend={`${t('needsCorrection')}`}
          trendDirection="down"
        />
        <StatsCard
          title={t('incomplete')}
          value={data.formStats.incomplete}
          icon="I"
          description={t('incompleteForms')}
          trend={`${t('fillTheseForms')}`}
          trendDirection="down"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate}
          title={t('overallCompletion')}
        />
                
        <NotificationsCard
          title={t('notifications')}
          notifications={data.notifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            date: new Date(n.timestamp || n.createdAt || Date.now()).toLocaleDateString(),
            type: n.type,
            isRead: n.isRead ?? n.read ?? false
          }))}
        />
      </Grid>
    </div>
  );
};
