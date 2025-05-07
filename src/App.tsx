
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppQueryProvider } from '@/context/QueryClientProvider';

// Layout components
import DefaultLayout from '@/layouts/DefaultLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Auth pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';

// Main pages
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Categories from '@/pages/Categories';
import Columns from '@/pages/Columns';
import Schools from '@/pages/Schools';
import Regions from '@/pages/Regions';
import Sectors from '@/pages/Sectors';
import Users from '@/pages/Users';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Forms from '@/pages/Forms';
import Approvals from '@/pages/Approvals';
import NotFound from '@/pages/NotFound';

const App = () => {
  return (
    <AppQueryProvider>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/columns" element={<Columns />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/regions" element={<Regions />} />
            <Route path="/sectors" element={<Sectors />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/forms" element={<Forms />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </AppQueryProvider>
  );
};

export default App;
