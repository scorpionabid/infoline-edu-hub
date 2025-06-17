
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsCard from '../StatsCard';
import CompletionRateCard from '../CompletionRateCard';
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

interface SchoolAdminDashboardProps {
  dashboardData?: any;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({
  dashboardData
}) => {
  const { t } = useTranslation();

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">{t('dashboard.loading')}</div>
    );
  }

  const statsData = [
    {
      title: t('dashboard.stats.completed_forms'),
      value: dashboardData.completedForms || 0,
      icon: <CheckCircle className="h-4 w-4" />,
      description: t('dashboard.stats.total_completed'),
      color: 'text-green-600' as const
    },
    {
      title: t('dashboard.stats.pending_forms'),
      value: dashboardData.pendingForms || 0,
      icon: <Clock className="h-4 w-4" />,
      description: t('dashboard.stats.awaiting_approval'),
      color: 'text-yellow-600' as const
    },
    {
      title: t('dashboard.stats.overdue_forms'),
      value: dashboardData.overdueForms || 0,
      icon: <AlertCircle className="h-4 w-4" />,
      description: t('dashboard.stats.past_deadline'),
      color: 'text-red-600' as const
    },
    {
      title: t('dashboard.stats.total_forms'),
      value: dashboardData.totalForms || 0,
      icon: <FileText className="h-4 w-4" />,
      description: t('dashboard.stats.all_forms'),
      color: 'text-blue-600' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Completion Rate */}
      <div className="grid gap-4 md:grid-cols-2">
        <CompletionRateCard 
          completionRate={dashboardData.completionRate || 0}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.cards.recent_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <Badge variant={activity.type === 'completed' ? 'default' : 'secondary'}>
                    {activity.type}
                  </Badge>
                </div>
              ))}
              {(!dashboardData.recentActivity || dashboardData.recentActivity.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('dashboard.activity.no_activity')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
