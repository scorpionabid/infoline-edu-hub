
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser } from '@/hooks/auth/useAuthStore';
import { useStableCallback } from '@/utils/memoizationUtils';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';

/**
 * Login səhifəsi - istifadəçi autentifikasiyasını idarə edir
 */
const Login = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const { error, clearError } = useAuthStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Using stable callback to avoid dependency issues
  const handleSuccessfulAuth = useStableCallback(() => {
    if (isAuthenticated && user?.id) {
      console.log('İstifadəçi giriş edib, yönləndiriliyor:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user?.id, from, navigate]);
  
  // Only redirect when auth state changes to prevent multiple redirects
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.id) {
      handleSuccessfulAuth();
    }
  }, [isAuthenticated, isLoading, user?.id, handleSuccessfulAuth]);

  // Show loading state when auth is being checked
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
