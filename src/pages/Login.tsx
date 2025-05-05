
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
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Debug məlumatları
  useEffect(() => {
    console.log('Login səhifəsi vəziyyəti:', { 
      isAuthenticated, 
      isLoading, 
      userExists: !!user,
      userRole: user?.role || 'undefined',
      redirectAttempted
    });
  }, [isAuthenticated, isLoading, user, redirectAttempted]);
  
  // İstifadəçi autentifikasiya olduqda yönləndirmə
  useEffect(() => {
    // Əgər hələ yüklənmə prosesindədirsə, çıxırıq
    if (isLoading) {
      console.log('Loading state active, waiting...');
      return;
    }
    
    // İstifadəçi artıq autentifikasiya olunubsa və user məlumatları varsa, dashboard-a yönləndiririk
    if (isAuthenticated && user && user.role && !redirectAttempted) {
      console.log(`İstifadəçi autentifikasiya olunub, rolu: ${user.role}, yönləndirilir: ${from}`);
      setRedirectAttempted(true); // Yönləndirməni bir dəfə izləyirik
      
      // Bir qısa gecikmə əlavə edirik ki, istifadəçi məlumatları tam yüklənsin
      const redirectTimer = setTimeout(() => {
        navigate(from, { replace: true });
      }, 300);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, navigate, from, user, redirectAttempted]);

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
