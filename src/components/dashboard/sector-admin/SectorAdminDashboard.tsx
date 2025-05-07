
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import StatusCards from '@/components/dashboard/StatusCards';
import SchoolStatsCard from '@/components/dashboard/SchoolStatsCard';
import PendingApprovals from '@/components/approval/PendingApprovals';
import NotificationsCard from '@/components/dashboard/NotificationsCard';
import { SectorAdminDashboardData, SchoolStat } from '@/types/dashboard';
import { SectorSchool } from '@/types/school';
import SchoolsTable from './SchoolsTable';
import { adaptAppNotificationToDashboard } from '@/types/notification';

interface SectorAdminDashboardProps {
  sectorId?: string;
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ sectorId }) => {
  const { t } = useLanguage();
  const { notifications, markAsRead } = useNotifications();
  const [data, setData] = useState<SectorAdminDashboardData>({
    schoolStats: [],
    completion: {
      percentage: 0,
      total: 0,
      completed: 0
    },
    status: {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      total: 0
    },
    pendingApprovals: [],
    notifications: []
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Məlumatları yükləyən funksiya
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data istifadə edirik (ideally would be replaced with real API call)
        setData({
          schoolStats: generateMockSchoolStats(),
          completion: {
            percentage: 75,
            total: 20,
            completed: 15
          },
          status: {
            pending: 4,
            approved: 12,
            rejected: 2,
            draft: 2,
            total: 20
          },
          pendingApprovals: [
            {
              id: '1',
              schoolId: '101',
              schoolName: 'Məktəb #1',
              categoryId: '201',
              categoryName: 'Şagird məlumatları',
              date: new Date().toISOString(),
              status: 'pending'
            },
            {
              id: '2',
              schoolId: '102',
              schoolName: 'Məktəb #2',
              categoryId: '202',
              categoryName: 'Müəllim məlumatları',
              date: new Date().toISOString(),
              status: 'pending'
            }
          ],
          notifications: notifications.map(n => adaptAppNotificationToDashboard(n))
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Sektor admin dashboard məlumatlarının yüklənməsində xəta:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [notifications]);

  const generateMockSchoolStats = (): SchoolStat[] => {
    return [
      {
        id: '1',
        name: 'Məktəb #1',
        completionRate: 85,
        status: 'active',
        lastUpdate: new Date().toISOString(),
        pendingForms: 2,
        principal: 'Əli Əliyev',
        formsCompleted: 17,
        totalForms: 20,
        address: 'Bakı, Yasamal',
        phone: '055-555-55-55',
        email: 'mekteb1@example.com'
      },
      {
        id: '2',
        name: 'Məktəb #2',
        completionRate: 65,
        status: 'active',
        lastUpdate: new Date().toISOString(),
        pendingForms: 5,
        principal: 'Vəli Vəliyev',
        formsCompleted: 13,
        totalForms: 20,
        address: 'Bakı, Nizami',
        phone: '055-555-55-56',
        email: 'mekteb2@example.com'
      },
      {
        id: '3',
        name: 'Məktəb #3',
        completionRate: 45,
        status: 'active',
        lastUpdate: new Date().toISOString(),
        pendingForms: 7,
        principal: 'Qədir Qədirov',
        formsCompleted: 9,
        totalForms: 20,
        address: 'Bakı, Səbail',
        phone: '055-555-55-57',
        email: 'mekteb3@example.com'
      },
    ];
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

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
              <SchoolsTable schools={data.schoolStats} />
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
            notifications={data.notifications} 
            onMarkAsRead={markAsRead} 
          />
          
          <SchoolStatsCard schoolStats={data.schoolStats} />
        </div>
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
