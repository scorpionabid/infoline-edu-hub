
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';
import { usePermissions } from '@/hooks/auth/usePermissions';

const Login = () => {
  const { user, loading, isAuthenticated, error, clearError } = useAuth();
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
    
    // İstifadəçi autentifikasiya olubsa dashboard'a yönləndirək
    if (isAuthenticated && user && !loading) {
      console.log(`Redirecting authenticated user to ${from}`, {
        role: userRole || user.role || 'unknown'
      });
      
      // Yönləndirilməni gecikdirək ki, session məlumatları tam yüklənsin
      const redirectTimer = setTimeout(() => {
        navigate(from, { replace: true });
      }, 300);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, loading, navigate, from, user, userRole]);

  // Yüklənmə zamanı LoadingScreen göstərək
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
