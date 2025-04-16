
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityLogItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogCardProps {
  activities: ActivityLogItem[];
}

const ActivityLogCard: React.FC<ActivityLogCardProps> = ({ activities }) => {
  const { t } = useLanguage();
  
  const formatTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noRecentActivity')}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">{t('by')}: {activity.user}</div>
                    {activity.details && (
                      <div className="text-xs text-muted-foreground mt-1">{activity.details}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
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
