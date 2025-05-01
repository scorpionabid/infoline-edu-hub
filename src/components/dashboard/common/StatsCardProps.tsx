
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string | React.ReactNode;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendDirection = 'neutral',
  className
}) => {
  const trendColorClass = 
    trendDirection === 'up' ? 'text-green-600' : 
    trendDirection === 'down' ? 'text-red-600' : 
    'text-gray-500';

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {typeof icon === 'string' ? (
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <span className="text-sm">{icon}</span>
          </div>
        ) : icon ? (
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && <p className={`text-sm mt-2 ${trendColorClass}`}>{trend}</p>}
      </CardContent>
    </Card>
  );
};
