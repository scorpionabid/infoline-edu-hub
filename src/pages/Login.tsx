
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
  
  // Debug məlumatları
  useEffect(() => {
    console.log('Login səhifəsi vəziyyəti:', { 
      isAuthenticated, 
      isLoading, 
      userExists: !!user,
      userRole: user?.role || 'undefined',
    });
  }, [isAuthenticated, isLoading, user]);
  
  // İstifadəçi autentifikasiya olduqda yönləndirmə
  useEffect(() => {
    // Əgər hələ yüklənmə prosesindədirsə, çıxırıq
    if (isLoading) return;
    
    // İstifadəçi artıq autentifikasiya olunubsa və user məlumatları varsa, dashboard-a yönləndiririk
    if (isAuthenticated && user && user.role) {
      console.log(`İstifadəçi autentifikasiya olunub, rolu: ${user.role}, yönləndirilir: ${from}`);
      // Bir qısa gecikmə əlavə edirik ki, istifadəçi məlumatları tam yüklənsin
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, isLoading, navigate, from, user]);

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
