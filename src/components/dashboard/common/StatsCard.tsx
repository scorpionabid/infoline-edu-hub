
import React from 'react';
import { ArrowDown, ArrowUp, CircleDashed } from 'lucide-react';
import { StatsCardProps } from '@/types/dashboard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title,
  value,
  icon,
  description,
  trend,
  trendDirection = 'neutral'
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="font-medium text-lg">{title}</div>
        <div className="bg-muted h-8 w-8 flex items-center justify-center rounded-full">
          {typeof icon === 'string' ? icon : icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            {trendDirection === 'up' && (
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            )}
            {trendDirection === 'down' && (
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            {trendDirection === 'neutral' && (
              <CircleDashed className="mr-1 h-4 w-4 text-muted-foreground" />
            )}
            <span className={`text-xs ${
              trendDirection === 'up' ? 'text-green-500' : 
              trendDirection === 'down' ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
