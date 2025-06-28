
import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/common/useResponsive';

interface EnhancedResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'compact' | 'normal' | 'relaxed';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
}

export const EnhancedResponsiveLayout: React.FC<EnhancedResponsiveLayoutProps> = ({
  children,
  className,
  spacing = 'normal',
  padding = 'md',
  maxWidth = '7xl'
}) => {
  const { isMobile, isTablet, isTouchDevice } = useResponsive();

  const spacingClasses = {
    compact: 'space-y-2 sm:space-y-3 lg:space-y-4',
    normal: 'space-y-4 sm:space-y-6 lg:space-y-8',
    relaxed: 'space-y-6 sm:space-y-8 lg:space-y-12'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3 lg:p-4',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-12',
    xl: 'p-8 sm:p-12 lg:p-16'
  };

  const maxWidthClasses = {
    none: '',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  };

  return (
    <div className={cn(
      spacingClasses[spacing],
      paddingClasses[padding],
      maxWidth !== 'none' && `mx-auto ${maxWidthClasses[maxWidth]}`,
      isTouchDevice && 'touch-manipulation',
      className
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
    laptop?: number;
    desktop?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, laptop: 3, desktop: 4 },
  gap = 'md',
  className
}) => {
  const gapClasses = {
    xs: 'gap-1 sm:gap-2',
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-4 sm:gap-6 lg:gap-8',
    lg: 'gap-6 sm:gap-8 lg:gap-12',
    xl: 'gap-8 sm:gap-12 lg:gap-16'
  };

  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} md:grid-cols-${cols.laptop} lg:grid-cols-${cols.desktop}`;

  return (
    <div className={cn(
      'grid',
      gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

interface TouchTargetProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'min-h-[40px] min-w-[40px]',
    md: 'min-h-[44px] min-w-[44px]',
    lg: 'min-h-[48px] min-w-[48px]'
  };

  return (
    <div className={cn(
      sizeClasses[size],
      'touch-manipulation flex items-center justify-center',
      className
    )}>
      {children}
    </div>
  );
};

export default EnhancedResponsiveLayout;
