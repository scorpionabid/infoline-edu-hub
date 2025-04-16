
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsItem } from '@/types/dashboard';

export interface StatusCardsProps {
  stats: StatsItem[];
  completionRate: number;
  pendingItems?: number;
  className?: string;
  additionalStats?: {
    activeUsers?: number;
    upcomingDeadlines?: number;
    recentSubmissions?: number;
  };
}

const StatusCards: React.FC<StatusCardsProps> = ({ 
  stats, 
  completionRate, 
  pendingItems = 0,
  className,
  additionalStats 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ''}`}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.label}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatusCards;
