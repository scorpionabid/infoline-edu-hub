import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { usePermissions } from "@/hooks/auth/usePermissions";
import AccessDenied from "@/components/AccessDenied";
import SidebarLayout from "@/components/layout/SidebarLayout";

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
  const { isAuthenticated, isLoading, user } = useAuth();
  const { userRole } = usePermissions();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }
  
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, restricted = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isAuthenticated && restricted) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = [
  {
    path: "/login",
    element: (
      <PublicRoute restricted>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute restricted>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/register-success",
    element: (
      <PublicRoute restricted>
        <RegisterSuccess />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute restricted>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sectors",
    element: (
      <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
        <Sectors />
      </ProtectedRoute>
    ),
  },
  {
    path: "/regions",
    element: (
      <ProtectedRoute allowedRoles={['superadmin']}>
        <Regions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/schools",
    element: (
      <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin']}>
        <Schools />
      </ProtectedRoute>
    ),
  },
  {
    path: "/categories",
    element: (
      <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']}>
        <Categories />
      </ProtectedRoute>
    ),
  },
  {
    path: "/categories/:id",
    element: (
      <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
        <Categories />
      </ProtectedRoute>
    ),
  },
  {
    path: "/columns",
    element: (
      <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']}>
        <Columns />
      </ProtectedRoute>
    ),
  },
  {
    path: "/columns/:id",
    element: (
      <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
        <Columns />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin']}>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/data-entry",
    element: (
      <ProtectedRoute allowedRoles={['superadmin', 'sectoradmin', 'schooladmin']}>
        <SidebarLayout>
          <DataEntry />
        </SidebarLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/data-entry/:categoryId",
    element: (
      <ProtectedRoute allowedRoles={['superadmin', 'sectoradmin', 'schooladmin']}>
        <SidebarLayout>
          <DataEntry />
        </SidebarLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export { AppRoutes, ProtectedRoute, PublicRoute };
