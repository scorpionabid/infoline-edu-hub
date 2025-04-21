
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { az, ru, enUS, tr } from 'date-fns/locale';
import { ActivityLogItem } from '@/types/dashboard';

interface RecentActivityProps {
  activities: ActivityLogItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const { t, currentLanguage } = useLanguage();
  
  const getLocale = () => {
    switch (currentLanguage) {
      case 'az':
        return az;
      case 'ru':
        return ru;
      case 'tr':
        return tr;
      default:
        return enUS;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('noRecentActivity')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="p-4 border rounded-md"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{activity.action}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { 
                    addSuffix: true,
                    locale: getLocale()
                  })}
                </div>
              </div>
              <div className="text-sm mt-1">
                <span className="text-muted-foreground">{t('user')}: </span>
                {activity.user}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">{t('entityType')}: </span>
                {activity.entityType}
              </div>
              {activity.details && (
                <div className="text-sm mt-2 text-muted-foreground">
                  {activity.details}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
