
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
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  
  useEffect(() => {
    if (redirectInProgress) return;

    // Əgər istifadəçi autentifikasiya olunubsa və yüklənmə başa çatıbsa
    if (isAuthenticated && !isLoading) {
      console.log('Authenticated user detected, preparing to redirect');
      
      // İstifadəçi məlumatları varsa və tam yüklənibsə
      if (user?.role && userRole) {
        console.log(`User has role: ${userRole}, redirecting to ${from}`);
        setRedirectInProgress(true);
        navigate(from, { replace: true });
        return;
      }
      
      // İstifadəçi məlumatları yoxdursa və ya tam yüklənməyibsə, profile update etməyə çalışaq
      if (!user?.role && loginAttempt < 3) {
        console.log('User profile data is missing, attempting to refresh...');
        setLoginAttempt(prev => prev + 1);
        refreshProfile()
          .then(updatedUser => {
            if (updatedUser && updatedUser.role) {
              console.log('Profile refreshed, user role:', updatedUser.role);
              setRedirectInProgress(true);
              navigate(from, { replace: true });
            }
          })
          .catch(err => {
            console.error('Profile refresh failed:', err);
          });
      }
    }
  }, [isAuthenticated, isLoading, navigate, from, user, userRole, refreshProfile, loginAttempt, redirectInProgress]);

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
