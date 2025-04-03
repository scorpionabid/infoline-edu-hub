
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import StatCard from './StatCard';
import { Buildings, Users, School, CheckCircle } from 'lucide-react';
import NotificationsCard from './NotificationsCard';
import { RegionAdminDashboardData } from '@/types/dashboard';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('region')}
            </CardTitle>
            <Buildings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.regionName}</div>
            <p className="text-xs text-muted-foreground">
              {t('regionalDashboard')}
            </p>
          </CardContent>
        </Card>
        
        <StatCard 
          title={t('sectors')}
          value={data.sectors}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description={t('totalSectors')}
        />
        
        <StatCard 
          title={t('schools')}
          value={data.schools}
          icon={<School className="h-4 w-4 text-muted-foreground" />}
          description={t('totalSchools')}
        />
        
        <StatCard 
          title={t('approvalRate')}
          value={`${data.approvalRate}%`}
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          description={t('approvedDataRate')}
          valueColor={data.approvalRate > 80 ? "text-green-500" : data.approvalRate > 50 ? "text-amber-500" : "text-red-500"}
        />
      </div>
      
      {/* Notifications */}
      {data.notifications && data.notifications.length > 0 && (
        <NotificationsCard notifications={data.notifications} />
      )}
      
      {/* Additional content specific to Region Admin */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('popularCategories')}</CardTitle>
            <CardDescription>
              {t('mostPopularCategories')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Region-specific content here */}
            <p className="text-sm text-muted-foreground">{t('noDataAvailable')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('schoolActivity')}</CardTitle>
            <CardDescription>
              {t('schoolActivityDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* More region-specific content here */}
            <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegionAdminDashboard;
