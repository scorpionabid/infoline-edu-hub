import React, { memo, Suspense, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore, selectIsLoading, selectUser } from '@/hooks/auth/useAuthStore';
import { useResponsiveLayout } from '@/hooks/layout/mobile/useResponsiveLayout';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceOptimization';
import { LoadingIndicator } from '@/components/performance';
import UnifiedHeader from './UnifiedHeader';
import UnifiedSidebar from './UnifiedSidebar';
import MobileBottomNav from '../parts/MobileBottomNav';
import QuickActions from '../parts/QuickActions';
import BreadcrumbNav from '../parts/BreadcrumbNav';

interface UnifiedLayoutProps {
  children?: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  fullWidth?: boolean;
}

const UnifiedLayout: React.FC<UnifiedLayoutProps> = memo(({ 
  children,
  showSidebar = true,
  showHeader = true,
  fullWidth = false
}) => {
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  
  usePerformanceMonitor('UnifiedLayout');
  
  const {
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    sidebarWidth,
    headerHeight,
    contentPadding,
    sidebarVariant
  } = useResponsiveLayout();
  
  // Listen to window resize events and adjust sidebar visibility
  React.useEffect(() => {
    // This function handles sidebar visibility based on screen size
    const handleResize = () => {
      const width = window.innerWidth;
      // Large desktops and tablets - show sidebar
      if (width >= 1024) { // lg breakpoint
        setSidebarOpen(true);
      } 
      // Medium screens - conditionally show sidebar
      else if (width >= 768) { // md breakpoint
        // Optional: you can choose to leave the current state or enforce a state
        // setSidebarOpen(true);
      } 
      // Mobile screens - hide sidebar
      else {
        setSidebarOpen(false);
      }
      
      // Force re-render for correct layout
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    };

    // Initial setup
    handleResize();

    // Add resize listener with debounce to avoid excessive calls
    let resizeTimer: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [setSidebarOpen]);
  
  // Memoize heavy calculations
  const layoutCalculations = useMemo(() => {
    const shouldShowDesktopSidebar = isLaptop || isDesktop;
    const shouldShowOverlaySidebar = isMobile || isTablet;
    
    // Desktop və ya geniş ekranlarda sidebar həmişə görünməlidir
    const isWideScreen = window.innerWidth >= 1024; // lg breakpoint
    
    return {
      shouldShowDesktopSidebar,
      shouldShowOverlaySidebar,
      mainContentStyle: {
        // Desktop ekranlarda margin tətbiq et, kiçik ekranlarda isə yox
        marginLeft: isWideScreen ? `${sidebarWidth}px` : '0px',
        transition: 'margin-left 0.3s ease-in-out',
        minWidth: 0
      },
      mainPadding: {
        padding: contentPadding,
        paddingBottom: isMobile ? '80px' : contentPadding,
        minWidth: 0
      },
      isWideScreen
    };
  }, [isLaptop, isDesktop, isMobile, isTablet, sidebarOpen, contentPadding, sidebarWidth]);
  
  console.log('[UnifiedLayout] Enhanced responsive state:', { 
    user: !!user, 
    isLoading, 
    sidebarOpen,
    sidebarVariant,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    sidebarWidth
  });

  // Early return for loading state
  if (isLoading) {
    return <LoadingIndicator size="lg" />;
  }

  // Early return for unauthenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">İstifadəçi məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  const { shouldShowDesktopSidebar, shouldShowOverlaySidebar, mainContentStyle, mainPadding, isWideScreen } = layoutCalculations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 w-full">
      <div className="flex h-screen w-full relative">
        {/* Enhanced Sidebar - Responsive variants */}
        {showSidebar && (
          <>
            {/* Desktop/Laptop sidebar - Always visible when screen is large enough */}
            {shouldShowDesktopSidebar && (
              <div 
                className="fixed lg:relative transition-all duration-300 ease-in-out overflow-hidden h-full z-30"
                style={{ 
                  width: sidebarWidth,
                  transform: sidebarOpen || layoutCalculations.isWideScreen ? 'translateX(0)' : 'translateX(-100%)',
                  opacity: sidebarOpen || layoutCalculations.isWideScreen ? 1 : 0,
                  boxShadow: sidebarOpen ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                }}>
                <UnifiedSidebar 
                  isOpen={sidebarOpen}
                  onToggle={toggleSidebar}
                  userName={user?.full_name || user?.email}
                  variant={isLaptop ? "overlay" : "desktop"}
                  width={sidebarWidth}
                />
              </div>
            )}

            {/* Mobile/Tablet overlay sidebar */}
            {shouldShowOverlaySidebar && sidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden="true"
                />
                
                {/* Sidebar */}
                <div className="relative">
                  <UnifiedSidebar 
                    isOpen={sidebarOpen}
                    onToggle={toggleSidebar}
                    userName={user?.full_name || user?.email}
                    variant="mobile"
                    width={sidebarWidth}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Main content area - Enhanced responsive layout */}
        <div 
          className="flex flex-col flex-1 w-full min-w-0 relative transition-all duration-300 ease-in-out"
          style={mainContentStyle}
        >
          {/* Unified Header */}
          {showHeader && (
            <UnifiedHeader 
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              toggleSidebar={toggleSidebar}
              showSearch={true}
              showNotifications={true}
              height={headerHeight}
            />
          )}
          
          {/* Page content with enhanced responsive padding */}
          <main 
            className="flex-1 overflow-auto w-full relative"
            style={mainPadding}
          >
            <div className={`w-full mx-auto animate-fade-in-up ${fullWidth ? 'max-w-none' : 'max-w-full'}`}>
              {/* Breadcrumb Navigation */}
              <BreadcrumbNav />
              
              {/* Page Content with Suspense */}
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <LoadingIndicator />
                </div>
              }>
                {children || <Outlet />}
              </Suspense>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation - only for mobile */}
      {isMobile && <MobileBottomNav />}

      {/* Quick Actions FAB - responsive positioning */}
      <QuickActions />
    </div>
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison function for memo
  return (
    prevProps.showSidebar === nextProps.showSidebar &&
    prevProps.showHeader === nextProps.showHeader &&
    prevProps.fullWidth === nextProps.fullWidth &&
    prevProps.children === nextProps.children
  );
});

UnifiedLayout.displayName = 'UnifiedLayout';

export default UnifiedLayout;