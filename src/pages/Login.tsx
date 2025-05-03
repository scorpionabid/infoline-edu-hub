
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';
import { usePermissions } from '@/hooks/auth/usePermissions';

const Login = () => {
  const { isAuthenticated, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const { userRole } = usePermissions();
  
  useEffect(() => {
    console.log('Login page state:', {
      isAuthenticated,
      loading,
      userRole,
      error,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role || 'unknown'
      } : null
    });
    
    // Autentifikasiya olunmuş istifadəçiləri dashboard-a yönləndirmək
    if (isAuthenticated && user && !loading) {
      console.log(`Redirecting authenticated user to ${from}`, {
        role: userRole || user.role || 'unknown'
      });
      
      // Yönləndirmə vaxtını 100ms gecikdirək - bu sessiya məlumatlarının tam yüklənməsi üçündür
      const redirectTimer = setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, loading, navigate, from, user, userRole]);

  // Loading vəziyyətində yüklənmə göstəricisi
  if (loading) {
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
