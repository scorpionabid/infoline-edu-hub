
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import StatusCards from '../StatusCards';
import { RegionAdminDashboardData, RegionAdminDashboardProps } from '@/types/dashboard';
import { adaptDashboardNotificationToApp } from '@/utils/notificationUtils';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationsCard from '../common/NotificationsCard';
import PendingApprovals from '@/components/approval/PendingApprovals';
import SectorStatsTable from './SectorStatsTable';

export const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const { notifications, markAsRead } = useNotifications();
  
  // Adapt notifications
  const adaptedNotifications = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications.map(n => adaptDashboardNotificationToApp(n));
    }
    return [];
  }, [notifications]);

  // Check and prepare sectorStats data
  const sectorStats = useMemo(() => {
    return data.sectorStats || [];
  }, [data.sectorStats]);
  
  return (
    <div className="space-y-6">
      <StatusCards
        completion={data.completion}
        status={data.status}
        formStats={data.formStats || {
          pending: data.status.pending,
          approved: data.status.approved,
          rejected: data.status.rejected,
          total: data.status.total,
          dueSoon: 0,
          overdue: 0
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('sectorsInRegion')}</CardTitle>
              <CardDescription>{t('sectorsInRegionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <SectorStatsTable sectorStats={sectorStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pendingApprovals')}</CardTitle>
              <CardDescription>{t('pendingApprovalsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <PendingApprovals
                pendingApprovals={data.pendingApprovals || []}
                limit={5}
                showViewAllButton={true}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <NotificationsCard 
            title={t('notifications')}
            notifications={adaptedNotifications} 
            onMarkAsRead={markAsRead} 
          />
          
          <Card>
            <CardHeader>
              <CardTitle>{t('regionStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t('completionRate')}</p>
                  <p className="text-2xl font-medium">{Math.round(data.completion.percentage)}%</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t('totalSectors')}</p>
                  <p className="text-2xl font-medium">{sectorStats?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
