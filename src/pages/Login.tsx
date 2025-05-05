
import React, { useEffect, useState } from 'react';
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
  
  // İndi olduğumuzu izləmək üçün bir state
  const [isCurrentRoute, setIsCurrentRoute] = useState(true);
  
  // Naviqasiya və yerləşmə
  const navigate = useNavigate();
  const location = useLocation();
  // Son yönləndirilmə path-ni yadda saxla
  const from = location.state?.from?.pathname || '/dashboard';
  
  // İstifadəçi autentifikasiya olduqda yönləndirmə
  useEffect(() => {
    // Yalnız biz hələ bu routedayıqsa redirect edirik
    if (!isCurrentRoute) return;
    
    // Əgər yüklənmə davam edirsə, gözləyirik
    if (isLoading) {
      return;
    }
    
    // İstifadəçi artıq autentifikasiya olunubsa, dashboard-a yönləndirilir
    if (isAuthenticated && user?.id) {
      console.log('İstifadəçi giriş edib, dashboard-a yönləndirilir');
      // Mənfi millisaniyə (neqativ timeout) vasitəsilə render loop qarşısını alırıq
      // Bu üsul browser-in rendering engine-nə vaxt verir
      setTimeout(() => {
        setIsCurrentRoute(false);
        navigate(from, { replace: true });
      }, 0);
    }
  }, [isAuthenticated, isLoading, navigate, from, user, isCurrentRoute]);

  // Component unmount olduqda state update etməyək
  useEffect(() => {
    return () => {
      setIsCurrentRoute(false);
    };
  }, []);

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
