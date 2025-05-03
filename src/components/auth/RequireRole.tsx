
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface RequireRoleProps {
  children: React.ReactNode;
  roles: string[];
  redirectTo?: string;
}

const RequireRole: React.FC<RequireRoleProps> = ({ 
  children, 
  roles, 
  redirectTo = '/dashboard' 
}) => {
  const { user } = useAuth();
  const { userRole } = usePermissions();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
