
import React, { useEffect, useState } from 'react';
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
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const { error, clearError } = useAuthStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Daha effektiv yoxlama üçün göstəricilər
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  
  // Authentication state effect - sonsuz dövrləri aradan qaldırılmış versiya
  useEffect(() => {
    // Əgər istifadəçi artıq yönləndirilmirsə və autentifikasiya olunubsa
    if (!redirectInProgress && !isLoading && isAuthenticated && user?.id) {
      console.log('[Login.tsx] İstifadəçi giriş edib, yönləndiriliyor:', from);
      
      // Yönləndirməni başladıb göstəricini təyin edirik
      setRedirectInProgress(true);
      
      // Timeout ilə yönləndirmə sürətini azaltırıq ki, state update-lər gedə bilsin
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, isLoading, user, from, navigate, redirectInProgress]);

  // Show loading state when auth is being checked
  if (isLoading) {
    return <LoadingScreen message="Yüklənir, zəhmət olmasa gözləyin..." />;
  }

  // Əgər istifadəçi artıq daxil olubsa, login səhifəsindən çıxarırıq
  if (isAuthenticated && user) {
    return <LoadingScreen message="Yönləndiriliyor..." />;
  }

  // When not authenticated, show login form
  return (
    <LoginContainer>
      <LoginHeader />
      <LoginForm error={error} clearError={clearError} />
    </LoginContainer>
  );
};

export default Login;
