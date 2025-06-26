
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
  
  // Performance monitoring
  usePerformanceMonitor('UnifiedLayout');
  
  const {
    isMobile,
    isTablet,
    isDesktop,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    sidebarWidth,
    headerHeight,
    contentPadding,
    // sidebarVariant
  } = useResponsiveLayout();
  
  console.log('[UnifiedLayout] Render state:', { 
    user: !!user, 
    isLoading, 
    sidebarOpen,
    sidebarVariant,
    isMobile,
    isTablet,
    // isDesktop
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 w-full">
      <div className="flex h-screen w-full relative">
        {/* Unified Sidebar - Responsive variants */}
        {showSidebar && (
          <>
            {/* Desktop sidebar - Always visible */}
            {isDesktop && (
              <UnifiedSidebar 
                isOpen={true} // Always open on desktop
                onToggle={toggleSidebar}
                userName={user?.full_name || user?.email}
                variant="desktop"
                width={sidebarWidth}
              />
            )}

            {/* Mobile/Tablet overlay sidebar */}
            {(isMobile || isTablet) && (
              <div
                className={`
                  fixed inset-0 z-50 bg-black/50 transition-opacity duration-300
                  ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`
                    fixed left-0 top-0 h-full w-64 bg-card transform transition-transform duration-300
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  `}
                  onClick={(e) => e.stopPropagation()}
                >
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

        {/* Main content area */}
        <div 
          className="flex flex-col flex-1 w-full min-w-0 relative transition-all duration-300 ease-in-out"
          style={{
            marginLeft: isDesktop && sidebarOpen && showSidebar ? 0 : 0 // Sidebar handles its own width
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
          
          {/* Page content with responsive padding */}
          <main 
            className="flex-1 overflow-auto w-full relative"
            style={{ 
              padding: contentPadding,
              paddingBottom: isMobile ? '80px' : contentPadding // Space for mobile bottom nav
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

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}

      {/* Quick Actions FAB - shown on all devices */}
      <QuickActions />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.showSidebar === nextProps.showSidebar &&
    prevProps.showHeader === nextProps.showHeader &&
    prevProps.fullWidth === nextProps.fullWidth &&
    prevProps.children === nextProps.children
  );
});

UnifiedLayout.displayName = 'UnifiedLayout';

export default UnifiedLayout;
