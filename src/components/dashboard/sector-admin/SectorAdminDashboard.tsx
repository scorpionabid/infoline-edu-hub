
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguageSafe } from '@/context/LanguageContext';
import {
  SectorAdminDashboardData,
  SchoolStat
} from '@/types/dashboard';
import SchoolsTable from './SchoolsTable';
import { useNavigate } from 'react-router-dom';
import { useRealDashboardData } from '@/hooks/useRealDashboardData';
import { formatPercentage } from '@/utils/formatters';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguageSafe();
  const navigate = useNavigate();
  const { 
    dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useRealDashboardData();
  
  // Mock schools data
  const mockSchools: SchoolStat[] = [
    {
      id: '1',
      name: 'Məktəb 1',
      completionRate: 85,
      status: 'active',
      lastUpdate: '2023-04-10',
      pendingForms: 2,
      formsCompleted: 17,
      totalForms: 20
    },
    {
      id: '2',
      name: 'Məktəb 2',
      completionRate: 72,
      status: 'active',
      lastUpdate: '2023-04-09',
      pendingForms: 5,
      formsCompleted: 15,
      totalForms: 20
    },
    {
      id: '3',
      name: 'Məktəb 3',
      completionRate: 45,
      status: 'active',
      lastUpdate: '2023-04-12',
      pendingForms: 11,
      formsCompleted: 9,
      totalForms: 20
    }
  ];

  // Əgər real data yüklənibsə istifadə et
  React.useEffect(() => {
    if (dashboardData && 'schools' in dashboardData) {
      const schools = dashboardData.schools;
      if (schools && Array.isArray(schools)) {
        const formattedSchools = schools.map(school => ({
          id: school.id,
          name: school.name,
          completionRate: school.completionRate || 0,
          status: school.status || 'active',
          lastUpdate: school.lastUpdate || '',
          pendingForms: school.pendingForms || 0,
          formsCompleted: school.formsCompleted || 0,
          totalForms: school.totalForms || 0,
        }));
      }
    }
  }, [dashboardData]);

  // Məktəbi açmaq funksiyası
  const handleViewSchool = (schoolId: string) => {
    navigate(`/schools/${schoolId}`);
  };

  // İstifadə ediləcək schools data
  const schools = data.schools || mockSchools;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSchools')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats?.totalSchools || 0}</div>
            <p className="text-xs text-muted-foreground">{t('schoolsManaged')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('dataEntries')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats?.totalEntries || 0}</div>
            <p className="text-xs text-muted-foreground">{t('totalDataEntries')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingApprovals')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{data.stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">{t('entriesAwaitingApproval')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('completionRate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatPercentage(data.stats?.completionRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t('overallDataCompletion')}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('managedSchools')}</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolsTable schools={schools} onViewSchool={handleViewSchool} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorAdminDashboard;
