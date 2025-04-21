
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { StatsItem } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  stats: StatsItem[];
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, className }) => {
  const { t } = useLanguage();

  if (stats.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('statistics')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('noStatsAvailable')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('statistics')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col space-y-2 p-4 rounded-lg border"
            >
              {stat.icon && (
                <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center">
                  {stat.icon}
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{stat.count}</p>
                  {(typeof stat.change !== 'undefined' && typeof stat.changeType !== 'undefined') && (
                    <div className="flex items-center space-x-1">
                      <span className={cn(
                        "text-xs",
                        stat.changeType === 'increase' && "text-green-600",
                        stat.changeType === 'decrease' && "text-red-600",
                        stat.changeType === 'neutral' && "text-gray-600"
                      )}>
                        {stat.changeType === 'increase' ? '↑' : stat.changeType === 'decrease' ? '↓' : '→'}
                        {stat.change}%
                      </span>
                    </div>
                  )}
                </div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
