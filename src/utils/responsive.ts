
// Enhanced responsive utilities
export const getResponsiveValue = <T>(values: {
  mobile?: T;
  tablet?: T;
  laptop?: T;
  desktop?: T;
  default: T;
}, currentBreakpoint: 'mobile' | 'tablet' | 'laptop' | 'desktop'): T => {
  return values[currentBreakpoint] ?? values.default;
};

// Touch target utilities - Apple/Google standards
export const ensureTouchTarget = (className: string = '') => {
  return `min-h-[44px] min-w-[44px] touch-manipulation ${className}`;
};

// Enhanced responsive padding utilities
export const getResponsivePadding = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const sizes = {
    xs: 'p-1 sm:p-2',
    sm: 'p-2 sm:p-3 lg:p-4',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-12',
    xl: 'p-8 sm:p-12 lg:p-16'
  };
  return sizes[size];
};

// Enhanced responsive text utilities - prevents iOS zoom
export const getResponsiveText = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md') => {
  const sizes = {
    xs: 'text-xs sm:text-xs',
    sm: 'text-base sm:text-sm', // base on mobile prevents zoom
    md: 'text-base sm:text-base',
    lg: 'text-lg sm:text-lg lg:text-xl',
    xl: 'text-xl sm:text-xl lg:text-2xl',
    '2xl': 'text-2xl sm:text-2xl lg:text-3xl'
  };
  return sizes[size];
};

// Enhanced grid responsive utilities with laptop support
export const getResponsiveGrid = (columns: { 
  mobile?: number; 
  tablet?: number; 
  laptop?: number;
  desktop?: number;
}) => {
  const { mobile = 1, tablet = 2, laptop = 3, desktop = 4 } = columns;
  return `grid-cols-${mobile} sm:grid-cols-${tablet} md:grid-cols-${laptop} lg:grid-cols-${desktop}`;
};

// Form input utilities - prevents zoom on iOS
export const getResponsiveInputClasses = () => {
  return 'text-base sm:text-sm h-12 sm:h-10 min-h-[44px] touch-manipulation';
};

// Button utilities with proper touch targets
export const getResponsiveButtonClasses = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizes = {
    sm: 'h-10 px-3 sm:h-9 sm:px-2 min-h-[40px] text-base sm:text-sm',
    md: 'h-12 px-4 sm:h-10 sm:px-3 min-h-[44px] text-base sm:text-sm',
    lg: 'h-14 px-6 sm:h-12 sm:px-4 min-h-[48px] text-lg sm:text-base'
  };
  return `${sizes[size]} touch-manipulation`;
};

// Spacing utilities
export const getResponsiveSpacing = (type: 'section' | 'card' | 'element' = 'section') => {
  const spacing = {
    section: 'py-8 sm:py-12 lg:py-16',
    card: 'p-4 sm:p-6 lg:p-8',
    element: 'py-2 sm:py-3 lg:py-4'
  };
  return spacing[type];
};

// Container utilities
export const getResponsiveContainer = (size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg') => {
  const containers = {
    sm: 'max-w-sm mx-auto px-4',
    md: 'max-w-md mx-auto px-4 sm:px-6',
    lg: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    xl: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    full: 'w-full px-4 sm:px-6 lg:px-8'
  };
  return containers[size];
};
