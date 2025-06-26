
import React from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/common/useMobile';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'compact' | 'normal' | 'relaxed';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  className,
  spacing = 'normal',
  padding = 'md'
}) => {
  const isMobile = useMobile();

  const spacingClasses = {
    compact: 'space-y-2 sm:space-y-3',
    normal: 'space-y-4 sm:space-y-6',
    relaxed: 'space-y-6 sm:space-y-8'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div className={cn(
      spacingClasses[spacing],
      paddingClasses[padding],
      isMobile && 'touch-manipulation',
      // className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  // className
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };

  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;

  return (
    <div className={cn(
      'grid',
      gridCols,
      gapClasses[gap],
      // className
    )}>
      {children}
    </div>
  );
};

export default MobileOptimizedLayout;
