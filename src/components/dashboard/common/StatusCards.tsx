
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { StatsItem } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface StatusCardsProps {
  stats: StatsItem[];
  completionRate?: number;
  pendingItems?: number;
  additionalStats?: {
    activeUsers?: number;
    upcomingDeadlines?: number;
    recentSubmissions?: number;
  };
  className?: string;
}

const StatusCards: React.FC<StatusCardsProps> = ({ 
  stats, 
  completionRate = 0, 
  pendingItems = 0,
  additionalStats,
  className
}) => {
  const { t } = useLanguage();

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              {stat.icon && <span className="mr-2">{stat.icon}</span>}
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stat.count || stat.value || 0}</div>
              {(typeof stat.change !== 'undefined' && typeof stat.changeType !== 'undefined') && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs">{stat.change}%</span>
                  <div className={cn(
                    "text-xs",
                    stat.changeType === 'increase' && "text-green-600",
                    stat.changeType === 'decrease' && "text-red-600",
                    stat.changeType === 'neutral' && "text
                    -gray-600"
                  )}>
                    {stat.changeType === 'increase' ? '↑' : stat.changeType === 'decrease' ? '↓' : '→'}
                  </div>
                </div>
              )}
            </div>
            {stat.description && (
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            )}
          </CardContent>
        </Card>
      ))}

      {completionRate > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('completionRate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  completionRate >= 80 ? "bg-green-500" : 
                  completionRate >= 50 ? "bg-amber-500" : 
                  "bg-red-500"
                )}
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingItems > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('pendingApprovals')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingItems}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t('itemsNeedingApproval')}</p>
          </CardContent>
        </Card>
      )}

      {additionalStats?.activeUsers && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('activeUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{additionalStats.activeUsers}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t('activeUsersLast30Days')}</p>
          </CardContent>
        </Card>
      )}

      {additionalStats?.upcomingDeadlines && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('upcomingDeadlines')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{additionalStats.upcomingDeadlines}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t('deadlinesNext7Days')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatusCards;
