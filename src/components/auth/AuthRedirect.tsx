import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';

/**
 * AuthRedirect komponenti - istifadəçinin roluna əsasən uyğun səhifəyə yönləndirir
 * Login olduqdan sonra istifadəçi roluna uyğun dashboard-a yönləndirilir
 */
const AuthRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Debug məlumatları
    console.log('AuthRedirect: Auth vəziyyəti yoxlanılır', { 
      isAuthenticated, 
      isLoading, 
      userRole: user?.role || 'undefined' 
    });
    
    // Əgər autentifikasiya tamamlanıbsa və istifadəçi məlumatları yüklənibsə
    if (isAuthenticated && user && !isLoading) {
      const role = user.role?.toLowerCase();
      console.log('AuthRedirect: İstifadəçi rolu əsasında yönləndirilir:', role);
      
      // Rola əsasən yönləndirmə
      if (role === 'superadmin') {
        navigate('/dashboard');
      } else if (role === 'regionadmin') {
        navigate('/region-dashboard');
      } else if (role === 'sectoradmin') {
        navigate('/sector-dashboard');
      } else if (role === 'schooladmin') {
        navigate('/school-dashboard');
      } else {
        // Default yönləndirmə
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);
  
  return null; // Bu komponent heç bir UI render etmir
};

export default AuthRedirect;
