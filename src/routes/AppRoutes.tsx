
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Login from "@/pages/Login";
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// App Router Component
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes */}
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
          <ProtectedRoute>
            <Sectors />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/regions" 
        element={
          <ProtectedRoute>
            <Regions />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/schools" 
        element={
          <ProtectedRoute>
            <Schools />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/categories" 
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/columns" 
        element={
          <ProtectedRoute>
            <Columns />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
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
        path="/data-entry" 
        element={
          <ProtectedRoute>
            <DataEntry />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect root to dashboard if authenticated, otherwise to login */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <Navigate to="/login" replace />
        } 
      />
      
      {/* Catch all route - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export { AppRoutes, ProtectedRoute, PublicRoute };
