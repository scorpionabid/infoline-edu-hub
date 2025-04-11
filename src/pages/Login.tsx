
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoadingScreen from '@/components/auth/LoadingScreen';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import { usePermissions } from '@/hooks/auth/usePermissions';

const Login = () => {
  const { isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const { userRole } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Daxil olmuş istifadəçini rol əsasında yönləndirmə
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      // Sonuncu ziyarət edilmiş səhifə və ya rol əsasında yönləndirmə
      const from = location.state?.from?.pathname || '/dashboard';
      console.log(`İstifadəçi auth olundu, "${from}" səhifəsinə yönləndirilir`);
      console.log(`İstifadəçi rolu: ${userRole}`);
      
      // Rol-əsasında əsas dashboard səhifəsinə yönləndirmək də mümkündür
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location, user, userRole]);

  // Yüklənmə zamanı göstəriləcək
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
