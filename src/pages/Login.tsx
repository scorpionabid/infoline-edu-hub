
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoadingScreen from '@/components/auth/LoadingScreen';
import LoginContainer from '@/components/auth/LoginContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { toast } from 'sonner';

const Login = () => {
  const { isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const { userRole } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Daxil olmuş istifadəçini rol əsasında yönləndirmə
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      try {
        // Sonuncu ziyarət edilmiş səhifə və ya rol əsasında yönləndirmə
        const from = location.state?.from?.pathname || '/dashboard';
        console.log(`İstifadəçi auth olundu, "${from}" səhifəsinə yönləndirilir`);
        console.log(`İstifadəçi məlumatları:`, {
          id: user.id,
          email: user.email,
          role: user.role || 'role yoxdur',
          isLoading: isLoading
        });
        
        // Rol əsasında yönləndirmə
        let targetPath = '/dashboard';
        
        // Əgər redirektin saxlanması istənilirsə, from istifadə et
        if (from !== '/login') {
          targetPath = from;
        } 
        // Əks halda, rol əsasında redirekt
        else if (user.role) {
          switch(user.role) {
            case 'superadmin':
              targetPath = '/dashboard';
              break;
            case 'regionadmin':
              targetPath = '/region-dashboard';
              break;
            case 'sectoradmin':
              targetPath = '/sector-dashboard';
              break;
            case 'schooladmin':
              targetPath = '/school-dashboard';
              break;
            default:
              targetPath = '/dashboard';
          }
          
          console.log(`Rol əsasında redirekt: ${user.role} -> ${targetPath}`);
        } else {
          console.warn('İstifadəçinin rolu yoxdur, default dashboard-a yönləndirilir');
        }
        
        // İstifadəçini yönləndir
        navigate(targetPath, { replace: true });
        
        // Xoş gəldin bildirişi
        toast.success(`${user.full_name || user.email}, xoş gəlmisiniz!`, {
          duration: 3000,
        });
      } catch (err) {
        console.error('Yönləndirmə xətası:', err);
      }
    }
  }, [isAuthenticated, isLoading, navigate, location, user]);

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
