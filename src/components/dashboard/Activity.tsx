
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityItem } from '@/types/dashboard';

interface ActivityProps {
  activities: ActivityItem[];
}

export const Activity: React.FC<ActivityProps> = ({ activities }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentActivity')}</CardTitle>
        <CardDescription>{t('recentActivityDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-auto">
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title || activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.description || `${activity.actor} ${activity.action} ${activity.target}`}</p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {t('noActivity')}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full">{t('viewAllActivity')}</Button>
      </CardFooter>
    </Card>
  );
};
