
import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveConfig {
  mobile?: any;
  tablet?: any;
  desktop?: any;
  default: any;
}

/**
 * Təkmilləşdirilmiş Responsive Hook
 * 
 * Bu hook aşağıdakı funksiyaları təmin edir:
 * - Real-time device detection
 * - Touch device support
 * - Orientation detection
 * - Performance optimized
 */
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [screenSize, setScreenSize] = useState({ width: 1024, height: 768 });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Update screen size
      setScreenSize({ width, height });
      
      // Update orientation
      setOrientation(height > width ? 'portrait' : 'landscape');
      
      // Update breakpoints
      if (width < 640) {
        setBreakpoint('mobile');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 1024) {
        setBreakpoint('tablet');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else {
        setBreakpoint('desktop');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };
    
    // Detect touch device
    const detectTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        /Mobi|Android/i.test(navigator.userAgent)
      );
    };

    // Initial setup
    updateBreakpoint();
    detectTouch();
    
    // Event listeners
    window.addEventListener('resize', updateBreakpoint);
    window.addEventListener('orientationchange', updateBreakpoint);
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint);
      window.removeEventListener('orientationchange', updateBreakpoint);
    };
  }, []);

  return {
    // Basic breakpoint info
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    
    // Device info
    isTouchDevice,
    orientation,
    screenSize,
    
    // Utility functions
    getValue: <T>(config: ResponsiveConfig): T => {
      return config[breakpoint] ?? config.default;
    },
    
    // CSS classes helper
    getClasses: (config: ResponsiveConfig): string => {
      const value = config[breakpoint] ?? config.default;
      return typeof value === 'string' ? value : '';
    },
    
    // Size helpers
    isSmallScreen: isMobile,
    isMediumScreen: isTablet,
    isLargeScreen: isDesktop,
    
    // Touch helpers
    shouldUseTouchOptimizations: isTouchDevice,
    getOptimalTouchTarget: () => {
      return isTouchDevice ? 'min-h-[44px] min-w-[44px]' : 'min-h-[32px] min-w-[32px]';
    },
    
    // Performance helpers
    shouldReduceAnimations: isMobile && screenSize.width < 400,
    shouldUseVirtualization: screenSize.height < 600
  };
};
