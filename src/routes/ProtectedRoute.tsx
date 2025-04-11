
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';
import LoadingScreen from '@/components/auth/LoadingScreen';

interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  element, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('İstifadəçi autentifikasiya olunmayıb, login səhifəsinə yönləndirilir');
    }
  }, [isLoading, isAuthenticated]);

  // İstifadəçi yüklənir
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // İstifadəçi autentifikasiya olunmayıb
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: İstifadəçi login deyil, login səhifəsinə yönləndirilir');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Tələb olunan rol yoxlama
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    console.log(`ProtectedRoute: İstifadəçinin rolu (${user.role}) tələb olunan rollar (${requiredRoles.join(', ')}) arasında deyil`);
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }
  
  // İstifadəçi autentifikasiya olunub və tələb olunan rola sahibdir
  return <>{element}</>;
};

export default ProtectedRoute;
