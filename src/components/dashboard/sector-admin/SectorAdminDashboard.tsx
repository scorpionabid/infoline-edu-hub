
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import StatusCards from '@/components/dashboard/StatusCards';
import SchoolStatsCard from '@/components/dashboard/common/SchoolStatsCard';
import PendingApprovals from '@/components/approval/PendingApprovals';
import NotificationsCard from '@/components/dashboard/common/NotificationsCard';
import { SectorAdminDashboardData, SectorAdminDashboardProps } from '@/types/dashboard';
import { SchoolStat, SectorSchool } from '@/types/school';
import SchoolsTable from './SchoolsTable';
import { adaptAppToDashboardNotification } from '@/utils/notificationUtils';

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const { notifications, markAsRead } = useNotifications();
  
  // Bildirişləri adaptasiya etmək
  const adaptedNotifications = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications.map(n => adaptAppToDashboardNotification(n));
    }
    return [];
  }, [notifications]);

  // Məktəblərin lastUpdate və pendingForms xüsusiyyətlərini əlavə edirik
  const enhancedSchools: SchoolStat[] = useMemo(() => {
    return data.schoolStats.map(school => {
      // Əgər SectorSchool tipindədirsə çevirmə edirik
      if ('sector_id' in school) {
        const sectorSchool = school as SectorSchool;
        return {
          id: sectorSchool.id,
          name: sectorSchool.name,
          status: sectorSchool.status,
          completionRate: sectorSchool.completionRate || sectorSchool.completion_rate || 0,
          lastUpdate: sectorSchool.lastUpdate || sectorSchool.updated_at || new Date().toISOString(),
          pendingForms: sectorSchool.pendingForms || 0,
          formsCompleted: sectorSchool.formsCompleted || 0,
          totalForms: sectorSchool.totalForms || 0,
          principalName: sectorSchool.principalName || sectorSchool.principal_name || '',
          address: sectorSchool.address || '',
          phone: sectorSchool.phone || '',
          email: sectorSchool.email || ''
        };
      }
      
      // Əgər artıq SchoolStat tipindədirsə olduğu kimi qaytarırıq
      return school as SchoolStat;
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
                pendingApprovals={data.pendingApprovals}
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
          
          <SchoolStatsCard schoolStats={enhancedSchools} />
        </div>
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
