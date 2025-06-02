
import React from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps extends CardProps {
  variant?: 'default' | 'compact' | 'spacious';
  mobileOptimized?: boolean;
}

const ResponsiveCard = React.forwardRef<HTMLDivElement, ResponsiveCardProps>(
  ({ className, variant = 'default', mobileOptimized = true, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          // Base responsive spacing
          mobileOptimized && [
            // Responsive padding based on variant
            variant === 'compact' && 'p-3 sm:p-4',
            variant === 'default' && 'p-4 sm:p-6',
            variant === 'spacious' && 'p-6 sm:p-8',
            // Responsive margins
            'm-2 sm:m-4',
            // Mobile-friendly borders and shadows
            'border-border/50 sm:border-border',
            'shadow-sm sm:shadow-md',
          ],
          className
        )}
        {...props}
      />
    );
  }
);

ResponsiveCard.displayName = 'ResponsiveCard';

export { ResponsiveCard };
