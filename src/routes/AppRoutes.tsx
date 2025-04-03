import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth, useRole } from "@/context/AuthContext";

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
import Index from "@/pages/Index";
import Debug from "@/pages/Debug";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Protected Route Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Authenticate olmayan istifadəçiləri login səhifəsinə yönləndir və cari yolu saxla
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Əgər allowedRoles varsa və istifadəçinin rolu bu siyahıda deyilsə
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log(`İstifadəçi '${user.role}' roluna malikdir amma '${allowedRoles.join(', ')}' rolları tələb olunur`);
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute: React.FC<PublicRouteProps> = ({ children, restricted = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Əgər istifadəçi daxil olubsa və route məhdudlaşdırılıbsa (məs. login səhifəsi), dashboard-a yönləndir
  if (isAuthenticated && restricted) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Route konfigurasyonları
const AppRoutes = () => (
  <Routes>
    <Route 
      path="/login" 
      element={
        <PublicRoute restricted>
          <Login />
        </PublicRoute>
      }
    />
    <Route 
      path="/register" 
      element={
        <PublicRoute restricted>
          <Register />
        </PublicRoute>
      }
    />
    <Route 
      path="/register-success" 
      element={
        <PublicRoute restricted>
          <RegisterSuccess />
        </PublicRoute>
      }
    />
    <Route 
      path="/forgot-password" 
      element={
        <PublicRoute restricted>
          <ForgotPassword />
        </PublicRoute>
      }
    />
    <Route 
      path="/reset-password" 
      element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      }
    />
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/sectors" 
      element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <Sectors />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/regions" 
      element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <Regions />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/schools" 
      element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin']}>
          <Schools />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/categories" 
      element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <Categories />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/columns" 
      element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <Columns />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/users" 
      element={
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <Users />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/reports" 
      element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/settings" 
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/profile" 
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/debug" 
      element={
        <ProtectedRoute>
          <Debug />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/data-entry" 
      element={
        <ProtectedRoute>
          <DataEntry />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/" 
      element={
        <PublicRoute>
          <Index />
        </PublicRoute>
      }
    />
    <Route 
      path="*" 
      element={<NotFound />}
    />
  </Routes>
);

export { AppRoutes, ProtectedRoute, PublicRoute };
