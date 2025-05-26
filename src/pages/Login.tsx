
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser } from '@/hooks/auth/useAuthStore';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';

const Login = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const { error, clearError } = useAuthStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  console.log('[Login] Render state:', { isAuthenticated, isLoading, user: !!user, error });

  // Autentifikasiya olunmuş istifadəçini dashboard-a yönləndir
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.id) {
      console.log('[Login] User authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, user, from, navigate]);

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Giriş yoxlanılır..." />;
  }

  // Artıq autentifikasiya olunubsa
  if (isAuthenticated && user) {
    return <LoadingScreen message="Yönləndiriliyor..." />;
  }

  // Login formu
  return (
    <LoginContainer>
      <LoginHeader />
      <LoginForm error={error} clearError={clearError} />
    </LoginContainer>
  );
};

export default Login;
