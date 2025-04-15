
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityLogItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistance } from 'date-fns';

interface ActivityLogCardProps {
  activities: ActivityLogItem[];
}

const ActivityLogCard: React.FC<ActivityLogCardProps> = ({ activities }) => {
  const { t } = useLanguage();

  // Get relative time from now
  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('activityLog')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noActivityRecorded')}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{activity.user} {activity.action}</span>
                    <span className="text-xs text-muted-foreground">{activity.time || getTimeAgo(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityLogCard;
