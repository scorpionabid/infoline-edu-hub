
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = ""
}) => {
  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center space-x-1 text-xs">
            {trend.isPositive ? (
              <ArrowUpIcon className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-500" />
            )}
            <span className={trend.isPositive ? "text-green-500" : "text-red-500"}>
              {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
