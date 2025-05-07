
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import StatusCards from '@/components/dashboard/StatusCards';
import SchoolStatsCard from '@/components/dashboard/common/SchoolStatsCard';
import PendingApprovals from '@/components/approval/PendingApprovals';
import NotificationsCard from '@/components/dashboard/common/NotificationsCard';
import { SectorAdminDashboardData, SchoolStat, SectorAdminDashboardProps } from '@/types/dashboard';
import { SchoolStat as SchoolStatType } from '@/types/school';
import SchoolsTable from './SchoolsTable';
import { adaptAppNotificationToDashboard } from '@/types/notification';

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const { notifications, markAsRead } = useNotifications();
  
  // Bildirişləri adaptasiya etmək
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const adaptedNotifications = notifications.map(n => adaptAppNotificationToDashboard(n));
      // Burada adaptedNotifications-i state-ə yaza bilərdik amma data prop-u olduğu üçün etmirik
    }
  }, [notifications]);

  // Məktəblərin lastUpdate və pendingForms xüsusiyyətlərini əlavə edirik
  const enhancedSchools: SchoolStat[] = data.schoolStats.map(school => ({
    ...school,
    lastUpdate: school.lastUpdate || new Date().toISOString(),
    pendingForms: Math.floor(Math.random() * 5) // Mock data
  }));

  return (
    <div className="space-y-6">
      <StatusCards
        completion={data.completion}
        status={data.status}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('schoolsInSector')}</CardTitle>
              <CardDescription>{t('schoolsInSectorDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <SchoolsTable schools={enhancedSchools} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pendingApprovals')}</CardTitle>
              <CardDescription>{t('pendingApprovalsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <PendingApprovals
                pendingApprovals={data.pendingApprovals}
                limit={5}
                showViewAllButton={true}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <NotificationsCard 
            notifications={notifications} 
            onMarkAsRead={markAsRead} 
          />
          
          <SchoolStatsCard schoolStats={enhancedSchools} />
        </div>
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
