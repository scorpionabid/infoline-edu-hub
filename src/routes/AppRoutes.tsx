import React, { useEffect, useCallback, useState, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from "@/hooks/auth/useAuthStore";
import { usePermissions } from "@/hooks/auth/usePermissions";
import AccessDenied from "@/components/AccessDenied";
import { UnifiedLayout } from "@/components/layout/unified";
import LoadingScreen from "@/components/auth/LoadingScreen";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterSuccess from "@/pages/RegisterSuccess";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Sectors from "@/pages/Sectors";
import Regions from "@/pages/Regions";
import Schools from "@/pages/Schools";
import Categories from "@/pages/Categories";
import Columns from "@/pages/Columns";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import DataEntry from "@/pages/DataEntry";
import SchoolAdminDataEntry from "@/components/dataEntry/SchoolAdminDataEntry";
import Profile from "@/pages/Profile";
import Statistics from "@/pages/Statistics";
import ProgressTracking from "@/pages/ProgressTracking";
import Performance from "@/pages/Performance";
import DataManagement from "@/pages/DataManagement";

import { UserRole } from "@/types/auth";

// Simplified loading state management
const useLoadingState = () => {
  const isAuthLoading = useAuthStore(selectIsLoading);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const initialized = useAuthStore(state => state.initialized);
  
  // Simple one-time initialization
  useEffect(() => {
    if (!initialized && !isAuthLoading) {
      console.log('🔄 [Routes] Triggering simple auth initialization');
      useAuthStore.getState().initializeAuth();
    }
  }, [initialized, isAuthLoading]);
  
  return {
    isLoading: !initialized || isAuthLoading,
    isAuthenticated,
    initialized
  };
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectUrl?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectUrl = "/login" 
}) => {
  const { isLoading, isAuthenticated } = useLoadingState();
  const { hasRole } = usePermissions();
  const location = useLocation();
  
  // Memoize logging to prevent excessive console output
  const logAuthState = useMemo(() => {
    const authState = useAuthStore.getState();
    return {
      user: authState.user ? { id: authState.user.id, role: authState.user.role, email: authState.user.email } : null,
      session: authState.session ? 'exists' : 'null',
      initialized: authState.initialized,
      error: authState.error
    };
  }, []);
  
  console.log('[ProtectedRoute] Enhanced State:', { 
    isAuthenticated, 
    isLoading, 
    pathname: location.pathname,
    allowedRoles,
    authState: logAuthState
  });
  
  // Scroll to top on route change - memoized
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToTop();
  }, [location.pathname, scrollToTop]);
  
  // Show loading screen while authentication is being determined
  if (isLoading) {
    console.log('[ProtectedRoute] Showing enhanced loading screen');
    return <LoadingScreen message="Sistem yüklənir..." progress={true} />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }
  
  // Check role permissions
  if (allowedRoles && !hasRole(allowedRoles)) {
    console.log('[ProtectedRoute] Access denied - insufficient role');
    return <AccessDenied />;
  }
  
  console.log('[ProtectedRoute] Access granted, rendering children');
  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, restricted = false }) => {
  const { isLoading, isAuthenticated } = useLoadingState();
  const location = useLocation();
  
  console.log('[PublicRoute] State:', { isAuthenticated, isLoading, restricted, pathname: location.pathname });
  
  // Scroll to top on route change - memoized
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToTop();
  }, [location.pathname, scrollToTop]);
  
  // Show loading while auth state is being determined
  if (isLoading) {
    return <LoadingScreen message="Yüklənir..." />;
  }
  
  // Redirect authenticated users away from restricted routes
  if (isAuthenticated && restricted) {
    const from = location.state?.from?.pathname || "/dashboard";
    console.log('[PublicRoute] Authenticated user on restricted route, redirecting to:', from);
    return <Navigate to={from} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={
      <PublicRoute restricted>
        <Login />
      </PublicRoute>
    } />
    
    <Route path="/register" element={
      <PublicRoute restricted>
        <Register />
      </PublicRoute>
    } />
    
    <Route path="/register-success" element={
      <PublicRoute restricted>
        <RegisterSuccess />
      </PublicRoute>
    } />
    
    <Route path="/forgot-password" element={
      <PublicRoute restricted>
        <ForgotPassword />
      </PublicRoute>
    } />
    
    <Route path="/reset-password" element={
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    } />

    {/* Protected Routes with UnifiedLayout */}
    <Route element={
      <ProtectedRoute>
        <UnifiedLayout />
      </ProtectedRoute>
    }>
      {/* Dashboard və digər səhifələr */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      <Route path="/sectors" element={<Sectors />} />
      
      <Route path="/regions" element={<Regions />} />
      
      <Route path="/schools" element={<Schools />} />
      
      <Route path="/categories" element={<Categories />} />
      
      <Route path="/categories/:id" element={<Categories />} />
      
      <Route path="/columns" element={<Columns />} />
      
      <Route path="/columns/:id" element={<Columns />} />
      
      <Route path="/users" element={<Users />} />
      
      <Route path="/reports" element={<Reports />} />
      
      <Route path="/settings" element={<Settings />} />
      
      <Route path="/profile" element={<Profile />} />
      
      {/* Köhnə route-ların yönləndirilməsi */}
      <Route path="/data-entry" element={<Navigate to="/data-management" replace />} />
      <Route path="/data-entry/:categoryId" element={<Navigate to="/data-management" replace />} />
      <Route path="/data-entry/:categoryId/:schoolId" element={<Navigate to="/data-management" replace />} />
      <Route path="/sector-data-entry" element={<Navigate to="/data-management" replace />} />
      <Route path="/approvals" element={<Navigate to="/data-management" replace />} />
      <Route path="/column-approvals" element={<Navigate to="/data-management" replace />} />

      {/* Məktəb admini məlumat daxil etmə route-u */}
      <Route 
        path="/school-data-entry" 
        element={
          <ProtectedRoute allowedRoles={['schooladmin']}>
            <SchoolAdminDataEntry />
          </ProtectedRoute>
        } 
      />
      
      {/* Statistics - Region və Sektor adminləri üçün */}
      <Route 
        path="/statistics" 
        element={
          <ProtectedRoute allowedRoles={['regionadmin', 'sectoradmin']}>
            <Statistics />
          </ProtectedRoute>
        } 
      />
      
      {/* Progress Tracking - Region və Sektor adminləri üçün */}
      <Route 
        path="/progress" 
        element={
          <ProtectedRoute allowedRoles={['regionadmin', 'sectoradmin']}>
            <ProgressTracking />
          </ProtectedRoute>
        } 
      />
      
      {/* Performance - SuperAdmin üçün */}
      <Route 
        path="/performance" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Performance />
          </ProtectedRoute>
        } 
      />
      
      {/* Advanced User Management - SuperAdmin üçün */}
      <Route 
        path="/user-management" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Users />
          </ProtectedRoute>
        } 
      />
      
      {/* Unified Data Management - Region və Sektor adminləri üçün */}
      <Route 
        path="/data-management" 
        element={
          <ProtectedRoute allowedRoles={['regionadmin', 'sectoradmin']}>
            <DataManagement />
          </ProtectedRoute>
        } 
      />
    </Route>
    
    {/* Default Routes */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export { AppRoutes, ProtectedRoute, PublicRoute };
export default AppRoutes;