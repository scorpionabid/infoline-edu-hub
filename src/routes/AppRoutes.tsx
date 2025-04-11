
import React from 'react';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import SchoolAdminDashboard from '@/pages/SchoolAdminDashboard';
import Categories from '@/pages/Categories';
import Columns from '@/pages/Columns';
import Schools from '@/pages/Schools';
import Regions from '@/pages/Regions';
import Sectors from '@/pages/Sectors';
import Users from '@/pages/Users';
import DataEntry from '@/pages/DataEntry';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AccessDenied from '@/components/AccessDenied';

interface AppRoute {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  requiredRoles?: string[];
}

export const AppRoutes: AppRoute[] = [
  {
    path: '/login',
    element: <Login />,
    protected: false
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    protected: false
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    protected: false
  },
  {
    path: '/',
    element: <Dashboard />,
    protected: true
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    protected: true
  },
  {
    path: '/school-dashboard',
    element: <SchoolAdminDashboard />,
    protected: true,
    requiredRoles: ['schooladmin']
  },
  {
    path: '/categories',
    element: <Categories />,
    protected: true
  },
  {
    path: '/columns',
    element: <Columns />,
    protected: true
  },
  {
    path: '/schools',
    element: <Schools />,
    protected: true
  },
  {
    path: '/regions',
    element: <Regions />,
    protected: true,
    requiredRoles: ['superadmin', 'regionadmin']
  },
  {
    path: '/sectors',
    element: <Sectors />,
    protected: true,
    requiredRoles: ['superadmin', 'regionadmin', 'sectoradmin']
  },
  {
    path: '/users',
    element: <Users />,
    protected: true,
    requiredRoles: ['superadmin', 'regionadmin', 'sectoradmin']
  },
  {
    path: '/data-entry',
    element: <DataEntry />,
    protected: true
  },
  {
    path: '/data-entry/:formId',
    element: <DataEntry />,
    protected: true
  },
  {
    path: '/reports',
    element: <Reports />,
    protected: true
  },
  {
    path: '/settings',
    element: <Settings />,
    protected: true
  },
  {
    path: '/access-denied',
    element: <AccessDenied />,
    protected: false
  },
  {
    path: '*',
    element: <NotFound />,
    protected: false
  }
];
