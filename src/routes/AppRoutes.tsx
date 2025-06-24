
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@/hooks/auth/useAuthStore';

// Auth Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Protected Pages
import Dashboard from '@/pages/Dashboard';
import DataEntry from '@/pages/DataEntry';
import SectorDataEntry from '@/pages/SectorDataEntry';
import Approvals from '@/pages/Approvals';
import ColumnApprovals from '@/pages/ColumnApprovals';
import Categories from '@/pages/Categories';
import Columns from '@/pages/Columns';
import Users from '@/pages/Users';
import Schools from '@/pages/Schools';
import Sectors from '@/pages/Sectors';
import Regions from '@/pages/Regions';
import Reports from '@/pages/Reports';
import Statistics from '@/pages/Statistics';
import Settings from '@/pages/Settings';
import Performance from '@/pages/Performance';
import Progress from '@/pages/Progress';
import UserManagement from '@/pages/UserManagement';
import SchoolDataEntry from '@/pages/SchoolDataEntry';

// Layout and Protection
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SidebarLayout from '@/components/layout/SidebarLayout';
import LoadingScreen from '@/components/auth/LoadingScreen';

const AppRoutes = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);

  if (isLoading) {
    return <LoadingScreen message="Yüklənir..." />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
      } />
      <Route path="/forgot-password" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
      } />
      <Route path="/reset-password" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <SidebarLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="data-entry" element={<DataEntry />} />
        <Route path="school-data-entry" element={<SchoolDataEntry />} />
        <Route path="sector-data-entry" element={<SectorDataEntry />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="column-approvals" element={<ColumnApprovals />} />
        <Route path="categories" element={<Categories />} />
        <Route path="columns" element={<Columns />} />
        <Route path="users" element={<Users />} />
        <Route path="schools" element={<Schools />} />
        <Route path="sectors" element={<Sectors />} />
        <Route path="regions" element={<Regions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="performance" element={<Performance />} />
        <Route path="progress" element={<Progress />} />
        <Route path="user-management" element={<UserManagement />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
