
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCardProps } from '@/types/dashboard';
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from 'lucide-react';

export const StatsCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendDirection = 'neutral'
}: StatsCardProps) => {
  // Trend istiqamətinə görə rəng və ikon təyini
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up': return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default: return <ArrowRightIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        {trend && (
          <div className={`flex items-center mt-3 text-xs font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
