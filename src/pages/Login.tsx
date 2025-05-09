
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser } from '@/hooks/auth/useAuthStore';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';

/**
 * Login səhifəsi - istifadəçi autentifikasiyasını idarə edir
 */
const Login = () => {
  // Use selectors for more efficient state access
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const { error, clearError } = useAuthStore();
  
  // Navigation state
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect target
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Handle successful authentication
  const handleSuccessfulAuth = useCallback(() => {
    navigate(from, { replace: true });
  }, [navigate, from]);
  
  // Redirect when authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.id) {
      console.log('İstifadəçi giriş edib, dashboard-a yönləndirilir');
      handleSuccessfulAuth();
    }
  }, [isAuthenticated, isLoading, user?.id, handleSuccessfulAuth]);

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Yüklənir, zəhmət olmasa gözləyin..." />;
  }

  return (
    <LoginContainer>
      <LoginHeader />
      <LoginForm error={error} clearError={clearError} />
    </LoginContainer>
  );
};

export default Login;
