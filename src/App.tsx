import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore, shouldAuthenticate } from '@/hooks/auth/useAuthStore';
import SidebarLayout from '@/components/layout/SidebarLayout';
import LoginPage from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Regions from '@/pages/Regions';
import Sectors from '@/pages/Sectors';
import Schools from '@/pages/Schools';
import Users from '@/pages/Users';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession, isAuthenticated, isLoading } = useAuthStore();
  
  // Run once on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[App] Initializing authentication...');
      await refreshSession();
    };
    
    initializeAuth();
  }, [refreshSession]);

  // Handle route protection
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Define protected routes
    const protectedRoutes = ['/dashboard', '/regions', '/sectors', '/schools', '/users', '/settings', '/profile'];
    
    // Check if the current route is protected
    const isProtected = protectedRoutes.some(route => currentPath.startsWith(route));
    
    if (isProtected && shouldAuthenticate(isAuthenticated, isLoading)) {
      console.log('[App] Protected route detected, redirecting to login');
      navigate('/login', { state: { from: location } });
    }
  }, [location, navigate, isAuthenticated, isLoading]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes with Sidebar Layout */}
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/sectors" element={<Sectors />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          {/* Default route */}
          <Route path="/" element={<Dashboard />} />
        </Route>
        
        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
