
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from "@/hooks/auth/useAuthStore";
import { usePermissions } from "@/hooks/auth/usePermissions";
import AccessDenied from "@/components/AccessDenied";
import SidebarLayout from "@/components/layout/SidebarLayout";
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
import SectorDataEntry from "@/pages/SectorDataEntry";
import SchoolAdminDataEntry from "@/components/dataEntry/SchoolAdminDataEntry";
import Profile from "@/pages/Profile";
import ApprovalPage from "@/pages/Approval";
import Statistics from "@/pages/Statistics";
import ProgressTracking from "@/pages/ProgressTracking";
import Performance from "@/pages/Performance";
import UserManagement from "@/pages/UserManagement";

import { UserRole } from "@/types/supabase";

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
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const { hasRole } = usePermissions();
  const location = useLocation();
  
  console.log('[ProtectedRoute] State:', { 
    isAuthenticated, 
    isLoading, 
    pathname: location.pathname,
    allowedRoles,
    authStoreState: {
      user: useAuthStore.getState().user ? 'exists' : 'null',
      session: useAuthStore.getState().session ? 'exists' : 'null',
      initialized: useAuthStore.getState().initialized
    }
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  if (isLoading) {
    console.log('[ProtectedRoute] Showing loading screen - isLoading is true');
    return <LoadingScreen message="Zəhmət olmasa gözləyin..." />;
  }
  
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }
  
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
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const location = useLocation();
  
  console.log('[PublicRoute] State:', { isAuthenticated, isLoading, restricted, pathname: location.pathname });
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  if (isLoading) {
    return <LoadingScreen message="Zəhmət olmasa gözləyin..." />;
  }
  
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

    {/* Protected Routes with SidebarLayout */}
    <Route element={
      <ProtectedRoute>
        <SidebarLayout />
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
      
      <Route path="/approvals" element={<ApprovalPage />} />
      
      {/* ✅ YENİ: Ayrı məlumat daxil etmə route-ları */}
      <Route path="/data-entry" element={<DataEntry />} />
      <Route path="/data-entry/:categoryId" element={<DataEntry />} />
      <Route path="/data-entry/:categoryId/:schoolId" element={<DataEntry />} />

      {/* ✅ YENİ: Məktəb admini məlumat daxil etmə route-u */}
      <Route 
        path="/school-data-entry" 
        element={
          <ProtectedRoute allowedRoles={['schooladmin']}>
            <SchoolAdminDataEntry />
          </ProtectedRoute>
        } 
      />
      
      {/* ✅ YENİ: Sektor məlumat daxil etmə - yalnız sektor adminləri üçün */}
      <Route 
        path="/sector-data-entry" 
        element={
          <ProtectedRoute allowedRoles={['sectoradmin']}>
            <SectorDataEntry />
          </ProtectedRoute>
        } 
      />
      
      {/* ✅ YENİ: Statistics - Region və Sektor adminləri üçün */}
      <Route 
        path="/statistics" 
        element={
          <ProtectedRoute allowedRoles={['regionadmin', 'sectoradmin']}>
            <Statistics />
          </ProtectedRoute>
        } 
      />
      
      {/* ✅ YENİ: Progress Tracking - Region və Sektor adminləri üçün */}
      <Route 
        path="/progress" 
        element={
          <ProtectedRoute allowedRoles={['regionadmin', 'sectoradmin']}>
            <ProgressTracking />
          </ProtectedRoute>
        } 
      />
      
      {/* ✅ YENİ: Performance - SuperAdmin üçün */}
      <Route 
        path="/performance" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Performance />
          </ProtectedRoute>
        } 
      />
      
      {/* ✅ YENİ: Advanced User Management - SuperAdmin üçün */}
      <Route 
        path="/user-management" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <UserManagement />
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
