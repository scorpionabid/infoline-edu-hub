import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  trendDirection = 'neutral'
}) => {
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'neutral':
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColorClass = () => {
    switch (trendDirection) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center mt-1 text-xs">
            {description && <p className="text-muted-foreground">{description}</p>}
            {trend && (
              <div className={`flex items-center ml-auto ${getTrendColorClass()}`}>
                {getTrendIcon()}
                <span className="ml-0.5">{trend}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};