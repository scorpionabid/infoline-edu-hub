import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMediaQuery } from '@/hooks/common/useMediaQuery';
import { useLocalStorage } from '@/hooks/common/useLocalStorageHook';

interface ResponsiveLayoutConfig {
  sidebar: {
    isOpen: boolean;
    width: {
      desktop: number;
      tablet: number;
      mobile: number;
    };
    variant: 'desktop' | 'overlay' | 'push' | 'over';
    breakpoints: {
      mobile: number;
      tablet: number;
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
      desktop: string;
    };
  };
}

const DEFAULT_CONFIG: ResponsiveLayoutConfig = {
  sidebar: {
    isOpen: false,
    width: {
      desktop: 280,
      tablet: 240,
      mobile: 320
    },
    variant: 'desktop',
    breakpoints: {
      mobile: 768,
      tablet: 1024,
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
      desktop: '2rem'
    }
  }
};

interface UseResponsiveLayoutReturn {
  // Device detection
  isMobile: boolean;
  isTablet: boolean;
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
  // Media queries for responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Persistent configuration
  const [config, setConfig] = useLocalStorage<ResponsiveLayoutConfig>('layout-config', DEFAULT_CONFIG);
  
  // Sidebar state - different behavior for different screen sizes
  const [sidebarOpen, setSidebarOpenState] = useState(() => {
    // Desktop: open by default, remember state; others: closed by default
    if (typeof window !== 'undefined') {
      const isDesktopQuery = window.matchMedia('(min-width: 1024px)').matches;
      const savedState = localStorage.getItem('sidebar-open');
      return isDesktopQuery ? (savedState !== null ? savedState === 'true' : true) : false;
    }
    return true; // Default to open for SSR
  });

  // Ensure sidebar stays open on desktop after first load
  useEffect(() => {
    if (isDesktop && !sidebarOpen) {
      const savedState = localStorage.getItem('sidebar-open');
      if (savedState === null || savedState === 'true') {
        setSidebarOpenState(true);
      }
    }
  }, [isDesktop]);

  // Update sidebar open state in localStorage for desktop
  useEffect(() => {
    if (isDesktop) {
      localStorage.setItem('sidebar-open', sidebarOpen.toString());
    }
  }, [sidebarOpen, isDesktop]);

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      const handlePopstate = () => setSidebarOpenState(false);
      window.addEventListener('popstate', handlePopstate);
      return () => window.removeEventListener('popstate', handlePopstate);
    }
  }, [isMobile, sidebarOpen]);

  // Controlled sidebar state setter
  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpenState(prev => !prev);
  }, []);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<ResponsiveLayoutConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates
    }));
  }, [setConfig]);

  // Calculate current sidebar width based on device
  const sidebarWidth = useMemo(() => {
    if (isMobile) return config.sidebar.width.mobile;
    if (isTablet) return config.sidebar.width.tablet;
    return config.sidebar.width.desktop;
  }, [isMobile, isTablet, config.sidebar.width]);

  // Calculate current header height
  const headerHeight = useMemo(() => {
    return isMobile ? config.header.height.mobile : config.header.height.desktop;
  }, [isMobile, config.header.height]);

  // Calculate content padding
  const contentPadding = useMemo(() => {
    if (isMobile) return config.layout.padding.mobile;
    if (isTablet) return config.layout.padding.tablet;
    return config.layout.padding.desktop;
  }, [isMobile, isTablet, config.layout.padding]);

  // Determine sidebar variant based on screen size
  const sidebarVariant = useMemo((): ResponsiveLayoutConfig['sidebar']['variant'] => {
    if (isMobile) return 'overlay';
    if (isTablet) return 'over';
    return 'desktop';
  }, [isMobile, isTablet]);

  // Utility function to get breakpoint classes
  const getBreakpointClass = useCallback((breakpoint: keyof ResponsiveLayoutConfig['sidebar']['breakpoints']) => {
    switch (breakpoint) {
      case 'mobile': 
        return 'md:hidden';
      case 'tablet': 
        return 'hidden md:block lg:hidden';
      case 'desktop': 
        return 'hidden lg:block';
      default: 
        return '';
    }
  }, []);

  // Check if current screen matches breakpoint
  const isBreakpoint = useCallback((breakpoint: keyof ResponsiveLayoutConfig['sidebar']['breakpoints']) => {
    switch (breakpoint) {
      case 'mobile': 
        return isMobile;
      case 'tablet': 
        return isTablet;
      case 'desktop': 
        return isDesktop;
      default: 
        return false;
    }
  }, [isMobile, isTablet, isDesktop]);

  return {
    // Device detection
    isMobile,
    isTablet,
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
    // isBreakpoint
  };
};