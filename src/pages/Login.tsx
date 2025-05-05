
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';

/**
 * Login səhifəsi - istifadəçi autentifikasiyasını idarə edir
 */
const Login = () => {
  // Global auth state
  const { user, session, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  // Naviqasiya və yerləşmə
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  
  // İstifadəçi autentifikasiya olduqda yönləndirmə
  useEffect(() => {
    // Əgər yüklənmə davam edirsə, gözləyirik
    if (isLoading) {
      return;
    }
    
    // İstifadəçi artıq autentifikasiya olunubsa, dashboard-a yönləndirilir
    if (isAuthenticated && user?.id) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from, user]);

  // Loading vəziyyətində yüklənmə göstəricisi
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
