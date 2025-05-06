
import React, { useState, useEffect, useCallback } from 'react';
import {
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import Login from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import ProfilePage from '@/pages/Profile';
import SettingsPage from '@/pages/Settings';
import RegionsPage from '@/pages/Regions';
import SectorsPage from '@/pages/Sectors';
import SchoolsPage from '@/pages/Schools';
import UsersPage from '@/pages/Users';
import CategoriesPage from '@/pages/Categories';
import ColumnsPage from '@/pages/Columns';
import ApprovalsPage from '@/pages/Approvals';
import ReportsPage from '@/pages/Reports';
import StatisticsPage from '@/pages/Statistics';
import SidebarLayout from '@/components/layout/SidebarLayout';
import RequireRole from '@/components/auth/RequireRole';
import NotFound from '@/pages/NotFound';
import DataEntryPage from '@/pages/DataEntryPage';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();

  const handleOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [handleOnlineStatus]);
  
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login />
          } 
        />
        <Route path="/404" element={<NotFound />} />
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        
        {/* Protected routes - SidebarLayout artıq autentifikasiya yoxlaması edir */}
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Data entry routes */}
          <Route path="/data-entry" element={<DataEntryPage />} />
          <Route path="/data-entry/:categoryId" element={<DataEntryPage />} />
          
          {/* SuperAdmin routes */}
          <Route path="/regions" element={
            <RequireRole roles={['superadmin']}>
              <RegionsPage />
            </RequireRole>
          } />
          <Route path="/sectors" element={
            <RequireRole roles={['superadmin', 'regionadmin']}>
              <SectorsPage />
            </RequireRole>
          } />
          <Route path="/schools" element={
            <RequireRole roles={['superadmin', 'regionadmin', 'sectoradmin']}>
              <SchoolsPage />
            </RequireRole>
          } />
          <Route path="/users" element={
            <RequireRole roles={['superadmin', 'regionadmin', 'sectoradmin']}>
              <UsersPage />
            </RequireRole>
          } />
          <Route path="/categories" element={
            <RequireRole roles={['superadmin', 'regionadmin']}>
              <CategoriesPage />
            </RequireRole>
          } />
          <Route path="/categories/:id" element={
            <RequireRole roles={['superadmin', 'regionadmin']}>
              <CategoriesPage />
            </RequireRole>
          } />
          <Route path="/columns" element={
            <RequireRole roles={['superadmin', 'regionadmin']}>
              <ColumnsPage />
            </RequireRole>
          } />
          <Route path="/columns/:id" element={
            <RequireRole roles={['superadmin', 'regionadmin']}>
              <ColumnsPage />
            </RequireRole>
          } />
          <Route path="/approvals" element={
            <RequireRole roles={['sectoradmin', 'regionadmin']}>
              <ApprovalsPage />
            </RequireRole>
          } />
          <Route path="/reports" element={
            <RequireRole roles={['superadmin', 'regionadmin', 'sectoradmin']}>
              <ReportsPage />
            </RequireRole>
          } />
          <Route path="/statistics" element={
            <RequireRole roles={['superadmin', 'regionadmin', 'sectoradmin']}>
              <StatisticsPage />
            </RequireRole>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  );
};

export default App;
