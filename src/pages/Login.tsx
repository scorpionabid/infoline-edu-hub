import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';
import { usePermissions } from '@/hooks/auth/usePermissions';

const Login = () => {
  const { isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const { userRole } = usePermissions();
  
  useEffect(() => {
    console.log('Login page state:', {
      isAuthenticated,
      isLoading,
      userRole,
      error,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role || 'unknown'
      } : null
    });
    
    // Autentifikasiya olunmuş istifadəçiləri dashboard-a yönləndirmək
    if (isAuthenticated && user && user.role && !isLoading) {
      console.log(`Authenticated user with role: ${user.role}, preparing redirection`);
      
      // İstifadəçi roluna əsasən hədəf səhifəni müəyyən edirik
      let targetPath = '/dashboard';
      
      // Əlavə debug məlumatı
      console.log(`User role for redirection: ${user.role}, session active`);
      
      // Yönləndirmə vaxtını 500ms gecikdirək - bu sessiya məlumatlarının tam yüklənməsi üçündür
      const redirectTimer = setTimeout(() => {
        console.log(`Redirecting user with role ${user.role} to ${targetPath}`);
        navigate(targetPath, { replace: true });
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, navigate, from, user, userRole]);

  // Loading vəziyyətində yüklənmə göstəricisi
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <LoginContainer>
      <LoginHeader />
      <LoginForm error={error} clearError={clearError} />
    </LoginContainer>
  );
};

export default Login;
