import { useMemo } from 'react';

// Export mobile hooks
export { useTouchGestures } from './useTouchGestures';
export { useResponsiveLayout } from './useResponsiveLayout';

// Mobile-specific types
export interface TouchTarget {
  minHeight: number;
  minWidth: number;
  tapTarget: boolean;
  accessibilityRole?: string;
}

// Touch-friendly component standards
export const TOUCH_STANDARDS = {
  minTouchTarget: 44, // px - Apple & Google recommendation
  minSpacing: 8, // px - minimum space between touch targets
  tapDelay: 300, // ms - standard tap delay
  longPressDelay: 500, // ms - long press detection
  swipeThreshold: 50, // px - minimum distance for swipe
  tapThreshold: 10, // px - maximum movement for tap
} as const;

// Mobile breakpoints
export const MOBILE_BREAKPOINTS = {
  xs: 320,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Mobile-optimized spacing system
export const MOBILE_SPACING = {
  touch: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },
  content: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
  },
  header: {
    mobile: '3.75rem', // 60px
    desktop: '4rem', // 64px
  },
  sidebar: {
    mobile: '20rem', // 320px (full width overlay)
    tablet: '15rem', // 240px
    desktop: '17.5rem', // 280px
  },
} as const;

// Hook for getting mobile-optimized classes
export const useMobileClasses = () => {
  return useMemo(() => ({
    // Touch target classes
    touchTarget: `min-h-[${TOUCH_STANDARDS.minTouchTarget}, px] min-w-[${TOUCH_STANDARDS.minTouchTarget}, px] touch-manipulation`,
    
    // Responsive padding
    responsivePadding: 'px-4 sm:px-6 lg:px-8',
    
    // Mobile-first grid
    responsiveGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    
    // Mobile navigation
    mobileNav: 'md:hidden',
    desktopNav: 'hidden md:block',
    
    // Mobile form elements
    mobileInput: 'text-base', // Prevents zoom on iOS
    
    // Mobile-friendly text sizes
    responsiveText: {
      xs: 'text-sm sm:text-base',
      sm: 'text-base sm:text-lg',
      lg: 'text-lg sm:text-xl',
      xl: 'text-xl sm:text-2xl',
      '2xl': 'text-2xl sm:text-3xl',
    },
    
    // Mobile spacing
    mobileSpacing: {
      section: 'py-8 sm:py-12 lg:py-16',
      card: 'p-4 sm:p-6',
      button: 'px-4 py-2 sm:px-6 sm:py-3',
    },
    
    // Mobile animations
    mobileTransition: 'transition-all duration-300 ease-in-out',
    
    // Mobile-safe z-index layers
    zIndex: {
      backdrop: 'z-40',
      sidebar: 'z-50',
      header: 'z-30',
      dropdown: 'z-20',
      modal: 'z-50',
      toast: 'z-60',
    },
  }), []);
};