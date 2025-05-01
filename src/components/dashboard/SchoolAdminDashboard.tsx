
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { SchoolAdminDashboardData } from '@/types/supabase';
import StatsCard from './common/StatsCard';
import StatusCards from './common/StatusCards';
import NotificationsCard from './common/NotificationsCard';
import CompletionRateCard from './common/CompletionRateCard';

interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('approvedForms')}
          value={data.formStats.approved}
          icon="check-circle"
          description={t('formsApprovedDesc')}
          trend="up"
        />
        <StatsCard
          title={t('pendingForms')}
          value={data.formStats.pending}
          icon="clock"
          description={t('formsPendingDesc')}
          trend="neutral"
        />
        <StatsCard
          title={t('rejectedForms')}
          value={data.formStats.rejected}
          icon="x-circle"
          description={t('formsRejectedDesc')}
          trend="down"
        />
        <StatsCard
          title={t('incompleteForms')}
          value={data.formStats.incomplete}
          icon="alert-triangle"
          description={t('formsIncompleteDesc')}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <CompletionRateCard
            completionRate={data.completionRate}
            title={t('formCompletionRate')}
          />
          <div className="bg-card rounded-lg shadow border p-5">
            <h3 className="text-lg font-medium mb-3">{t('upcomingDeadlines')}</h3>
            {data.upcomingDeadlines.length > 0 ? (
              <div className="space-y-2">
                {data.upcomingDeadlines.map((deadline, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <div>
                      <p className="font-medium">{deadline.name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(deadline.deadline).toLocaleDateString()}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-sm ${
                      new Date(deadline.deadline).getTime() - Date.now() < 86400000 * 2
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {Math.ceil((new Date(deadline.deadline).getTime() - Date.now()) / 86400000)} {t('daysLeft')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t('noUpcomingDeadlines')}</p>
            )}
          </div>
        </div>
        
        <div>
          <NotificationsCard 
            notifications={data.notifications} 
            title={t('recentNotifications')}
          />
        </div>
      </div>

      <div className="bg-card rounded-lg shadow border p-5">
        <h3 className="text-lg font-medium mb-3">{t('recentCategories')}</h3>
        {data.recentCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.recentCategories.map((category, i) => (
              <div key={i} className="flex items-center p-3 border rounded-md">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center mr-3">
                  <span className="font-medium">{category.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium truncate">{category.name}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{category.completion_percentage || 0}% {t('completed')}</span>
                    <span className="mx-2">•</span>
                    <span>{category.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('noRecentCategories')}</p>
        )}
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
