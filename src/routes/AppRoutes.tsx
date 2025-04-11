
import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import SchoolsPage from '@/pages/SchoolsPage';
import LoginPage from '@/pages/LoginPage';
import RegionsPage from '@/pages/RegionsPage';
import SectorsPage from '@/pages/SectorsPage';
import CategoriesPage from '@/pages/CategoriesPage';
import UsersPage from '@/pages/UsersPage';
import DataEntryPage from '@/pages/DataEntryPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import AccessDenied from '@/components/AccessDenied';
import ProtectedRoute from './ProtectedRoute';

// Marşrut konfiqurasiyaları
interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

// Əsas marşrutlar - bütün istifadəçilərin giriş edə bildiyi səhifələr
export const AppRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/access-denied',
    element: <AccessDenied />
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute element={<Dashboard />} />
  },
  {
    path: '/schools',
    element: <ProtectedRoute element={<SchoolsPage />} />
  },
  {
    path: '/regions',
    element: <ProtectedRoute 
      element={<RegionsPage />} 
      requiredRoles={['superadmin']} 
    />
  },
  {
    path: '/sectors',
    element: <ProtectedRoute 
      element={<SectorsPage />} 
      requiredRoles={['superadmin', 'regionadmin']} 
    />
  },
  {
    path: '/categories',
    element: <ProtectedRoute 
      element={<CategoriesPage />} 
      requiredRoles={['superadmin', 'regionadmin']} 
    />
  },
  {
    path: '/users',
    element: <ProtectedRoute 
      element={<UsersPage />} 
      requiredRoles={['superadmin', 'regionadmin', 'sectoradmin']} 
    />
  },
  {
    path: '/data-entry',
    element: <ProtectedRoute 
      element={<DataEntryPage />} 
    />
  },
  {
    path: '/data-entry/:id',
    element: <ProtectedRoute 
      element={<DataEntryPage />} 
    />
  },
  {
    path: '/reports',
    element: <ProtectedRoute 
      element={<ReportsPage />} 
    />
  },
  {
    path: '/settings',
    element: <ProtectedRoute 
      element={<SettingsPage />} 
    />
  },
  // İstənilən naməlum yol Dashboard səhifəsinə yönləndirilir
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
];
