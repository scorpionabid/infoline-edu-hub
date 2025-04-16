
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { ActivityLogItem } from '@/types/dashboard';
import {
  CheckCircle,
  XCircle,
  User,
  Edit,
  Clock,
  AlertCircle,
  UserPlus,
} from 'lucide-react';

interface ActivityLogCardProps {
  activities: ActivityLogItem[];
  className?: string;
}

const ActivityLogCard: React.FC<ActivityLogCardProps> = ({ activities, className }) => {
  const { t } = useLanguage();

  // Aktivlik ikonunu müəyyən edir
  const getActionIcon = (action: string) => {
    if (action.includes('təsdiqlə') || action.includes('approved')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (action.includes('rədd') || action.includes('rejected')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (action.includes('admin') || action.includes('təyin')) {
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    } else if (action.includes('yenilə') || action.includes('update')) {
      return <Edit className="h-4 w-4 text-amber-500" />;
    } else if (action.includes('gözlə') || action.includes('pending') || action.includes('waiting')) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Tarix formatını hazırlayır
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('az-AZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{t('activityLog')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">{t('noActivitiesYet')}</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 border-b pb-3">
                  <div className="mt-0.5">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.details || `${activity.entity || activity.entityType} - ${activity.target || ""}`}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{activity.user}</span>
                      </div>
                      <span>{formatDate(activity.timestamp || activity.time || '')}</span>
                    </div>
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
