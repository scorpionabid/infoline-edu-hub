
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatsCardProps } from '@/types/dashboard';

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendDirection = 'neutral',
  onClick,
}) => {
  return (
    <Card className={cn(onClick && 'cursor-pointer hover:shadow-md')} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trendDirection === 'up' && (
              <TrendingUp className="h-3 w-3 text-green-500" />
            )}
            {trendDirection === 'down' && (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            {trendDirection === 'neutral' && (
              <Minus className="h-3 w-3 text-gray-500" />
            )}
            <span
              className={cn(
                'text-xs',
                trendDirection === 'up' && 'text-green-500',
                trendDirection === 'down' && 'text-red-500',
                trendDirection === 'neutral' && 'text-gray-500'
              )}
            >
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
