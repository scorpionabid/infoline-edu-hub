
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';
import { usePermissions } from '@/hooks/auth/usePermissions';

const Login = () => {
  const { user, isLoading, isAuthenticated, error, clearError } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
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
    
    // İstifadəçi autentifikasiya olubsa və məlumatlar yüklənibsə dashboard'a yönləndirək
    if (isAuthenticated && user && !isLoading && !redirecting) {
      console.log(`Redirecting authenticated user to ${from}`, {
        role: userRole || user.role || 'unknown'
      });
      
      setRedirecting(true);
      
      // Yönləndirilməni gecikdirək ki, session məlumatları tam yüklənsin
      const redirectTimer = setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, navigate, from, user, userRole, redirecting, error]);

  // Yüklənmə zamanı LoadingScreen göstərək, amma autentifikasiya zamanı göstərməyək
  // Bu səbəbdən isLoading && !user kombinasiyasını istifadə edirik
  if (isLoading && !user) {
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
