
import React from 'react';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { useResponsive } from '@/hooks/common/useResponsive';
import { cn } from '@/lib/utils';

interface ResponsiveDashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    type: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export const ResponsiveDashboardCard: React.FC<ResponsiveDashboardCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className
}) => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveCard
      variant={isMobile ? "compact" : "default"}
      className={cn(
        "h-full",
        className
      )}
      title={title}
      description={description}
      content={
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-2xl sm:text-3xl font-bold">{value}</div>
            {trend && (
              <div className={cn(
                "text-sm flex items-center gap-1",
                trend.type === 'up' && "text-green-600",
                trend.type === 'down' && "text-red-600",
                trend.type === 'neutral' && "text-gray-600"
              )}>
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                <span>{trend.label}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="text-2xl sm:text-3xl opacity-50">
              {icon}
            </div>
          )}
        </div>
      }
    />
  );
};

export default ResponsiveDashboardCard;
