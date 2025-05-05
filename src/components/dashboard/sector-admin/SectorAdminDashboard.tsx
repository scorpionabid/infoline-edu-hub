
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import { NotificationsCard } from '../common/NotificationsCard';
import { SectorAdminDashboardData, SchoolStats } from '@/types/dashboard';
import { SchoolsList } from './SchoolsList';
import { ActivityLogCard } from './ActivityLogCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { adaptDashboardNotificationToApp } from '@/types/notification';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  // Məktəb statistikası üçün default dəyərlər
  const schoolStats = data.schoolsStats || [];
  const totalSchools = data.stats?.schools || 0;
  
  // Bildirişləri adapterlə çevirək
  const adaptedNotifications = Array.isArray(data.notifications) 
    ? data.notifications.map(notification => adaptDashboardNotificationToApp(notification))
    : [];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('sectoradminDashboard')}</h2>
      
      <Grid columns={3} className="gap-6">
        <StatsCard
          title={t('totalSchools')}
          value={totalSchools}
          icon="M"
          description={t('schoolsInSector')}
          trend={`${schoolStats.length > 0 ? Math.round((schoolStats.filter(s => s.active || true).length / schoolStats.length) * 100) : 100}% ${t('active')}`}
          trendDirection="up"
        />
        <StatsCard
          title={t('pendingApprovals')}
          value={data.formsByStatus?.pending || 0}
          icon="P"
          description={t('pendingReviews')}
          trend={`${schoolStats.length > 0 ? Math.round((schoolStats.filter(s => s.incomplete || false).length / schoolStats.length) * 100) : 0}% ${t('incomplete')}`}
          trendDirection="neutral"
        />
        <StatsCard
          title={t('approvalRate')}
          value={data.approvalRate || 0}
          icon="%"
          description={t('approvalRate')}
          trend={`${data.formsByStatus?.approved || 0} ${t('approved')}`}
          trendDirection="up"
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

      {data.schools && data.schools.length > 0 && (
        <SchoolsList schools={data.schools} />
      )}
    </div>
  );
};

export default SectorAdminDashboard;
