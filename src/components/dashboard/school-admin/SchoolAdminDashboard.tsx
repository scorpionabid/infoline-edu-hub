
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '../StatsCard';
import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';

const SchoolAdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  const statsData = [
    {
      title: t('dashboard.stats.completed_forms'),
      value: 12,
      icon: <CheckCircle className="h-4 w-4" />,
      description: t('dashboard.stats.total_forms_description'),
      color: 'green' as const
    },
    {
      title: t('dashboard.stats.pending_forms'),
      value: 3,
      icon: <Clock className="h-4 w-4" />,
      description: t('dashboard.stats.pending'),
      color: 'amber' as const
    },
    {
      title: t('dashboard.stats.due_soon'),
      value: 2,
      icon: <AlertTriangle className="h-4 w-4" />,
      description: t('dashboard.stats.due_soon'),
      color: 'red' as const
    },
    {
      title: t('dashboard.stats.completion_rate'),
      value: '80%',
      icon: <FileText className="h-4 w-4" />,
      description: t('dashboard.stats.completion_rate'),
      color: 'blue' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.cards.recent_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {t('dashboard.activity.form_submitted')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2 saat əvvəl
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.cards.notifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                {t('dashboard.notifications.no_notifications')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
