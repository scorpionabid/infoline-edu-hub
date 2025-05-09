
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { UserRole } from '@/types/supabase';
import LoadingScreen from './LoadingScreen';

interface RequireRoleProps {
  children: React.ReactNode;
  roles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

const RequireRole: React.FC<RequireRoleProps> = ({ 
  children, 
  roles,
  fallback = <Navigate to="/login" replace />
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { hasRole } = usePermissions();
  
  // Yüklənmə zamanı yükləmə ekranı göstəririk
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // İstifadəçi autentifikasiya olunmayıbsa və ya tələb olunan rola sahib deyilsə,
  // fallback komponenti göstəririk (standart olaraq login səhifəsinə yönləndirir)
  if (!isAuthenticated || !hasRole(roles)) {
    return <>{fallback}</>;
  }

  // İstifadəçi autentifikasiya olunub və tələb olunan rola sahibdirsə,
  // uşaq komponentləri göstəririk
  return <>{children}</>;
};

export default RequireRole;
