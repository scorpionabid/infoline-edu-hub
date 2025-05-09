
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import StatusCards from '@/components/dashboard/StatusCards';
import { SuperAdminDashboardProps } from '@/types/dashboard';

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <StatusCards
        completion={data.completion}
        status={data.status}
        formStats={data.formStats}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalRegions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalRegions || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSectors')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalSectors || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSchools')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalSchools || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalUsers || 0}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('systemOverview')}</CardTitle>
          <CardDescription>{t('systemOverviewDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('superAdminDashboardComingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
