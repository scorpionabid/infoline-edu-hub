
// Responsive utilities
export const getResponsiveValue = <T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}, currentBreakpoint: 'mobile' | 'tablet' | 'desktop'): T => {
  return values[currentBreakpoint] ?? values.default;
};

// Touch target utilities
export const ensureTouchTarget = (className: string = '') => {
  return `min-h-[44px] min-w-[44px] touch-manipulation ${className}`;
};

// Responsive padding utilities
export const getResponsivePadding = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const sizes = {
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4 md:p-6',
    lg: 'p-4 sm:p-6 md:p-8',
    xl: 'p-6 sm:p-8 md:p-10'
  };
  return sizes[size];
};

// Responsive text utilities
export const getResponsiveText = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const sizes = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg md:text-xl',
    xl: 'text-lg sm:text-xl md:text-2xl'
  };
  return sizes[size];
};

// Grid responsive utilities
export const getResponsiveGrid = (columns: { mobile?: number; tablet?: number; desktop?: number }) => {
  const { mobile = 1, tablet = 2, desktop = 3 } = columns;
  return `grid-cols-${mobile} sm:grid-cols-${tablet} lg:grid-cols-${desktop}`;
};
