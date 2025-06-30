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
  
  // Memoize heavy calculations - Bütün ekranlarda overlay sidebar
  const layoutCalculations = useMemo(() => {
    // Artıq bütün ekranlarda overlay sidebar istifadə edirik
    const shouldShowOverlaySidebar = true; // Bütün ekranlar üçün
    const shouldShowDesktopSidebar = false; // Artıq desktop sidebar yoxdur
    
    return {
      shouldShowDesktopSidebar,
      shouldShowOverlaySidebar,
      mainContentStyle: {
        marginLeft: 0, // Heç vaxt margin olmayacaq
        minWidth: 0
      },
      mainPadding: {
        padding: contentPadding,
        paddingBottom: isMobile ? '80px' : contentPadding,
        minWidth: 0
      }
    };
  }, [isMobile, contentPadding]);
  
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

  const { shouldShowDesktopSidebar, shouldShowOverlaySidebar, mainContentStyle, mainPadding } = layoutCalculations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 w-full">
      <div className="flex h-screen w-full relative">
        {/* Enhanced Sidebar - Bütün ekranlarda overlay */}
        {showSidebar && sidebarOpen && (
          <div className="fixed inset-0 z-50">
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
                variant="overlay"
                width={sidebarWidth}
              />
            </div>
          </div>
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