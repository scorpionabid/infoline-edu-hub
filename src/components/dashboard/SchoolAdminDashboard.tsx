
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { StatsCard } from './common/StatsCard';
import { NotificationsCard } from './common/NotificationsCardProps';
import { CompletionRateCard } from './common/CompletionRateCard';
import { SchoolAdminDashboardData } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <Grid columns={4} className="gap-6">
        <StatsCard
          title={t('approved')}
          value={data.formStats.approved}
          icon="A"
          description={t('approvedForms')}
          trend={`${Math.round((data.formStats.approved / (data.formStats.approved + data.formStats.pending + data.formStats.rejected + data.formStats.incomplete)) * 100)}% ${t('completion')}`}
          trendDirection="up"
        />
        <StatsCard
          title={t('pending')}
          value={data.formStats.pending}
          icon="P" 
          description={t('pendingForms')}
          trend={`${t('requiresAction')}`}
          trendDirection="neutral"
        />
        <StatsCard
          title={t('rejected')}
          value={data.formStats.rejected}
          icon="R"
          description={t('rejectedForms')}
          trend={`${t('needsCorrection')}`}
          trendDirection="down"
        />
        <StatsCard
          title={t('incomplete')}
          value={data.formStats.incomplete}
          icon="I"
          description={t('incompleteForms')}
          trend={`${t('fillTheseForms')}`}
          trendDirection="down"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate}
          title={t('overallCompletion')}
        />
                
        <NotificationsCard
          title={t('notifications')}
          notifications={data.notifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            date: new Date(n.timestamp || n.createdAt || Date.now()).toLocaleDateString(),
            type: n.type,
            isRead: n.isRead ?? n.read ?? false
          }))}
        />
      </Grid>
    </div>
  );
};

export default SchoolAdminDashboard;
