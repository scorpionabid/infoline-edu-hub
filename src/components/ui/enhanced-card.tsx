
import React from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface EnhancedCardProps extends CardProps {
  variant?: 'default' | 'compact' | 'spacious' | 'mobile-optimized';
  interactive?: boolean;
  loading?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = 'default', interactive = false, loading = false, children, ...props }, ref) => {
    const variants = {
      default: 'p-4 sm:p-6',
      compact: 'p-2 sm:p-3 md:p-4',
      spacious: 'p-6 sm:p-8 md:p-10',
      'mobile-optimized': 'p-3 sm:p-4 md:p-6 min-h-[60px] sm:min-h-[80px]'
    };

    return (
      <Card
        className={cn(
          variants[variant],
          // Interactive states
          interactive && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
          interactive && 'hover:scale-[1.02] active:scale-[0.98]',
          // Loading state
          loading && 'animate-pulse',
          // Touch-friendly on mobile
          'touch-manipulation',
          className
        )}
        ref={ref}
        {...props}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        ) : (
          children
        )}
      </Card>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

export { EnhancedCard };
