
import React, { memo, Suspense } from 'react';
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

  if (isLoading) {
    return <LoadingIndicator size="lg" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>İstifadəçi məlumatları yüklənir...</p>
      </div>
    );
  }

  // Determine sidebar behavior based on screen size
  const shouldShowDesktopSidebar = isLaptop || isDesktop;
  const shouldShowOverlaySidebar = isMobile || isTablet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 w-full">
      <div className="flex h-screen w-full relative">
        {/* Enhanced Sidebar - Responsive variants */}
        {showSidebar && (
          <>
            {/* Desktop/Laptop sidebar - Always visible when screen is large enough */}
            {shouldShowDesktopSidebar && (
              <UnifiedSidebar 
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
                userName={user?.full_name || user?.email}
                variant={isLaptop ? "overlay" : "desktop"}
                width={sidebarWidth}
              />
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
          style={{
            marginLeft: shouldShowDesktopSidebar && sidebarOpen ? 0 : 0,
            minWidth: 0
          }}
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
            style={{ 
              padding: contentPadding,
              paddingBottom: isMobile ? '80px' : contentPadding,
              minWidth: 0
            }}
          >
            <div className={`w-full mx-auto animate-fade-in-up ${fullWidth ? 'max-w-none' : 'max-w-full'}`}>
              {/* Breadcrumb Navigation */}
              <BreadcrumbNav />
              
              {/* Page Content with Suspense */}
              <Suspense fallback={<LoadingIndicator />}>
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
  return (
    prevProps.showSidebar === nextProps.showSidebar &&
    prevProps.showHeader === nextProps.showHeader &&
    prevProps.fullWidth === nextProps.fullWidth &&
    prevProps.children === nextProps.children
  );
});

UnifiedLayout.displayName = 'UnifiedLayout';

export default UnifiedLayout;
