
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';
import StatusCards from '@/components/dashboard/StatusCards';
import SchoolStatsCard from '@/components/dashboard/common/SchoolStatsCard';
import PendingApprovals from '@/components/approval/PendingApprovals';
import NotificationsCard from '@/components/dashboard/common/NotificationsCard';
import { SectorAdminDashboardData, SectorAdminDashboardProps, SchoolStat } from '@/types/dashboard';
import SchoolsTable from './SchoolsTable';
import { adaptDashboardNotificationToApp } from '@/utils/notificationUtils';

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const { notifications, markAsRead } = useNotifications();
  
  // Bildirişləri adaptasiya etmək
  const adaptedNotifications = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications.map(n => adaptDashboardNotificationToApp(n));
    }
    return [];
  }, [notifications]);

  // Məktəblərin lastUpdate və pendingForms xüsusiyyətlərini əlavə edirik
  const enhancedSchools: SchoolStat[] = useMemo(() => {
    return (data.schoolStats || []).map(school => {
      return {
        id: school.id || '',
        name: school.name || '',
        status: school.status || 'active',
        completionRate: school.completionRate || school.completion_rate || 0,
        lastUpdate: school.lastUpdate || school.updated_at || new Date().toISOString(),
        pendingForms: school.pendingForms || 0,
        formsCompleted: school.formsCompleted || 0,
        totalForms: school.totalForms || 0,
        principalName: school.principalName || school.principal_name || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || ''
      };
    });
  }, [data.schoolStats]);

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
                pendingApprovals={data.pendingApprovals || []}
                limit={5}
                showViewAllButton={true}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <NotificationsCard 
            notifications={adaptedNotifications} 
            onMarkAsRead={markAsRead} 
          />
          
          <SchoolStatsCard stats={enhancedSchools} />
        </div>
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
