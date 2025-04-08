
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoadingScreen from '@/components/auth/LoadingScreen';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';

const Login = () => {
  const { isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Daxil olmuş istifadəçini yönləndirmə
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log(`İstifadəçi auth olundu, "${from}" səhifəsinə yönləndirilir`);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

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
