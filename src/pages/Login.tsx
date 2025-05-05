
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
  
  // Debug məlumatları
  useEffect(() => {
    console.log('Login səhifəsi vəziyyəti:', { 
      isAuthenticated, 
      isLoading, 
      userExists: !!user,
      userRole: user?.role || 'undefined',
      sessionExists: !!session,
      fromPath: from
    });
  }, [isAuthenticated, isLoading, user, session, from]);
  
  // İstifadəçi autentifikasiya olduqda yönləndirmə
  useEffect(() => {
    if (isLoading) {
      console.log('Loading state active, waiting...');
      return;
    }
    
    // İstifadəçi artıq autentifikasiya olunubsa, dashboard-a yönləndirilir
    if (isAuthenticated && user?.id) {
      console.log(`İstifadəçi autentifikasiya olunub, rolu: ${user.role}, yönləndirilir: ${from}`);
      
      // Qısa gecikmə əlavə edirik amma daha optimal
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
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
