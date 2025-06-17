
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser } from '@/hooks/auth/useAuthStore';
import SecureLoginForm from '@/components/auth/SecureLoginForm';
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

  // Secure login formu
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <LoginContainer>
      <LoginHeader />
      <SecureLoginForm error={errorMessage} clearError={clearError} />
    </LoginContainer>
  );
};

export default Login;
