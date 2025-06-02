
import React from 'react';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveDashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const ResponsiveDashboardCard: React.FC<ResponsiveDashboardCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
  className
}) => {
  const variants = {
    default: 'border-border bg-card',
    primary: 'border-primary/20 bg-primary/5',
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    warning: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950',
    danger: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
  };

  const iconVariants = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-orange-600 dark:text-orange-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <ResponsiveCard 
      variant="compact"
      className={cn(
        variants[variant],
        'transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-3">
          <Icon className={cn(
            'h-5 w-5 sm:h-6 sm:w-6',
            iconVariants[variant]
          )} />
        </div>
      </div>
    </ResponsiveCard>
  );
};

export default ResponsiveDashboardCard;
