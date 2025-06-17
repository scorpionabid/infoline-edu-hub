
import React from 'react';
import { LucideIcon } from 'lucide-react';
import EnhancedCard from '@/components/ui/enhanced-card';
import { cn } from '@/lib/utils';

interface EnhancedDashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  onClick?: () => void;
}

const getVariantClasses = (variant: string = 'default') => {
  const variants = {
    default: 'border-border',
    primary: 'border-primary/20 bg-primary/5',
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
  };
  return variants[variant as keyof typeof variants] || variants.default;
};

const getIconColorClasses = (variant: string = 'default') => {
  const colors = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400'
  };
  return colors[variant as keyof typeof colors] || colors.default;
};

export const EnhancedDashboardCard: React.FC<EnhancedDashboardCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  onClick
}) => {
  return (
    <EnhancedCard
      variant="elevated"
      hover={!!onClick}
      interactive={!!onClick}
      onClick={onClick}
      className={cn(
        getVariantClasses(variant),
        'animate-fade-in-up',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-foreground">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  trend.isPositive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            getIconColorClasses(variant),
            variant !== 'default' && 'bg-white/50 dark:bg-black/20'
          )}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </EnhancedCard>
  );
};

export default EnhancedDashboardCard;
