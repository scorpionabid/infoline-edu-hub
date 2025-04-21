
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/LanguageContext';
import { ActivityLogItem } from '@/types/dashboard';

interface RecentActivityProps {
  activities: ActivityLogItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const { t } = useLanguage();

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('noRecentActivity')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {activity.action}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.user}
                    </div>
                    <div className="text-xs">
                      {activity.entityType}: {activity.target || activity.entity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
