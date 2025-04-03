
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegionAdminDashboardData } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Activity } from '@/components/dashboard/Activity';
import { FormItem } from '@/types/form';
import CategoryCompletionChart from './CategoryCompletionChart';
import StatusDistributionChart from './StatusDistributionChart';
import SchoolsStatusCard from './SchoolsStatusCard';
import NotificationsCard from './NotificationsCard';
import ApprovalRateCard from './ApprovalRateCard';
import CompletionRateCard from './CompletionRateCard';
import PendingFormsCard from './PendingFormsCard';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('regionDashboard')}</h2>
          <p className="text-muted-foreground">
            {data.regionName ? `${t('regionAdminDashboardDesc')} - ${data.regionName}` : t('regionAdminDashboardDesc')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sectors')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sectors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('schools')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.schools}</div>
          </CardContent>
        </Card>
        <CompletionRateCard rate={data.completionRate} />
        <ApprovalRateCard rate={data.approvalRate} pendingCount={data.pendingApprovals} />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mb-4">
        <SchoolsStatusCard 
          pendingSchools={data.pendingSchools}
          approvedSchools={data.approvedSchools}
          rejectedSchools={data.rejectedSchools}
        />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('categoryCompletion')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryCompletion?.length > 0 ? (
              <CategoryCompletionChart data={data.categoryCompletion} />
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">{t('noCategoryData')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Third Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('statusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.statusDistribution?.length > 0 ? (
              <StatusDistributionChart data={data.statusDistribution} />
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">{t('noStatusData')}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <NotificationsCard notifications={data.notifications} />
      </div>

      {/* Fourth Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mb-4">
        <PendingFormsCard forms={data.pendingForms} />
        <Activity activities={data.activityData} />
      </div>
    </>
  );
};

export default RegionAdminDashboard;
