
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ActivityItem } from '@/types/dashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList } from 'lucide-react';

interface ActivityListProps {
  items: ActivityItem[];
}

const ActivityList: React.FC<ActivityListProps> = ({ items }) => {
  const { t } = useLanguage();

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-base font-semibold text-foreground">
          {t('noActivity')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('noActivityDesc')}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[300px]">
      <div className="space-y-4 p-4">
        {items.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">
                {activity.title || activity.action}
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.description || `${activity.actor} ${activity.action} ${activity.target}`}
              </p>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ActivityList;
