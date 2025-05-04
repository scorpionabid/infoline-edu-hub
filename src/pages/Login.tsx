
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';

const Login = () => {
  const { isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  
  // İstifadəçi autentifikasiya olduqda yönləndirmə
  useEffect(() => {
    // Əgər yönləndirmə artıq başlamışsa, çıxırıq
    if (redirectInProgress) return;
    
    // Əgər hələ yüklənmə prosesindədirsə, gözləyirik
    if (isLoading) return;

    // İstifadəçi artıq autentifikasiya olunubsa və user məlumatları varsa, dashboard-a yönləndiririk
    if (isAuthenticated && user?.role) {
      console.log(`User is authenticated with role: ${user.role}, redirecting to ${from}`);
      setRedirectInProgress(true);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from, user, redirectInProgress]);

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
