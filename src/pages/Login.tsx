
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoadingScreen from '@/components/auth/LoadingScreen';
import { usePermissions } from '@/hooks/auth/usePermissions';

const Login = () => {
  const { isAuthenticated, isLoading, error, clearError, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const { userRole } = usePermissions();
  const [loginAttempt, setLoginAttempt] = useState(0);
  
  useEffect(() => {
    console.log('Login səhifəsi state:', {
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
    
    // Əgər istifadəçi autentifikasiya olunubsa
    if (isAuthenticated && !isLoading) {
      console.log(`Authenticated user with role: ${user?.role}, preparing redirection`);
      
      // Əgər istifadəçi məlumatları yoxdursa, onları əldə etmək üçün cəhd edirik
      if (!user?.role && loginAttempt < 3) {
        console.log('User profile data is missing, attempting to refresh...');
        setLoginAttempt(prev => prev + 1);
        
        // Profil məlumatlarını yeniləyirik
        const fetchProfile = async () => {
          try {
            const updatedUser = await refreshProfile();
            if (updatedUser && updatedUser.role) {
              // Profil məlumatları uğurla əldə edildikdən sonra istifadəçini yönləndiririk
              navigate(from, { replace: true });
            }
          } catch (err) {
            console.error('Error refreshing profile:', err);
          }
        };
        
        fetchProfile();
        return;
      }
      
      // Əgər profil məlumatları varsa və ya maksimum cəhd sayına çatmışıqsa
      // Yönləndirmə vaxtını 300ms gecikdirək - bu sessiya məlumatlarının tam yüklənməsi üçündür
      const redirectTimer = setTimeout(() => {
        console.log(`Redirecting user with role ${user?.role || 'unknown'} to ${from}`);
        navigate(from, { replace: true });
      }, 300);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, navigate, from, user, userRole, refreshProfile, loginAttempt]);

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
