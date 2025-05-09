
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
import Profile from "@/pages/Profile";
import Approvals from "@/pages/Approval";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectUrl?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectUrl = "/login" 
}) => {
  // Use selectors for more efficient state access
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const { hasRole } = usePermissions();
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Show loading screen while auth state is being determined
  if (isLoading) {
    return <LoadingScreen message="Zəhmət olmasa gözləyin..." />;
  }
  
  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }
  
  // Check role-based access
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <AccessDenied />;
  }
  
  // Authenticated and authorized
  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, restricted = false }) => {
  // Use selectors for more efficient state access
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Show loading screen while auth state is being determined
  if (isLoading) {
    return <LoadingScreen message="Zəhmət olmasa gözləyin..." />;
  }
  
  // If authenticated and trying to access a restricted route (like login), redirect to dashboard
  if (isAuthenticated && restricted) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }
  
  // Not restricted or not authenticated
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
      
      <Route path="/sectors" element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <Sectors />
        </ProtectedRoute>
      } />
      
      <Route path="/regions" element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <Regions />
        </ProtectedRoute>
      } />
      
      <Route path="/schools" element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin']}>
          <Schools />
        </ProtectedRoute>
      } />
      
      <Route path="/categories" element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin']}>
          <Categories />
        </ProtectedRoute>
      } />
      
      <Route path="/categories/:id" element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <Categories />
        </ProtectedRoute>
      } />
      
      <Route path="/columns" element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <Columns />
        </ProtectedRoute>
      } />
      
      <Route path="/columns/:id" element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <Columns />
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin']}>
          <Users />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/approvals" element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin']}>
          <Approvals />
        </ProtectedRoute>
      } />
      
      <Route path="/data-entry" element={
        <ProtectedRoute allowedRoles={['superadmin', 'sectoradmin', 'schooladmin']}>
          <DataEntry />
        </ProtectedRoute>
      } />
      
      <Route path="/data-entry/:categoryId" element={
        <ProtectedRoute allowedRoles={['superadmin', 'sectoradmin', 'schooladmin']}>
          <DataEntry />
        </ProtectedRoute>
      } />
    </Route>
    
    {/* Default Routes */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export { AppRoutes, ProtectedRoute, PublicRoute };
