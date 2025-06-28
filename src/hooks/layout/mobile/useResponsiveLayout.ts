
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMediaQuery } from '@/hooks/common/useMediaQuery';
import { useLocalStorage } from '@/hooks/common/useLocalStorageHook';

interface ResponsiveLayoutConfig {
  sidebar: {
    isOpen: boolean;
    width: {
      mobile: number;
      tablet: number;
      laptop: number;
      desktop: number;
    };
    variant: 'desktop' | 'overlay' | 'push' | 'over';
    breakpoints: {
      mobile: number;
      tablet: number;
      laptop: number;
      desktop: number;
    };
  };
  header: {
    height: {
      mobile: number;
      desktop: number;
    };
    sticky: boolean;
  };
  layout: {
    containerMaxWidth: string;
    padding: {
      mobile: string;
      tablet: string;
      laptop: string;
      desktop: string;
    };
  };
}

const DEFAULT_CONFIG: ResponsiveLayoutConfig = {
  sidebar: {
    isOpen: false,
    width: {
      mobile: 280,
      tablet: 260,
      laptop: 280,
      desktop: 320
    },
    variant: 'desktop',
    breakpoints: {
      mobile: 640,
      tablet: 768,
      laptop: 1024,
      desktop: 1280
    }
  },
  header: {
    height: {
      mobile: 60,
      desktop: 64
    },
    sticky: true
  },
  layout: {
    containerMaxWidth: '7xl',
    padding: {
      mobile: '1rem',
      tablet: '1.5rem',
      laptop: '1.5rem',
      desktop: '2rem'
    }
  }
};

interface UseResponsiveLayoutReturn {
  // Device detection - enhanced with laptop
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
  
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Layout configuration
  config: ResponsiveLayoutConfig;
  updateConfig: (updates: Partial<ResponsiveLayoutConfig>) => void;
  
  // Layout calculations
  sidebarWidth: number;
  headerHeight: number;
  contentPadding: string;
  sidebarVariant: ResponsiveLayoutConfig['sidebar']['variant'];
  
  // Utility functions
  getBreakpointClass: (breakpoint: keyof ResponsiveLayoutConfig['sidebar']['breakpoints']) => string;
  isBreakpoint: (breakpoint: keyof ResponsiveLayoutConfig['sidebar']['breakpoints']) => boolean;
}

export const useResponsiveLayout = (): UseResponsiveLayoutReturn => {
  // Enhanced media queries for better breakpoint detection
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 767px)');
  const isLaptop = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Persistent configuration
  const [config, setConfig] = useLocalStorage<ResponsiveLayoutConfig>('layout-config', DEFAULT_CONFIG);
  
  // Enhanced sidebar state management
  const [sidebarOpen, setSidebarOpenState] = useState(() => {
    if (typeof window !== 'undefined') {
      const isLargeScreen = window.matchMedia('(min-width: 1024px)').matches;
      const savedState = localStorage.getItem('sidebar-open');
      return isLargeScreen ? (savedState !== null ? savedState === 'true' : true) : false;
    }
    return true;
  });

  // Auto-close sidebar on small screens when route changes
  useEffect(() => {
    if ((isMobile || isTablet) && sidebarOpen) {
      const handlePopstate = () => setSidebarOpenState(false);
      window.addEventListener('popstate', handlePopstate);
      return () => window.removeEventListener('popstate', handlePopstate);
    }
  }, [isMobile, isTablet, sidebarOpen]);

  // Maintain desktop sidebar state
  useEffect(() => {
    if (isDesktop && !sidebarOpen) {
      const savedState = localStorage.getItem('sidebar-open');
      if (savedState === null || savedState === 'true') {
        setSidebarOpenState(true);
      }
    }
  }, [isDesktop]);

  // Update sidebar state in localStorage for large screens
  useEffect(() => {
    if (isLaptop || isDesktop) {
      localStorage.setItem('sidebar-open', sidebarOpen.toString());
    }
  }, [sidebarOpen, isLaptop, isDesktop]);

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpenState(prev => !prev);
  }, []);

  const updateConfig = useCallback((updates: Partial<ResponsiveLayoutConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates
    }));
  }, [setConfig]);

  // Enhanced sidebar width calculation
  const sidebarWidth = useMemo(() => {
    if (isMobile) return Math.min(280, window.innerWidth * 0.85);
    if (isTablet) return config.sidebar.width.tablet;
    if (isLaptop) return config.sidebar.width.laptop;
    return config.sidebar.width.desktop;
  }, [isMobile, isTablet, isLaptop, config.sidebar.width]);

  const headerHeight = useMemo(() => {
    return isMobile ? config.header.height.mobile : config.header.height.desktop;
  }, [isMobile, config.header.height]);

  // Enhanced content padding
  const contentPadding = useMemo(() => {
    if (isMobile) return config.layout.padding.mobile;
    if (isTablet) return config.layout.padding.tablet;
    if (isLaptop) return config.layout.padding.laptop;
    return config.layout.padding.desktop;
  }, [isMobile, isTablet, isLaptop, config.layout.padding]);

  // Enhanced sidebar variant logic
  const sidebarVariant = useMemo((): ResponsiveLayoutConfig['sidebar']['variant'] => {
    if (isMobile || isTablet) return 'overlay';
    if (isLaptop) return 'push';
    return 'desktop';
  }, [isMobile, isTablet, isLaptop]);

  const getBreakpointClass = useCallback((breakpoint: keyof ResponsiveLayoutConfig['sidebar']['breakpoints']) => {
    switch (breakpoint) {
      case 'mobile': 
        return 'sm:hidden';
      case 'tablet': 
        return 'hidden sm:block md:hidden';
      case 'laptop': 
        return 'hidden md:block lg:hidden';
      case 'desktop': 
        return 'hidden lg:block';
      default: 
        return '';
    }
  }, []);

  const isBreakpoint = useCallback((breakpoint: keyof ResponsiveLayoutConfig['sidebar']['breakpoints']) => {
    switch (breakpoint) {
      case 'mobile': 
        return isMobile;
      case 'tablet': 
        return isTablet;
      case 'laptop': 
        return isLaptop;
      case 'desktop': 
        return isDesktop;
      default: 
        return false;
    }
  }, [isMobile, isTablet, isLaptop, isDesktop]);

  return {
    // Enhanced device detection
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    
    // Sidebar state
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    
    // Layout configuration
    config,
    updateConfig,
    
    // Layout calculations
    sidebarWidth,
    headerHeight,
    contentPadding,
    sidebarVariant,
    
    // Utility functions
    getBreakpointClass,
    isBreakpoint
  };
};
